import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  names?: string[];
  className?: string;
}

export function TypingIndicator({ names = [], className }: TypingIndicatorProps) {
  const displayText = () => {
    if (names.length === 0) return '';
    if (names.length === 1) return `${names[0]} is typing`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
    return `${names[0]} and ${names.length - 1} others are typing`;
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="flex gap-1 px-3 py-2 bg-muted rounded-full">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {names.length > 0 && (
        <span className="text-xs">{displayText()}</span>
      )}
    </div>
  );
}
