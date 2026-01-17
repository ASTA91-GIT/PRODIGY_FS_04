import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤔', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😠', '😡'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Objects': ['🎉', '🎊', '🎁', '🎈', '🔥', '⭐', '✨', '💫', '🌟', '💥', '💢', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🎵', '🎶', '💯', '🔔', '📱', '💻', '⌨️', '🖥️', '🖨️'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🧀', '🥗', '🍜', '🍝', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍩', '🍪', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉'],
};

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('Smileys');
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            'p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground',
            className
          )}
        >
          <Smile className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card border-border" 
        align="start"
        side="top"
      >
        <div className="flex border-b border-border overflow-x-auto">
          {Object.keys(emojiCategories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors',
                activeCategory === category 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="p-2 h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
