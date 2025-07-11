import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Package2, Settings } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';
import { toast } from '@/hooks/use-toast';

export const SettingsTab: React.FC = () => {
  const { products, teamMembers, addProduct, addTeamMember } = useProduction();

  const [productForm, setProductForm] = useState({
    name: '',
    weightPerBag: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '' as 'packaging' | 'bagging' | '',
    boxNumber: '' as '1' | '2' | ''
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.weightPerBag) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      await addProduct({
        name: productForm.name,
        weightPerBag: parseInt(productForm.weightPerBag)
      });

      setProductForm({ name: '', weightPerBag: '' });

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto",
        variant: "destructive"
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberForm.name || !memberForm.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (memberForm.role === 'bagging' && !memberForm.boxNumber) {
      toast({
        title: "Erro",
        description: "Selecione a caixa para colaboradores do ensacamento",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTeamMember({
        name: memberForm.name,
        role: memberForm.role,
        boxNumber: memberForm.role === 'bagging' ? parseInt(memberForm.boxNumber) as 1 | 2 : undefined
      });

      setMemberForm({ name: '', role: '', boxNumber: '' });

      toast({
        title: "Sucesso",
        description: "Colaborador adicionado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar colaborador",
        variant: "destructive"
      });
    }
  };

  const packagingTeam = teamMembers.filter(m => m.role === 'packaging');
  const baggingTeam = teamMembers.filter(m => m.role === 'bagging');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Management */}
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <Package2 className="h-5 w-5 text-primary" />
              <span>Gerenciar Produtos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="productName" className="text-card-foreground">Nome do Produto</Label>
                <Input
                  id="productName"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Ração Bovina, Proteinado..."
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="productWeight" className="text-card-foreground">Peso por Saco (kg)</Label>
                <Input
                  id="productWeight"
                  type="number"
                  min="1"
                  value={productForm.weightPerBag}
                  onChange={(e) => setProductForm({ ...productForm, weightPerBag: e.target.value })}
                  placeholder="Ex: 30, 25..."
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </form>

            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Produtos Cadastrados</h4>
              {products.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
              ) : (
                products.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 bg-secondary/20 border border-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-card-foreground">{product.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({product.weightPerBag}kg)</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <span>Gerenciar Equipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="memberName" className="text-card-foreground">Nome do Colaborador</Label>
                <Input
                  id="memberName"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Nome completo..."
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label className="text-card-foreground">Função</Label>
                <Select value={memberForm.role} onValueChange={(value) => setMemberForm({ ...memberForm, role: value as any, boxNumber: '' })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="packaging">Embalagem</SelectItem>
                    <SelectItem value="bagging">Ensacamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {memberForm.role === 'bagging' && (
                <div>
                  <Label className="text-card-foreground">Caixa</Label>
                  <Select value={memberForm.boxNumber} onValueChange={(value) => setMemberForm({ ...memberForm, boxNumber: value as any })}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Selecione a caixa" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="1">Caixa 01</SelectItem>
                      <SelectItem value="2">Caixa 02</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90 text-accent-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Colaborador
              </Button>
            </form>

            <div className="space-y-4">
              {/* Packaging Team */}
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Equipe de Embalagem</h4>
                <div className="space-y-2">
                  {packagingTeam.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum colaborador cadastrado</p>
                  ) : (
                    packagingTeam.map(member => (
                      <div 
                        key={member.id} 
                        className="p-3 bg-accent/10 border border-accent/20 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-card-foreground">{member.name}</span>
                          <span className="text-sm text-accent">Embalagem</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bagging Team */}
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Equipe de Ensacamento</h4>
                <div className="space-y-2">
                  {baggingTeam.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum colaborador cadastrado</p>
                  ) : (
                    baggingTeam.map(member => (
                      <div 
                        key={member.id} 
                        className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-card-foreground">{member.name}</span>
                          <span className="text-sm text-primary">
                            Caixa {member.boxNumber?.toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Produtos</h4>
              <p className="text-2xl font-bold text-primary">{products.length}</p>
              <p className="text-sm text-muted-foreground">cadastrados</p>
            </div>
            
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Colaboradores</h4>
              <p className="text-2xl font-bold text-accent">{teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">na equipe</p>
            </div>
            
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Armazenamento</h4>
              <p className="text-sm text-success">Firebase Firestore</p>
              <p className="text-sm text-muted-foreground">sincronização em tempo real</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium text-card-foreground mb-2">Sobre o Sistema</h4>
            <p className="text-sm text-muted-foreground">
              Sistema de Controle de Produção Industrial v1.0 - Desenvolvido para fábricas de ração com 
              funcionalidades de registro de produção, embalagem, paradas e relatórios exportáveis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};