import { cn } from '@/lib/utils';
import { Message, User } from '@/types/chat';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender?: User;
  showAvatar?: boolean;
  onReact?: (emoji: string) => void;
}

const quickReactions = ['❤️', '😂', '👍', '🔥', '😮', '😢'];

export function MessageBubble({ 
  message, 
  isOwn, 
  sender,
  showAvatar = false,
  onReact 
}: MessageBubbleProps) {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        'group flex gap-2 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse slide-in-right' : 'mr-auto slide-in-left'
      )}
    >
      {showAvatar && !isOwn && sender && (
        <img 
          src={sender.avatar} 
          alt={sender.name}
          className="w-8 h-8 rounded-full self-end"
        />
      )}
      
      <div className="flex flex-col gap-1">
        {!isOwn && sender && showAvatar && (
          <span className="text-xs text-muted-foreground ml-1">
            {sender.name}
          </span>
        )}
        
        <div className="relative">
          <div 
            className={cn(
              'px-4 py-2.5 shadow-sm transition-all',
              isOwn ? 'message-bubble-own' : 'message-bubble-other'
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            <div className={cn(
              'flex items-center gap-1.5 mt-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}>
              <span className={cn(
                'text-[10px]',
                isOwn ? 'text-white/70' : 'text-muted-foreground'
              )}>
                {format(message.timestamp, 'HH:mm')}
              </span>
              {isOwn && getStatusIcon()}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={cn(
              'absolute -bottom-3 flex gap-0.5',
              isOwn ? 'right-2' : 'left-2'
            )}>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded-full border border-border shadow-sm">
                {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, i) => (
                  <span key={i} className="text-xs">{emoji}</span>
                ))}
                {message.reactions.length > 1 && (
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    {message.reactions.length}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick reactions on hover */}
          <div className={cn(
            'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 px-2 py-1 bg-card rounded-full border border-border shadow-lg z-10',
            isOwn ? 'right-full mr-2' : 'left-full ml-2'
          )}>
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact?.(emoji)}
                className="text-sm hover:scale-125 transition-transform p-0.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
