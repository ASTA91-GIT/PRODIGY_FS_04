import { cn } from '@/lib/utils';
import { Conversation } from '@/types/chat';
import { Avatar } from './Avatar';
import { TypingIndicator } from './TypingIndicator';
import { format, isToday, isYesterday } from 'date-fns';
import { Users } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ConversationItem({ 
  conversation, 
  isActive, 
  currentUserId,
  onClick 
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  const isGroup = conversation.type === 'group';
  const isTyping = conversation.isTyping && conversation.isTyping.length > 0;
  
  const displayName = isGroup 
    ? conversation.name 
    : otherParticipant?.name || 'Unknown';
  
  const displayAvatar = isGroup 
    ? conversation.avatar 
    : otherParticipant?.avatar;

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'dd/MM');
  };

  const typingNames = conversation.isTyping?.map(id => {
    const user = conversation.participants.find(p => p.id === id);
    return user?.name.split(' ')[0] || 'Someone';
  }) || [];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        'hover:bg-sidebar-accent',
        isActive && 'bg-sidebar-accent border-l-2 border-primary'
      )}
    >
      <div className="relative">
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
        ) : (
          <Avatar 
            user={otherParticipant} 
            size="lg" 
            showStatus 
          />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{displayName}</span>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {isTyping ? (
            <div className="flex items-center gap-1">
              <span className="flex gap-0.5">
                <span className="typing-dot w-1.5 h-1.5" />
                <span className="typing-dot w-1.5 h-1.5" />
                <span className="typing-dot w-1.5 h-1.5" />
              </span>
              <span className="text-xs text-primary">
                {typingNames.length === 1 ? `${typingNames[0]} is typing` : 'typing...'}
              </span>
            </div>
          ) : conversation.lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage.senderId === currentUserId && (
                <span className="text-muted-foreground/70">You: </span>
              )}
              {conversation.lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No messages yet</p>
          )}

          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
