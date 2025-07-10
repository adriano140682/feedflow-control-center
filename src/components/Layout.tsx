import React, { useState } from 'react';
import { Factory, BarChart3, Package, StopCircle, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabType } from '@/types/production';

interface LayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
  { id: 'production' as TabType, label: 'Produção', icon: Factory },
  { id: 'packaging' as TabType, label: 'Embalagem', icon: Package },
  { id: 'stops' as TabType, label: 'Paradas', icon: StopCircle },
  { id: 'reports' as TabType, label: 'Relatórios', icon: FileText },
  { id: 'settings' as TabType, label: 'Cadastro', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-card shadow-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sistema de Produção</h1>
                <p className="text-sm text-muted-foreground">Controle Industrial de Ração</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all",
                    "hover:bg-secondary/50 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-background text-primary border-b-2 border-primary shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};