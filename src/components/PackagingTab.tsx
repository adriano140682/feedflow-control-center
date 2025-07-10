import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Package } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';
import { toast } from '@/hooks/use-toast';

export const PackagingTab: React.FC = () => {
  const { 
    teamMembers, 
    products, 
    packagingRecords, 
    addPackagingRecord, 
    deleteRecord 
  } = useProduction();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    collaboratorId: '',
    quantity: '',
    productId: 'none'
  });

  const today = new Date().toISOString().split('T')[0];
  const packagingTeam = teamMembers.filter(m => m.role === 'packaging');
  
  const todayRecords = packagingRecords
    .filter(r => r.date === today)
    .sort((a, b) => b.timestamp - a.timestamp);

  const todayTotal = todayRecords.reduce((sum, r) => sum + r.quantity, 0);

  // Group by collaborator for summary
  const collaboratorSummary = packagingTeam.map(member => {
    const memberRecords = todayRecords.filter(r => r.collaboratorId === member.id);
    const total = memberRecords.reduce((sum, r) => sum + r.quantity, 0);
    return { member, total, records: memberRecords };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.collaboratorId || !formData.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    addPackagingRecord({
      date: formData.date,
      collaboratorId: formData.collaboratorId,
      quantity: parseInt(formData.quantity),
      productId: formData.productId === 'none' ? undefined : formData.productId || undefined
    });

    setFormData({
      ...formData,
      quantity: '',
      productId: 'none'
    });

    toast({
      title: "Sucesso",
      description: "Embalagem registrada com sucesso",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteRecord('packaging', id);
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-card-foreground flex items-center space-x-2">
              <Package className="h-4 w-4 text-accent" />
              <span>Total Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{todayTotal}</div>
            <p className="text-xs text-muted-foreground">sacos carimbados</p>
          </CardContent>
        </Card>

        {collaboratorSummary.map(({ member, total }) => (
          <Card key={member.id} className="bg-gradient-card shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-card-foreground">{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{total}</div>
              <p className="text-xs text-muted-foreground">sacos hoje</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Registrar Embalagem</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label className="text-card-foreground">Colaboradora</Label>
                <Select value={formData.collaboratorId} onValueChange={(value) => setFormData({ ...formData, collaboratorId: value })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione a colaboradora" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {packagingTeam.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
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
                  placeholder="Número de sacos carimbados"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label className="text-card-foreground">Produto (opcional)</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="none">Não especificado</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.weightPerBag}kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                Registrar Embalagem
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
                  const collaborator = teamMembers.find(m => m.id === record.collaboratorId);
                  const product = record.productId ? products.find(p => p.id === record.productId) : null;
                  
                  return (
                    <div 
                      key={record.id} 
                      className="p-4 bg-secondary/20 border border-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="font-medium text-card-foreground">
                              {collaborator?.name}
                            </span>
                            <span className="text-sm text-accent font-medium">
                              {record.quantity} sacos
                            </span>
                          </div>
                          {product && (
                            <div className="text-sm text-muted-foreground">
                              {product.name} ({product.weightPerBag}kg)
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(record.timestamp).toLocaleString('pt-BR')}
                          </div>
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