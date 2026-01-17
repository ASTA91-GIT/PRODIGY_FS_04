import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Conversation, User } from '@/types/chat';
import { Avatar } from './Avatar';
import { ConversationItem } from './ConversationItem';
import { 
  Search, 
  Plus, 
  Settings, 
  MessageSquare,
  Users,
  Bell,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat?: () => void;
  onSignOut?: () => void;
  loading?: boolean;
  className?: string;
}

export function Sidebar({ 
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onSignOut,
  loading = false,
  className
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'unread') return matchesSearch && conv.unreadCount > 0;
    if (activeTab === 'groups') return matchesSearch && conv.type === 'group';
    return matchesSearch;
  });

  return (
    <div className={cn(
      'flex flex-col h-full bg-sidebar border-r border-sidebar-border',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={currentUser} size="md" showStatus />
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm truncate">{currentUser.name}</h1>
              <p className="text-xs text-muted-foreground truncate">{currentUser.bio}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-sidebar-accent transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-sidebar-accent transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-sidebar-accent transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-sidebar-accent rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-sidebar-border">
        {[
          { id: 'all', label: 'All', icon: MessageSquare },
          { id: 'unread', label: 'Unread', icon: Bell },
          { id: 'groups', label: 'Groups', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === tab.id 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-sidebar-accent'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new chat to get going!
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              currentUserId={currentUser.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-glow"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
    </div>
  );
}
