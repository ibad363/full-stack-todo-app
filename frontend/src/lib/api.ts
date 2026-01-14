export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TaskBase {
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
}

export interface TaskRead extends TaskBase {
  id: number;
  user_id: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface TaskCreate extends TaskBase {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

// Chat interfaces
export interface ChatRequest {
  message: string;
  conversation_id?: number;
  model?: string;
}

export interface ChatToolCall {
  tool: 'add_task' | 'list_tasks' | 'complete_task' | 'delete_task' | 'update_task';
  status: 'success' | 'error';
  task_id?: number;
  error?: string;
  task_count?: number; // For list_tasks
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ChatToolCall[];
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    // Set cookie for 7 days
    const d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    // Use SameSite=None;Secure for proper cross-origin cookie handling
    // This ensures the cookie is immediately available for middleware checks
    document.cookie = `access_token=${token};${expires};path=/;SameSite=None;Secure`;
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  /**
   * Helper to parse JWT payload (no external lib needed for simple decoding).
   */
  private parseJwt(token: string): { sub: string; exp: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get current authenticated user ID from JWT token.
   * Returns null if not logged in or token invalid.
   */
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.parseJwt(token);
    return decoded && decoded.sub ? parseInt(decoded.sub, 10) : null;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 - Unauthorized: redirect to login
    if (response.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - please log in again');
    }

    // 403 - Forbidden: show forbidden message
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({ detail: 'Access denied' }));
      throw new Error(errorData.detail || 'You do not have permission to access this resource');
    }

    // 404 - Not Found: show not found message
    if (response.status === 404) {
      const errorData = await response.json().catch(() => ({ detail: 'Resource not found' }));
      throw new Error(errorData.detail || 'The requested resource was not found');
    }

    // 422 - Validation Error: show validation errors
    if (response.status === 422) {
      const errorData = await response.json().catch(() => ({ detail: 'Validation error' }));
      if (errorData.detail) {
        const messages = Array.isArray(errorData.detail)
          ? errorData.detail.map((e: any) => e.msg || e.message).join(', ')
          : errorData.detail;
        throw new Error(`Validation error: ${messages}`);
      }
      throw new Error('Please check your input and try again');
    }

    // 500 - Internal Server Error: show generic error
    if (response.status >= 500) {
      throw new Error('Server error - please try again later');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(errorData.detail || response.statusText);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => { });
    this.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Task API methods
  async listTasks(): Promise<TaskRead[]> {
    return this.request<TaskRead[]>('/tasks');
  }

  async createTask(data: TaskCreate): Promise<TaskRead> {
    return this.request<TaskRead>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTask(taskId: number): Promise<TaskRead> {
    return this.request<TaskRead>(`/tasks/${taskId}`);
  }

  async updateTask(taskId: number, data: TaskUpdate): Promise<TaskRead> {
    return this.request<TaskRead>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleTask(taskId: number): Promise<TaskRead> {
    return this.request<TaskRead>(`/tasks/${taskId}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    await this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Chat API methods
  async chatMessage(message: string, conversationId?: number, model?: string): Promise<ChatResponse> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.request<ChatResponse>(`/${userId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        model
      }),
    });
  }
}

export const api = new ApiClient();
