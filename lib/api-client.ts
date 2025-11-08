interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  status?: number;
}

export class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private authToken: string | null = null;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    this.defaultTimeout = timeout || parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000");
    
    // Try to load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        this.authToken = localStorage.getItem('auth_token');
      } catch (e) {
        // localStorage might not be available in some environments
      }
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token && typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', token);
      } catch (e) {
        // localStorage might not be available
      }
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('user_role');
      } catch (e) {
        // localStorage might not be available
      }
    }
  }

  async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    // Add Authorization header if token exists
    if (this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (response.status === 401) {
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}`;
        throw new ApiError(errorMessage, response.status);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new ApiError('Request timeout. Please try again.');
        }
        if (error.name === 'AbortError') {
          throw new ApiError('Request was cancelled.');
        }
        throw new ApiError(error.message);
      }
      
      throw new ApiError('An unexpected error occurred.');
    }
  }
}

// Create a default client instance
export const apiClient = new ApiClient();
