import axios from "axios";
import type {
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
  GrievanceListResponse,
  Grievance,
  CommentListResponse,
  NotificationListResponse,
  UserListResponse,
  DepartmentListResponse,
  Department,
  ChatResponse,
  User,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error || !token) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<RefreshResponse>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============= AUTH =============
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<RegisterResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>("/auth/refresh", { refreshToken }),

  logout: (refreshToken?: string) =>
    api.post("/auth/logout", refreshToken ? { refreshToken } : {}),

  getMe: () => api.get<{ user: User }>("/auth/me"),
};

// ============= GRIEVANCES =============
export const grievanceApi = {
  create: (data: {
    title: string;
    description: string;
    category: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }) => api.post<{ message: string; grievance: Grievance }>("/grievances", data),

  list: (page = 1, limit = 20) =>
    api.get<GrievanceListResponse>("/grievances", { params: { page, limit } }),

  getById: (id: string) =>
    api.get<{ grievance: Grievance }>(`/grievances/${id}`),

  update: (id: string, data: Partial<{ title: string; description: string; category: string; address: string }>) =>
    api.patch<{ message: string; grievance: Grievance }>(`/grievances/${id}`, data),

  updateStatus: (id: string, status: string, comment?: string) =>
    api.patch<{ message: string; grievance: Grievance }>(`/grievances/${id}/status`, { status, comment }),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/grievances/${id}`),

  assign: (id: string, officerId: string) =>
    api.post<{ message: string }>(`/grievances/${id}/assign`, { officerId }),

  escalate: (id: string, level: string, reason: string) =>
    api.post<{ message: string }>(`/grievances/${id}/escalate`, { level, reason }),

  reopen: (id: string, reason?: string) =>
    api.post<{ message: string; grievance: Grievance }>(`/grievances/${id}/reopen`, { reason }),
};

// ============= COMMENTS =============
export const commentApi = {
  list: (grievanceId: string, page = 1, limit = 20) =>
    api.get<CommentListResponse>(`/grievances/${grievanceId}/comments`, { params: { page, limit } }),

  create: (grievanceId: string, message: string, isInternal = false) =>
    api.post(`/grievances/${grievanceId}/comments`, { message, isInternal }),
};

// ============= ATTACHMENTS =============
export const attachmentApi = {
  list: (grievanceId: string) =>
    api.get<{ attachments: Array<{ id: string; fileName: string; fileType: string | null; fileSize: number | null; createdAt: string; uploadedBy?: { name: string } }> }>(
      `/grievances/${grievanceId}/attachments`
    ),

  upload: (grievanceId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/grievances/${grievanceId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadUrl: (grievanceId: string, attachmentId: string) =>
    `${api.defaults.baseURL}/grievances/${grievanceId}/attachments/${attachmentId}`,
};

// ============= FEEDBACK =============
export const feedbackApi = {
  list: (grievanceId: string) =>
    api.get<{ feedback: Array<{ id: string; rating: number; comment: string | null; createdAt: string; user?: { name: string } }> }>(
      `/grievances/${grievanceId}/feedback`
    ),

  create: (grievanceId: string, rating: number, comment?: string) =>
    api.post(`/grievances/${grievanceId}/feedback`, { rating, comment }),
};

// ============= NOTIFICATIONS =============
export const notificationApi = {
  list: (page = 1, limit = 20) =>
    api.get<NotificationListResponse>("/notifications", { params: { page, limit } }),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
};

// ============= USERS =============
export const userApi = {
  updateProfile: (name: string) =>
    api.patch<{ message: string; user: User }>("/users/me", { name }),

  list: (page = 1, limit = 20) =>
    api.get<UserListResponse>("/users", { params: { page, limit } }),

  getById: (id: string) =>
    api.get<{ user: User }>(`/users/${id}`),

  updateRoleOrDept: (id: string, data: { role?: string; departmentId?: string | null }) =>
    api.patch<{ message: string; user: User }>(`/users/${id}`, data),
};

// ============= DEPARTMENTS =============
export const departmentApi = {
  list: () =>
    api.get<DepartmentListResponse>("/departments"),

  getById: (id: string) =>
    api.get<{ department: Department }>(`/departments/${id}`),

  create: (data: { name: string; code?: string; description?: string }) =>
    api.post<{ message: string; department: Department }>("/departments", data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<{ message: string; department: Department }>(`/departments/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/departments/${id}`),
};

// ============= CHAT =============
export const chatApi = {
  send: (message: string) =>
    api.post<ChatResponse>("/chat", { message }),
};

// ============= HEALTH =============
export const healthApi = {
  check: () => api.get("/health"),
};

export default api;
