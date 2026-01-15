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
      "flex gap-4 p-5 rounded-[2rem] transition-all duration-300 animate-slide-up shadow-sm border border-transparent",
      isUser
        ? "bg-white dark:bg-secondary-800 ml-12 border-secondary-100 dark:border-secondary-700 shadow-secondary-200/50 dark:shadow-black/20"
        : "bg-primary-50/50 dark:bg-primary-900/20 mr-12 border-primary-100/50 dark:border-primary-900/30"
    )}>
      <div className={cn(
        "flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-105",
        isUser
          ? "bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300"
          : "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
      )}>
        {isUser ? <User size={22} /> : <Bot size={22} />}
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        <p className="text-[10px] font-bold text-secondary-500 dark:text-secondary-500 uppercase tracking-[0.15em]">
          {isUser ? 'You' : 'Assistant'}
        </p>
        <div className="prose prose-sm max-w-none text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap leading-relaxed">
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
