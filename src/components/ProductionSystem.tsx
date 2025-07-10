import React, { useState } from 'react';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { ProductionTab } from './ProductionTab';
import { PackagingTab } from './PackagingTab';
import { StopsTab } from './StopsTab';
import { ReportsTab } from './ReportsTab';
import { SettingsTab } from './SettingsTab';
import { ProductionProvider } from '@/contexts/ProductionContext';
import { TabType } from '@/types/production';

export const ProductionSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'production':
        return <ProductionTab />;
      case 'packaging':
        return <PackagingTab />;
      case 'stops':
        return <StopsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProductionProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </ProductionProvider>
  );
};