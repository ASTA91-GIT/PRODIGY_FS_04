import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { Message } from '@/types/chat';
import { 
  currentUser, 
  mockConversations, 
  mockMessages 
} from '@/data/mockData';

export function ChatApp() {
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [showSidebar, setShowSidebar] = useState(true);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    // Clear unread count
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
    );
    // Hide sidebar on mobile
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, []);

  const handleSendMessage = useCallback((content: string, conversationId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update last message in conversation
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: newMessage }
          : c
      )
    );

    // Simulate status updates
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m =>
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m =>
          m.id === newMessage.id ? { ...m, status: 'seen' } : m
        ),
      }));
    }, 2000);
  }, []);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
  }, []);

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
    </div>
  );
}
