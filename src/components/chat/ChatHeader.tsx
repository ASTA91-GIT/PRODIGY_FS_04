import { cn } from '@/lib/utils';
import { Conversation, User } from '@/types/chat';
import { Avatar } from './Avatar';
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  Users,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  className?: string;
}

export function ChatHeader({ 
  conversation, 
  currentUserId,
  onBack,
  className 
}: ChatHeaderProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  const isGroup = conversation.type === 'group';
  const isTyping = conversation.isTyping && conversation.isTyping.length > 0;

  const displayName = isGroup 
    ? conversation.name 
    : otherParticipant?.name || 'Unknown';

  const getStatusText = () => {
    if (isTyping) {
      const typingNames = conversation.isTyping?.map(id => {
        const user = conversation.participants.find(p => p.id === id);
        return user?.name.split(' ')[0];
      }).filter(Boolean) || [];
      
      if (typingNames.length === 1) return `${typingNames[0]} is typing...`;
      return 'typing...';
    }

    if (isGroup) {
      return `${conversation.participants.length} members`;
    }

    if (otherParticipant?.status === 'online') {
      return 'online';
    }

    if (otherParticipant?.lastSeen) {
      return `last seen ${formatDistanceToNow(otherParticipant.lastSeen, { addSuffix: true })}`;
    }

    return 'offline';
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm',
      className
    )}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {conversation.avatar ? (
              <img src={conversation.avatar} alt={displayName} className="w-full h-full rounded-full" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
        ) : (
          <Avatar user={otherParticipant} size="md" showStatus />
        )}

        <div>
          <h2 className="font-semibold text-sm">{displayName}</h2>
          <p className={cn(
            'text-xs',
            isTyping ? 'text-primary' : 'text-muted-foreground'
          )}>
            {getStatusText()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Search className="w-5 h-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Search in conversation</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Clear chat</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Block user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
