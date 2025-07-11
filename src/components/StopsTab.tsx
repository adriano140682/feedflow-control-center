import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StopCircle, Play, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const StopsTab: React.FC = () => {
  const { 
    stopRecords, 
    addStopRecord, 
    endStopRecord, 
    deleteRecord,
    getActiveStops 
  } = useProduction();

  const [formData, setFormData] = useState({
    sector: '' as 'box1' | 'box2' | 'packaging' | '',
    reason: ''
  });

  const activeStops = getActiveStops();
  const today = new Date().toISOString().split('T')[0];
  
  const todayStops = stopRecords
    .filter(r => r.startTime.includes(today.split('-').reverse().join('/')))
    .sort((a, b) => b.timestamp - a.timestamp);

  const totalStopTime = todayStops
    .filter(stop => !stop.isActive)
    .reduce((sum, stop) => sum + (stop.duration || 0), 0);

  const handleStartStop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sector || !formData.reason) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const existingStop = activeStops.find(stop => stop.sector === formData.sector);
    if (existingStop) {
      toast({
        title: "Erro",
        description: "Já existe uma parada ativa neste setor",
        variant: "destructive"
      });
      return;
    }

    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    try {
      await addStopRecord({
        sector: formData.sector,
        startTime: currentTime,
        reason: formData.reason,
        isActive: true
      });

      setFormData({ sector: '', reason: '' });

      toast({
        title: "Parada Iniciada",
        description: `Parada registrada para ${formData.sector === 'box1' ? 'Caixa 01' : formData.sector === 'box2' ? 'Caixa 02' : 'Embalagem'}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar parada",
        variant: "destructive"
      });
    }
  };

  const handleEndStop = async (id: string, sector: string) => {
    try {
      await endStopRecord(id);
      toast({
        title: "Parada Encerrada",
        description: `Parada do setor ${sector === 'box1' ? 'Caixa 01' : sector === 'box2' ? 'Caixa 02' : 'Embalagem'} foi encerrada`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao encerrar parada",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteRecord('stop', id);
        toast({
          title: "Sucesso",
          description: "Registro excluído com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir registro",
          variant: "destructive"
        });
      }
    }
  };

  const getSectorLabel = (sector: string) => {
    switch (sector) {
      case 'box1': return 'Caixa 01';
      case 'box2': return 'Caixa 02';
      case 'packaging': return 'Embalagem';
      default: return sector;
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'box1': return 'text-primary';
      case 'box2': return 'text-accent';
      case 'packaging': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span>Paradas Ativas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{activeStops.length}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground flex items-center space-x-2">
              <Clock className="h-4 w-4 text-destructive" />
              <span>Tempo Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalStopTime}min</div>
            <p className="text-xs text-muted-foreground">paradas hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground">Paradas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayStops.length}</div>
            <p className="text-xs text-muted-foreground">registros</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground">Média por Parada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {todayStops.filter(s => !s.isActive).length > 0 
                ? Math.round(totalStopTime / todayStops.filter(s => !s.isActive).length) 
                : 0}min
            </div>
            <p className="text-xs text-muted-foreground">duração média</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <StopCircle className="h-5 w-5 text-destructive" />
              <span>Registrar Parada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartStop} className="space-y-4">
              <div>
                <Label className="text-card-foreground">Setor</Label>
                <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value as any })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="box1">Caixa 01</SelectItem>
                    <SelectItem value="box2">Caixa 02</SelectItem>
                    <SelectItem value="packaging">Embalagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason" className="text-card-foreground">Motivo da Parada</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Descreva o motivo da parada..."
                  className="bg-input border-border text-foreground resize-none"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <StopCircle className="h-4 w-4 mr-2" />
                Iniciar Parada
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Stops & Records */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Paradas Ativas e Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Active Stops */}
            {activeStops.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>Paradas Ativas</span>
                </h3>
                <div className="space-y-2">
                  {activeStops.map(stop => (
                    <div 
                      key={stop.id} 
                      className="p-3 bg-warning/10 border border-warning/20 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className={cn("font-medium", getSectorColor(stop.sector))}>
                              {getSectorLabel(stop.sector)}
                            </span>
                            <span className="text-sm text-warning font-medium">
                              Desde {stop.startTime}
                            </span>
                          </div>
                          <p className="text-sm text-card-foreground">{stop.reason}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEndStop(stop.id, stop.sector)}
                          className="bg-success hover:bg-success/90 text-success-foreground"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Encerrar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Records */}
            <div>
              <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Histórico de Hoje</span>
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todayStops.filter(stop => !stop.isActive).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhuma parada encerrada hoje</p>
                ) : (
                  todayStops
                    .filter(stop => !stop.isActive)
                    .map(stop => (
                      <div 
                        key={stop.id} 
                        className="p-3 bg-secondary/20 border border-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className={cn("font-medium", getSectorColor(stop.sector))}>
                                {getSectorLabel(stop.sector)}
                              </span>
                              <span className="text-sm text-destructive font-medium">
                                {stop.duration}min
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {stop.startTime} - {stop.endTime}
                              </span>
                            </div>
                            <p className="text-sm text-card-foreground">{stop.reason}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(stop.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};