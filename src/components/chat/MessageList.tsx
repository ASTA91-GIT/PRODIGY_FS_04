import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Message, User } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  participants: User[];
  isTyping?: string[];
  className?: string;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  participants,
  isTyping = [],
  className 
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatDateDivider = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const shouldShowDateDivider = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    return !isSameDay(currentMsg.timestamp, prevMsg.timestamp);
  };

  const shouldShowAvatar = (currentMsg: Message, nextMsg?: Message) => {
    if (!nextMsg) return true;
    return currentMsg.senderId !== nextMsg.senderId;
  };

  const getSender = (senderId: string) => {
    return participants.find(p => p.id === senderId);
  };

  const typingNames = isTyping.map(id => {
    const user = participants.find(p => p.id === id);
    return user?.name.split(' ')[0] || 'Someone';
  });

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto px-4 py-4 space-y-1',
        'bg-gradient-to-b from-background to-background/95',
        className
      )}
    >
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        const isOwn = message.senderId === currentUserId;
        const showDate = shouldShowDateDivider(message, prevMessage);
        const showAvatar = shouldShowAvatar(message, nextMessage);
        const isNewSender = !prevMessage || prevMessage.senderId !== message.senderId;

        return (
          <div key={message.id}>
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-muted/50 rounded-full">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDateDivider(message.timestamp)}
                  </span>
                </div>
              </div>
            )}
            
            <div className={cn(isNewSender && !showDate && 'mt-3')}>
              <MessageBubble
                message={message}
                isOwn={isOwn}
                sender={getSender(message.senderId)}
                showAvatar={showAvatar && !isOwn}
              />
            </div>
          </div>
        );
      })}

      {isTyping.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {participants.find(p => isTyping.includes(p.id)) && (
            <img 
              src={participants.find(p => isTyping.includes(p.id))?.avatar}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          )}
          <TypingIndicator names={typingNames} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
