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
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getConversationTitle = (conv: ConversationWithPreview) => {
        if (conv.title) return conv.title;
        if (conv.last_message) {
            return conv.last_message.substring(0, 30) + (conv.last_message.length > 30 ? '...' : '');
        }
        return 'New Conversation';
    };

    return (
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-secondary-200">
            {/* Header */}
            <div className="p-4 border-b border-secondary-200">
                <Button
                    onClick={onNewConversation}
                    className="w-full flex items-center justify-center gap-2"
                    variant="primary"
                >
                    <Plus size={18} />
                    New Chat
                </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-secondary-500">
                        <div className="animate-pulse">Loading conversations...</div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-secondary-500">
                        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${activeConversationId === conv.id
                                        ? 'bg-primary-100 border border-primary-200'
                                        : 'hover:bg-secondary-50 border border-transparent'
                                    }`}
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-secondary-900 truncate">
                                            {getConversationTitle(conv)}
                                        </h3>
                                        {conv.last_message && (
                                            <p className="text-xs text-secondary-500 truncate mt-1">
                                                {conv.last_message}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-secondary-400">
                                                {formatDate(conv.updated_at)}
                                            </span>
                                            <span className="text-xs text-secondary-400">
                                                • {conv.message_count} msg{conv.message_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger-100 rounded transition-all"
                                        title="Delete conversation"
                                    >
                                        <Trash2 size={14} className="text-danger-600" />
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
