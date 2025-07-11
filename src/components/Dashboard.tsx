import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Clock, Factory } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';

export const Dashboard: React.FC = () => {
  const { 
    getDailyProduction, 
    getHourlyProduction, 
    packagingRecords, 
    stopRecords, 
    products, 
    teamMembers,
    getActiveStops,
    productionRecords
  } = useProduction();

  const today = new Date().toISOString().split('T')[0];
  const dailyProduction = getDailyProduction(today);
  const hourlyData = getHourlyProduction(today);
  const activeStops = getActiveStops();
  
  console.log('Dashboard - Production Records:', productionRecords);
  console.log('Dashboard - Hourly Data:', hourlyData);
  console.log('Dashboard - Daily Production:', dailyProduction);
  
  const todayPackaging = packagingRecords
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + r.quantity, 0);

  const todayStops = stopRecords.filter(r => r.startTime.includes(today.split('-').reverse().join('/')));
  const totalStopTime = todayStops.reduce((sum, stop) => sum + (stop.duration || 0), 0);

  // Chart data for hourly production - show all hours with data
  const chartData = hourlyData.map(h => ({
    hour: h.hour,
    'Caixa 01': h.box1,
    'Caixa 02': h.box2,
    Total: h.box1 + h.box2
  })).filter(h => h.Total > 0); // Only show hours with production

  // If no data, show message
  const hasProductionData = productionRecords.length > 0;
  const hasTodayData = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Produção Total Hoje</CardTitle>
            <Factory className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dailyProduction.total}</div>
            <p className="text-xs text-muted-foreground">
              Caixa 01: {dailyProduction.box1} | Caixa 02: {dailyProduction.box2}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Embalagem Hoje</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{todayPackaging}</div>
            <p className="text-xs text-muted-foreground">sacos carimbados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Paradas Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{activeStops.length}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Tempo de Parada</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalStopTime}min</div>
            <p className="text-xs text-muted-foreground">total hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production Chart */}
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Produção por Hora</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {!hasProductionData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-muted-foreground mb-2">Carregando dados do Firebase...</div>
                    <div className="animate-pulse w-4 h-4 bg-primary rounded-full mx-auto"></div>
                  </div>
                </div>
              ) : !hasTodayData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <div>Nenhuma produção registrada hoje</div>
                    <div className="text-sm mt-1">Adicione registros na aba Produção</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Bar dataKey="Caixa 01" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Caixa 02" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Stops */}
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Paradas Ativas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activeStops.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma parada ativa</p>
              ) : (
                activeStops.map(stop => (
                  <div 
                    key={stop.id} 
                    className="p-3 bg-warning/10 border border-warning/20 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-card-foreground">
                          {stop.sector === 'box1' ? 'Caixa 01' : 
                           stop.sector === 'box2' ? 'Caixa 02' : 'Embalagem'}
                        </h4>
                        <p className="text-sm text-muted-foreground">{stop.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-warning">
                          Desde {stop.startTime}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Produtos</h4>
              <div className="space-y-1">
                {products.map(product => (
                  <div key={product.id} className="text-sm text-muted-foreground">
                    {product.name} ({product.weightPerBag}kg)
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Equipe Embalagem</h4>
              <div className="space-y-1">
                {teamMembers.filter(m => m.role === 'packaging').map(member => (
                  <div key={member.id} className="text-sm text-muted-foreground">
                    {member.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Paradas Hoje</h4>
              <div className="text-sm text-muted-foreground">
                {todayStops.length} paradas registradas
                {totalStopTime > 0 && (
                  <div>Total: {totalStopTime} minutos</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};