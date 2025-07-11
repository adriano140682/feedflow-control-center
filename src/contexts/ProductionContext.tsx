import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Product, TeamMember, ProductionRecord, PackagingRecord, StopRecord } from '@/types/production';

interface ProductionContextType {
  // Data
  products: Product[];
  teamMembers: TeamMember[];
  productionRecords: ProductionRecord[];
  packagingRecords: PackagingRecord[];
  stopRecords: StopRecord[];
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  addProductionRecord: (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => Promise<void>;
  addPackagingRecord: (record: Omit<PackagingRecord, 'id' | 'timestamp'>) => Promise<void>;
  addStopRecord: (record: Omit<StopRecord, 'id' | 'timestamp'>) => Promise<void>;
  endStopRecord: (id: string) => Promise<void>;
  deleteRecord: (type: 'production' | 'packaging' | 'stop', id: string) => Promise<void>;
  
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
  const [products, setProducts] = useState<Product[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [packagingRecords, setPackagingRecords] = useState<PackagingRecord[]>([]);
  const [stopRecords, setStopRecords] = useState<StopRecord[]>([]);

  // Initialize default data and load from Firestore
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize products if empty
        const productsSnapshot = await getDocs(collection(db, 'products'));
        if (productsSnapshot.empty) {
          const defaultProducts = [
            { name: 'Ração Bovina', weightPerBag: 30 },
            { name: 'Proteinado', weightPerBag: 25 },
          ];
          for (const product of defaultProducts) {
            await addDoc(collection(db, 'products'), product);
          }
        }

        // Initialize team members if empty
        const membersSnapshot = await getDocs(collection(db, 'team-members'));
        if (membersSnapshot.empty) {
          const defaultMembers = [
            { name: 'Maria Silva', role: 'packaging' },
            { name: 'Ana Costa', role: 'packaging' },
            { name: 'João Santos', role: 'bagging', boxNumber: 1 },
            { name: 'Pedro Lima', role: 'bagging', boxNumber: 2 },
          ];
          for (const member of defaultMembers) {
            await addDoc(collection(db, 'team-members'), member);
          }
        }
      } catch (error) {
        console.error('Error initializing default data:', error);
      }
    };

    initializeData();
  }, []);

  // Set up real-time listeners for all collections
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('name')),
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsData);
      },
      (error) => console.error('Error loading products:', error)
    );

    const unsubscribeMembers = onSnapshot(
      query(collection(db, 'team-members'), orderBy('name')),
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TeamMember));
        setTeamMembers(membersData);
      },
      (error) => console.error('Error loading team members:', error)
    );

    const unsubscribeProduction = onSnapshot(
      query(collection(db, 'production-records'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const productionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ProductionRecord));
        setProductionRecords(productionData);
      },
      (error) => console.error('Error loading production records:', error)
    );

    const unsubscribePackaging = onSnapshot(
      query(collection(db, 'packaging-records'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const packagingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PackagingRecord));
        setPackagingRecords(packagingData);
      },
      (error) => console.error('Error loading packaging records:', error)
    );

    const unsubscribeStops = onSnapshot(
      query(collection(db, 'stop-records'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const stopsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StopRecord));
        setStopRecords(stopsData);
      },
      (error) => console.error('Error loading stop records:', error)
    );

    return () => {
      unsubscribeProducts();
      unsubscribeMembers();
      unsubscribeProduction();
      unsubscribePackaging();
      unsubscribeStops();
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'team-members'), member);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const addProductionRecord = async (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord = { 
        ...record, 
        timestamp: Date.now()
      };
      await addDoc(collection(db, 'production-records'), newRecord);
    } catch (error) {
      console.error('Error adding production record:', error);
    }
  };

  const addPackagingRecord = async (record: Omit<PackagingRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord = { 
        ...record, 
        timestamp: Date.now()
      };
      await addDoc(collection(db, 'packaging-records'), newRecord);
    } catch (error) {
      console.error('Error adding packaging record:', error);
    }
  };

  const addStopRecord = async (record: Omit<StopRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord = { 
        ...record, 
        timestamp: Date.now(),
        isActive: true
      };
      await addDoc(collection(db, 'stop-records'), newRecord);
    } catch (error) {
      console.error('Error adding stop record:', error);
    }
  };

  const endStopRecord = async (id: string) => {
    try {
      const stopRef = doc(db, 'stop-records', id);
      const stop = stopRecords.find(s => s.id === id && s.isActive);
      
      if (stop) {
        const endTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const start = new Date(`1970-01-01T${stop.startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        
        await updateDoc(stopRef, {
          endTime,
          duration,
          isActive: false
        });
      }
    } catch (error) {
      console.error('Error ending stop record:', error);
    }
  };

  const deleteRecord = async (type: 'production' | 'packaging' | 'stop', id: string) => {
    try {
      let collectionName = '';
      switch (type) {
        case 'production':
          collectionName = 'production-records';
          break;
        case 'packaging':
          collectionName = 'packaging-records';
          break;
        case 'stop':
          collectionName = 'stop-records';
          break;
      }
      
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting ${type} record:`, error);
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