// frontend/src/components/chat/ConversationSidebar.tsx
import React from 'react';
import { ConversationWithPreview } from '@/lib/api';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConversationSidebarProps {
    conversations: ConversationWithPreview[];
    activeConversationId?: number;
    onSelectConversation: (id: number) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: number) => void;
    isLoading?: boolean;
}

export function ConversationSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    isLoading = false,
}: ConversationSidebarProps) {
    const getConversationTitle = (conv: ConversationWithPreview) => {
        if (conv.title) return conv.title;
        if (conv.last_message) {
            return conv.last_message.substring(0, 30) + (conv.last_message.length > 30 ? '...' : '');
        }
        return 'New Conversation';
    };

    return (
        <div className="flex flex-col h-full bg-secondary-50 dark:bg-secondary-950 border-r border-secondary-200 dark:border-secondary-800 transition-colors duration-200">
            {/* Header */}
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900">
                <Button
                    onClick={onNewConversation}
                    className="w-full flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-2xl py-6"
                    variant="primary"
                >
                    <Plus size={20} />
                    <span className="font-bold tracking-tight">New Chat</span>
                </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pt-4">
                <h3 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-600">
                    History
                </h3>
                {isLoading ? (
                    <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
                        <div className="animate-pulse flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                            <span className="text-sm font-medium">Loading chats...</span>
                        </div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-800 rounded-[2rem] flex items-center justify-center shadow-inner">
                            <MessageSquare className="text-secondary-400 dark:text-secondary-500" size={32} />
                        </div>
                        <h4 className="text-secondary-900 dark:text-secondary-100 font-bold mb-1">Clean slate</h4>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">Your recent chats will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group relative p-4 rounded-[2rem] cursor-pointer transition-all duration-300 border ${activeConversationId === conv.id
                                    ? 'bg-white dark:bg-secondary-800 border-primary-200 dark:border-primary-800 shadow-xl shadow-primary-500/5 ring-1 ring-primary-500/10'
                                    : 'bg-white/50 dark:bg-secondary-900/50 border-secondary-100 dark:border-secondary-800 hover:bg-white dark:hover:bg-secondary-800 hover:border-primary-100 dark:hover:border-primary-900 hover:shadow-lg hover:shadow-secondary-200/50 dark:hover:shadow-black/20'
                                    }`}
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-bold truncate transition-colors ${activeConversationId === conv.id
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-secondary-900 dark:text-secondary-100'
                                            }`}>
                                            {getConversationTitle(conv)}
                                        </h3>
                                        {conv.last_message && (
                                            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-1 leading-relaxed opacity-80">
                                                {conv.last_message}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider">
                                                    {conv.message_count} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-danger-50 dark:hover:bg-danger-900/20 text-secondary-400 hover:text-danger-600 dark:hover:text-danger-400 rounded-2xl transition-all duration-200 shrink-0 shadow-sm border border-transparent hover:border-danger-100 dark:hover:border-danger-900"
                                        title="Delete conversation"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
