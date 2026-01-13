// frontend/src/components/chat/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

const MAX_MESSAGE_LENGTH = 1000;

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // T044: Client-side message length validation
    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setError(null);
    const currentMessage = message;
    setMessage('');
    await onSendMessage(currentMessage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Real-time validation feedback
    if (value.length > MAX_MESSAGE_LENGTH) {
      setError(`Message is ${value.length - MAX_MESSAGE_LENGTH} characters too long`);
    } else if (value.length > MAX_MESSAGE_LENGTH * 0.9) {
      setError(`${MAX_MESSAGE_LENGTH - value.length} characters remaining`);
    } else {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <Input
        ref={inputRef}
        value={message}
        onChange={handleChange}
        // T037: Placeholder text for task-id commands
        placeholder="Ask me to create, list, complete, or update tasks... (e.g., 'complete task 3')"
        disabled={isLoading}
        className="pr-12 py-6 rounded-2xl shadow-sm border-secondary-200 focus:ring-primary-500"
        maxLength={MAX_MESSAGE_LENGTH + 10} // Allow typing but show error
        error={error || undefined}
      />
      <div className="absolute right-2">
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isLoading || !!error}
          className="rounded-xl h-10 w-10 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      {/* T044: Show error indicator */}
      {error && (
        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-sm text-danger-600">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
