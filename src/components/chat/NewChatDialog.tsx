import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare } from 'lucide-react';

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

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Profile[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  users,
  currentUserId,
  onSelectUser,
}: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.user_id !== currentUserId &&
      (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Start a New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No users found' : 'No other users yet'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.user_id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="relative">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                    alt={user.display_name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                      getStatusColor(user.status)
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.display_name || user.username || 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.bio || 'No bio'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
