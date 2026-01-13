// frontend/src/components/chat/ChatMessage.tsx
import React from 'react';
import { cn } from '@/lib/cn';
import { User, Bot, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  // Check if content contains task-related keywords for dashboard link
  const showDashboardLink = !isUser && (
    content.toLowerCase().includes('task') ||
    content.toLowerCase().includes('created') ||
    content.toLowerCase().includes('completed') ||
    content.toLowerCase().includes('deleted') ||
    content.toLowerCase().includes('updated')
  );

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-2xl transition-all duration-300 animate-slide-up",
      isUser ? "bg-white/50 ml-12" : "bg-primary-50/50 mr-12"
    )}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
        isUser ? "bg-secondary-100 text-secondary-600" : "bg-primary-100 text-primary-600"
      )}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      <div className="flex-1 space-y-2">
        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">
          {isUser ? 'You' : 'Assistant'}
        </p>
        <div className="prose prose-sm max-w-none text-secondary-800 whitespace-pre-wrap">
          {content}
        </div>
        {/* T036: Dashboard link for task-related responses */}
        {showDashboardLink && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ExternalLink size={14} />
            View in Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
