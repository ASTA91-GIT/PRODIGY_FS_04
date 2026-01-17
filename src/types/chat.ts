export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  bio?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  reactions?: Reaction[];
  replyTo?: string;
  edited?: boolean;
  attachments?: Attachment[];
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: string[];
  createdAt: Date;
}

export interface ChatState {
  currentUser: User | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
}
