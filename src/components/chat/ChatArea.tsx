import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Conversation, Message, User } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MessageSquare } from 'lucide-react';

interface ChatAreaProps {
  conversation?: Conversation;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, conversationId: string) => void;
  onBack?: () => void;
  className?: string;
}

export function ChatArea({ 
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onBack,
  className
}: ChatAreaProps) {
  const [localTyping, setLocalTyping] = useState(false);

  const handleSend = useCallback((content: string) => {
    if (conversation) {
      onSendMessage(content, conversation.id);
    }
  }, [conversation, onSendMessage]);

  const handleTyping = useCallback(() => {
    if (!localTyping) {
      setLocalTyping(true);
      // Reset typing indicator after 3 seconds
      setTimeout(() => setLocalTyping(false), 3000);
    }
  }, [localTyping]);

  if (!conversation) {
    return (
      <div className={cn(
        'flex-1 flex flex-col items-center justify-center bg-background/50',
        className
      )}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to ChatFlow</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Select a conversation from the sidebar or start a new chat to begin messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 flex flex-col bg-background/50', className)}>
      <ChatHeader 
        conversation={conversation}
        currentUserId={currentUser.id}
        onBack={onBack}
      />
      
      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        participants={conversation.participants}
        isTyping={conversation.isTyping}
      />
      
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        placeholder={`Message ${conversation.type === 'group' ? conversation.name : conversation.participants.find(p => p.id !== currentUser.id)?.name}`}
      />
    </div>
  );
}
