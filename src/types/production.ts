export interface Product {
  id: string;
  name: string;
  weightPerBag: number; // kg
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'packaging' | 'bagging';
  boxNumber?: 1 | 2; // for bagging team
}

export interface ProductionRecord {
  id: string;
  date: string;
  time: string;
  boxNumber: 1 | 2;
  productId: string;
  quantity: number;
  observations?: string;
  timestamp: number;
}

export interface PackagingRecord {
  id: string;
  date: string;
  collaboratorId: string;
  quantity: number;
  productId?: string;
  timestamp: number;
}

export interface StopRecord {
  id: string;
  sector: 'box1' | 'box2' | 'packaging';
  startTime: string;
  endTime?: string;
  reason: string;
  duration?: number; // minutes
  isActive: boolean;
  timestamp: number;
}

export type TabType = 'dashboard' | 'production' | 'packaging' | 'stops' | 'reports' | 'settings';