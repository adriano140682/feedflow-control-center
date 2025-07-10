import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, TeamMember, ProductionRecord, PackagingRecord, StopRecord } from '@/types/production';

interface ProductionContextType {
  // Data
  products: Product[];
  teamMembers: TeamMember[];
  productionRecords: ProductionRecord[];
  packagingRecords: PackagingRecord[];
  stopRecords: StopRecord[];
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  addProductionRecord: (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => void;
  addPackagingRecord: (record: Omit<PackagingRecord, 'id' | 'timestamp'>) => void;
  addStopRecord: (record: Omit<StopRecord, 'id' | 'timestamp'>) => void;
  endStopRecord: (id: string) => void;
  deleteRecord: (type: 'production' | 'packaging' | 'stop', id: string) => void;
  
  // Computed values
  getDailyProduction: (date: string) => { box1: number; box2: number; total: number };
  getHourlyProduction: (date: string) => Array<{ hour: string; box1: number; box2: number }>;
  getActiveStops: () => StopRecord[];
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Ração Bovina', weightPerBag: 30 },
    { id: '2', name: 'Proteinado', weightPerBag: 25 },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Maria Silva', role: 'packaging' },
    { id: '2', name: 'Ana Costa', role: 'packaging' },
    { id: '3', name: 'João Santos', role: 'bagging', boxNumber: 1 },
    { id: '4', name: 'Pedro Lima', role: 'bagging', boxNumber: 2 },
  ]);

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [packagingRecords, setPackagingRecords] = useState<PackagingRecord[]>([]);
  const [stopRecords, setStopRecords] = useState<StopRecord[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('production-products');
    const savedMembers = localStorage.getItem('production-members');
    const savedProduction = localStorage.getItem('production-records');
    const savedPackaging = localStorage.getItem('packaging-records');
    const savedStops = localStorage.getItem('stop-records');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedMembers) setTeamMembers(JSON.parse(savedMembers));
    if (savedProduction) setProductionRecords(JSON.parse(savedProduction));
    if (savedPackaging) setPackagingRecords(JSON.parse(savedPackaging));
    if (savedStops) setStopRecords(JSON.parse(savedStops));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('production-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('production-members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('production-records', JSON.stringify(productionRecords));
  }, [productionRecords]);

  useEffect(() => {
    localStorage.setItem('packaging-records', JSON.stringify(packagingRecords));
  }, [packagingRecords]);

  useEffect(() => {
    localStorage.setItem('stop-records', JSON.stringify(stopRecords));
  }, [stopRecords]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember = { ...member, id: Date.now().toString() };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const addProductionRecord = (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => {
    const newRecord = { 
      ...record, 
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setProductionRecords(prev => [...prev, newRecord]);
  };

  const addPackagingRecord = (record: Omit<PackagingRecord, 'id' | 'timestamp'>) => {
    const newRecord = { 
      ...record, 
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setPackagingRecords(prev => [...prev, newRecord]);
  };

  const addStopRecord = (record: Omit<StopRecord, 'id' | 'timestamp'>) => {
    const newRecord = { 
      ...record, 
      id: Date.now().toString(),
      timestamp: Date.now(),
      isActive: true
    };
    setStopRecords(prev => [...prev, newRecord]);
  };

  const endStopRecord = (id: string) => {
    setStopRecords(prev => prev.map(stop => {
      if (stop.id === id && stop.isActive) {
        const endTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const start = new Date(`1970-01-01T${stop.startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        
        return {
          ...stop,
          endTime,
          duration,
          isActive: false
        };
      }
      return stop;
    }));
  };

  const deleteRecord = (type: 'production' | 'packaging' | 'stop', id: string) => {
    switch (type) {
      case 'production':
        setProductionRecords(prev => prev.filter(r => r.id !== id));
        break;
      case 'packaging':
        setPackagingRecords(prev => prev.filter(r => r.id !== id));
        break;
      case 'stop':
        setStopRecords(prev => prev.filter(r => r.id !== id));
        break;
    }
  };

  const getDailyProduction = (date: string) => {
    const dayRecords = productionRecords.filter(r => r.date === date);
    const box1Total = dayRecords.filter(r => r.boxNumber === 1).reduce((sum, r) => sum + r.quantity, 0);
    const box2Total = dayRecords.filter(r => r.boxNumber === 2).reduce((sum, r) => sum + r.quantity, 0);
    
    return {
      box1: box1Total,
      box2: box2Total,
      total: box1Total + box2Total
    };
  };

  const getHourlyProduction = (date: string) => {
    const dayRecords = productionRecords.filter(r => r.date === date);
    const hourlyData: { [hour: string]: { box1: number; box2: number } } = {};
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      hourlyData[`${hourStr}:00`] = { box1: 0, box2: 0 };
    }
    
    dayRecords.forEach(record => {
      const hour = record.time.substring(0, 2) + ':00';
      if (record.boxNumber === 1) {
        hourlyData[hour].box1 += record.quantity;
      } else {
        hourlyData[hour].box2 += record.quantity;
      }
    });
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      box1: data.box1,
      box2: data.box2
    }));
  };

  const getActiveStops = () => {
    return stopRecords.filter(stop => stop.isActive);
  };

  const value: ProductionContextType = {
    products,
    teamMembers,
    productionRecords,
    packagingRecords,
    stopRecords,
    addProduct,
    addTeamMember,
    addProductionRecord,
    addPackagingRecord,
    addStopRecord,
    endStopRecord,
    deleteRecord,
    getDailyProduction,
    getHourlyProduction,
    getActiveStops,
  };

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
};