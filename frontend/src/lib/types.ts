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
  completed?: boolean;
}
