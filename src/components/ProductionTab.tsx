import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';
import { toast } from '@/hooks/use-toast';

export const ProductionTab: React.FC = () => {
  const { 
    products, 
    productionRecords, 
    addProductionRecord, 
    deleteRecord,
    getDailyProduction
  } = useProduction();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    boxNumber: '' as '1' | '2' | '',
    productId: '',
    quantity: '',
    observations: ''
  });

  const today = new Date().toISOString().split('T')[0];
  const dailyProduction = getDailyProduction(today);
  const todayRecords = productionRecords
    .filter(r => r.date === today)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.boxNumber || !formData.productId || !formData.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    addProductionRecord({
      date: formData.date,
      time: formData.time,
      boxNumber: parseInt(formData.boxNumber) as 1 | 2,
      productId: formData.productId,
      quantity: parseInt(formData.quantity),
      observations: formData.observations || undefined
    });

    setFormData({
      ...formData,
      quantity: '',
      observations: ''
    });

    toast({
      title: "Sucesso",
      description: "Produção registrada com sucesso",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteRecord('production', id);
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground">Caixa 01 - Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dailyProduction.box1}</div>
            <p className="text-xs text-muted-foreground">sacos produzidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground">Caixa 02 - Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{dailyProduction.box2}</div>
            <p className="text-xs text-muted-foreground">sacos produzidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground">Total - Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{dailyProduction.total}</div>
            <p className="text-xs text-muted-foreground">sacos produzidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Registrar Produção</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date" className="text-card-foreground">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-card-foreground">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label className="text-card-foreground">Caixa</Label>
                <Select value={formData.boxNumber} onValueChange={(value) => setFormData({ ...formData, boxNumber: value as '1' | '2' })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione a caixa" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="1">Caixa 01</SelectItem>
                    <SelectItem value="2">Caixa 02</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-card-foreground">Produto</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.weightPerBag}kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-card-foreground">Quantidade (sacos)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Número de sacos"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="observations" className="text-card-foreground">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observações (opcional)"
                  className="bg-input border-border text-foreground resize-none"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                Registrar Produção
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Registros de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum registro hoje</p>
              ) : (
                todayRecords.map(record => {
                  const product = products.find(p => p.id === record.productId);
                  return (
                    <div 
                      key={record.id} 
                      className="p-4 bg-secondary/20 border border-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="font-medium text-card-foreground">
                              Caixa {record.boxNumber.toString().padStart(2, '0')}
                            </span>
                            <span className="text-sm text-muted-foreground">{record.time}</span>
                            <span className="text-sm text-primary font-medium">
                              {record.quantity} sacos
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {product?.name} ({product?.weightPerBag}kg)
                          </div>
                          {record.observations && (
                            <div className="text-sm text-muted-foreground mt-1 italic">
                              {record.observations}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};