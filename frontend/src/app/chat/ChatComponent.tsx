// frontend/src/app/chat/ChatComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { api, ChatResponse, ConversationWithPreview } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// T038: Pending delete confirmation state
interface PendingDelete {
  messageId: string;
  taskId: number;
  taskTitle: string;
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  // T038: Store pending delete action
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  // T043: Track error state for better UX
  const [lastError, setLastError] = useState<{ code: string; message: string } | null>(null);
  // Model selection state
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  // Conversation list state
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available models
  const availableModels = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ];

  // Load conversation ID, model, and conversation list from storage/API on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('chat_conversation_id');
    if (savedConversationId) {
      setConversationId(parseInt(savedConversationId, 10));
    }
    const savedModel = localStorage.getItem('chat_selected_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    // Load conversations
    loadConversations();
  }, []);

  // Persist conversation ID and model to local storage
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('chat_conversation_id', conversationId.toString());
    }
  }, [conversationId]);

  useEffect(() => {
    localStorage.setItem('chat_selected_model', selectedModel);
  }, [selectedModel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations from API
  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const convos = await api.listConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load messages for a conversation
  const loadConversationMessages = async (convId: number) => {
    try {
      const msgs = await api.getConversationMessages(convId);
      setMessages(
        msgs.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
        }))
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (convId: number) => {
    setConversationId(convId);
    localStorage.setItem('chat_conversation_id', convId.toString());
    await loadConversationMessages(convId);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    localStorage.removeItem('chat_conversation_id');
  };

  // Handle delete conversation
  const handleDeleteConversation = async (convId: number) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await api.deleteConversation(convId);
      // If deleting active conversation, start new one
      if (convId === conversationId) {
        handleNewConversation();
      }
      // Reload conversations
      await loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  // T038: Check if message suggests a delete operation
  const suggestsDelete = (content: string): boolean => {
    const lower = content.toLowerCase();
    return (
      lower.includes('delete') ||
      lower.includes('remove') ||
      lower.includes('cancel') ||
      lower.includes('get rid of')
    );
  };

  // T038: Extract potential task ID from message
  const extractTaskId = (content: string): number | null => {
    const taskIdMatch = content.match(/task\s+(\d+)/i);
    if (taskIdMatch) {
      return parseInt(taskIdMatch[1], 10);
    }
    // Also try just numbers that might be task IDs
    const numberMatch = content.match(/\b(\d{1,3})\b/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10);
    }
    return null;
  };

  const handleSendMessage = async (content: string) => {
    // T038: Check for potential delete command
    if (suggestsDelete(content)) {
      const taskId = extractTaskId(content);
      if (taskId) {
        // Show confirmation dialog instead of sending immediately
        setPendingDelete({
          messageId: Date.now().toString(),
          taskId,
          taskTitle: `Task ${taskId}`,
        });
        return;
      }
    }

    await sendMessage(content);
  };

  // T038: Confirm delete action
  const confirmDelete = async () => {
    if (pendingDelete) {
      // Add user confirmation as a message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Yes, delete ${pendingDelete.taskTitle}`,
      };
      setMessages((prev) => [...prev, confirmMessage]);
      setPendingDelete(null);

      // Send the actual delete command
      await sendMessage(`Delete ${pendingDelete.taskTitle}`);
    }
  };

  // T038: Cancel delete action
  const cancelDelete = () => {
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'No, cancel that delete request',
    };
    setMessages((prev) => [...prev, cancelMessage]);
    setPendingDelete(null);
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setLastError(null);

    try {
      const response: ChatResponse = await api.chatMessage(content, conversationId, selectedModel);

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Reload conversations to update the list
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // T043: Better error handling for different error types
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      let errorCode = 'UNKNOWN';

      if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorCode = 'UNAUTHORIZED';
          errorMessage = 'Your session has expired. Please log in again.';
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else if (error.message.includes('403') || error.message.includes('Access denied')) {
          errorCode = 'FORBIDDEN';
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('429') || error.message.includes('Rate limit')) {
          errorCode = 'RATE_LIMIT';
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (error.message.includes('422') || error.message.includes('Validation')) {
          errorCode = 'VALIDATION';
          errorMessage = error.message; // Show specific validation error
        } else if (error.message.includes('500') || error.message.includes('Server error')) {
          errorCode = 'SERVER_ERROR';
          errorMessage = 'Server error. Please try again later.';
        }
      }

      setLastError({ code: errorCode, message: errorMessage });

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // T043: Retry last message
  const handleRetry = () => {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Conversation Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col flex-1 bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden rounded-[2rem]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl flex items-center justify-center mb-6 animate-pulse-slow">
                <span className="text-4xl">👋</span>
              </div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-2">Hello!</h3>
              <p className="text-secondary-500 max-w-sm">
                I'm your AI assistant. Ask me to create tasks, list your pending items, or help you organize your day.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}

          {/* T043: Show loading indicator during API call */}
          {isLoading && (
            <div className="flex gap-4 p-4 rounded-2xl bg-primary-50/50 mr-12 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600">AI</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-secondary-500 uppercase">Assistant</p>
                <div className="flex items-center gap-2 text-secondary-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* T038: Delete confirmation dialog */}
        {pendingDelete && (
          <div className="p-4 bg-warning-50 border-t border-warning-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning-800">
                  Delete {pendingDelete.taskTitle}?
                </p>
                <p className="text-sm text-warning-600 mt-1">
                  This action cannot be undone. Are you sure?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={confirmDelete}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <button
                onClick={cancelDelete}
                className="text-warning-600 hover:text-warning-800"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* T043: Show error banner if there was an error */}
        {lastError && lastError.code !== 'UNAUTHORIZED' && (
          <div className="p-3 bg-danger-50 border-t border-danger-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-danger-700">
                {lastError.message}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRetry}
                className="text-danger-600 hover:text-danger-700"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white/50 border-t border-secondary-100 backdrop-blur-sm space-y-3">
          {/* Model Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="model-select" className="text-sm font-medium text-secondary-700">
              Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {availableModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </Card>
    </div>
  );
}
