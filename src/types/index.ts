export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  downloadsThisMonth: number;
  lastResetDate: string;
  isPremium: boolean;
  selectedPlan?: 'monthly' | 'quarterly' | 'yearly' | null;
  planExpiryDate?: string;
}

export interface Draft {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  category: string;
  tags: string[];
  downloadCount: number;
  isPublished: boolean;
  createdBy: string;
  fileContent?: string;
  fileType?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface Plan {
  id: 'monthly' | 'quarterly' | 'yearly';
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  downloads: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}