import { cn } from '@/lib/utils';
import { User } from '@/types/chat';

interface AvatarProps {
  user?: User;
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const statusSizeClasses = {
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

const statusPositionClasses = {
  sm: 'bottom-0 right-0',
  md: 'bottom-0 right-0',
  lg: 'bottom-0.5 right-0.5',
  xl: 'bottom-1 right-1',
};

export function Avatar({ 
  user, 
  src, 
  name,
  size = 'md', 
  showStatus = false,
  className 
}: AvatarProps) {
  const avatarSrc = src || user?.avatar;
  const displayName = name || user?.name || 'User';
  const status = user?.status;

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-online';
      case 'away':
        return 'bg-warning';
      case 'busy':
        return 'bg-destructive';
      default:
        return 'bg-offline';
    }
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <div 
        className={cn(
          'rounded-full overflow-hidden bg-muted flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground font-medium">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {showStatus && status && (
        <span 
          className={cn(
            'absolute rounded-full border-background',
            statusSizeClasses[size],
            statusPositionClasses[size],
            getStatusColor(),
            status === 'online' && 'pulse-online'
          )}
        />
      )}
    </div>
  );
}
