import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { NewChatDialog } from './NewChatDialog';
import { Message, Conversation } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string | null;
}

export function ChatApp() {
  const { user, profile, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const currentUser = {
    id: user?.id || '',
    name: profile?.display_name || user?.email?.split('@')[0] || 'User',
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
    status: (profile?.status || 'online') as 'online' | 'offline' | 'away' | 'busy',
    bio: profile?.bio || 'Hey there! I am using ChatFlow',
  };

  // Fetch all users for new chat
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id);
      
      if (!error && data) {
        setAllUsers(data as Profile[]);
      }
    };
    
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const { data: participations, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations:conversation_id (
            id,
            type,
            name,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching conversations:', error);
        setLoadingConversations(false);
        return;
      }

      if (participations && participations.length > 0) {
        const convIds = participations.map(p => p.conversation_id);
        
        // Fetch participants for each conversation
        const { data: allParticipants } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            user_id,
            profiles:user_id (
              id,
              user_id,
              display_name,
              avatar_url,
              status,
              last_seen,
              bio
            )
          `)
          .in('conversation_id', convIds);

        // Fetch last messages
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false });

        const conversationsData: Conversation[] = participations
          .filter(p => p.conversations)
          .map(p => {
            const conv = p.conversations as any;
            const participants = allParticipants
              ?.filter(ap => ap.conversation_id === conv.id)
              .map(ap => {
                const prof = ap.profiles as any;
                return {
                  id: prof.user_id,
                  name: prof.display_name || 'User',
                  avatar: prof.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.user_id}`,
                  status: prof.status || 'offline',
                  lastSeen: prof.last_seen ? new Date(prof.last_seen) : undefined,
                  bio: prof.bio,
                };
              }) || [];

            const lastMsg = lastMessages?.find(m => m.conversation_id === conv.id);

            return {
              id: conv.id,
              type: conv.type,
              name: conv.name,
              avatar: conv.avatar_url,
              participants,
              lastMessage: lastMsg ? {
                id: lastMsg.id,
                content: lastMsg.content || '',
                senderId: lastMsg.sender_id,
                timestamp: new Date(lastMsg.created_at),
                status: lastMsg.status as any,
              } : undefined,
              unreadCount: 0, // TODO: Calculate unread count
              createdAt: new Date(conv.created_at),
            };
          });

        setConversations(conversationsData);
      }
      
      setLoadingConversations(false);
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const msgs: Message[] = data.map(m => ({
          id: m.id,
          content: m.content || '',
          senderId: m.sender_id,
          timestamp: new Date(m.created_at),
          status: m.status as any,
          edited: m.is_edited,
        }));
        
        setMessages(prev => ({ ...prev, [activeConversationId]: msgs }));
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          const message: Message = {
            id: newMsg.id,
            content: newMsg.content || '',
            senderId: newMsg.sender_id,
            timestamp: new Date(newMsg.created_at),
            status: newMsg.status,
            edited: newMsg.is_edited,
          };

          setMessages(prev => ({
            ...prev,
            [activeConversationId]: [...(prev[activeConversationId] || []), message],
          }));

          // Update last message in conversations
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConversationId
                ? { ...c, lastMessage: message }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
    );
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string, conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        status: 'sent',
      });

    if (error) {
      toast.error('Failed to send message');
    }
  }, [user]);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
  }, []);

  const handleCreateConversation = useCallback(async (selectedUserId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const existingConv = conversations.find(c => 
      c.type === 'private' && 
      c.participants.some(p => p.id === selectedUserId)
    );

    if (existingConv) {
      setActiveConversationId(existingConv.id);
      setShowNewChat(false);
      return;
    }

    // Create new conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'private',
        created_by: user.id,
      })
      .select()
      .single();

    if (convError || !convData) {
      toast.error('Failed to create conversation');
      return;
    }

    // Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: convData.id, user_id: user.id, role: 'admin' },
        { conversation_id: convData.id, user_id: selectedUserId, role: 'member' },
      ]);

    if (partError) {
      toast.error('Failed to add participants');
      return;
    }

    // Refresh conversations
    const selectedUser = allUsers.find(u => u.user_id === selectedUserId);
    const newConv: Conversation = {
      id: convData.id,
      type: 'private',
      participants: [
        currentUser,
        {
          id: selectedUserId,
          name: selectedUser?.display_name || 'User',
          avatar: selectedUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserId}`,
          status: (selectedUser?.status || 'offline') as any,
          bio: selectedUser?.bio || undefined,
        },
      ],
      unreadCount: 0,
      createdAt: new Date(),
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(convData.id);
    setShowNewChat(false);
    toast.success('Conversation created!');
  }, [user, conversations, allUsers, currentUser]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        'w-full lg:w-80 xl:w-96 flex-shrink-0 transition-all duration-300',
        'absolute lg:relative z-10 h-full',
        showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <Sidebar
          currentUser={currentUser}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={() => setShowNewChat(true)}
          onSignOut={handleSignOut}
          loading={loadingConversations}
        />
      </div>

      {/* Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0',
        'absolute lg:relative z-0 h-full w-full lg:w-auto',
        !showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        <ChatArea
          conversation={activeConversation}
          messages={activeMessages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
        />
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        users={allUsers}
        currentUserId={user?.id || ''}
        onSelectUser={handleCreateConversation}
      />
    </div>
  );
}
