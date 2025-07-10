import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { useProduction } from '@/contexts/ProductionContext';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

type ReportType = 'daily' | 'weekly' | 'custom';

export const ReportsTab: React.FC = () => {
  const { 
    productionRecords, 
    packagingRecords, 
    stopRecords, 
    products, 
    teamMembers,
    getDailyProduction 
  } = useProduction();

  const [filters, setFilters] = useState({
    reportType: 'daily' as ReportType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    sector: 'all' as 'all' | 'box1' | 'box2' | 'packaging',
    productId: 'all'
  });

  const getDateRange = () => {
    const today = new Date();
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    switch (filters.reportType) {
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return { start: weekStart, end: today };
      case 'custom':
        return { start, end };
      default:
        return { start: today, end: today };
    }
  };

  const generateReportData = () => {
    const { start, end } = getDateRange();
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Filter records by date range
    const filteredProduction = productionRecords.filter(r => 
      r.date >= startStr && r.date <= endStr
    );
    
    const filteredPackaging = packagingRecords.filter(r => 
      r.date >= startStr && r.date <= endStr
    );
    
    const filteredStops = stopRecords.filter(r => {
      const stopDate = r.startTime.split(' ')[0];
      return stopDate >= startStr.split('-').reverse().join('/') && 
             stopDate <= endStr.split('-').reverse().join('/');
    });

    // Production summary
    const productionSummary = {
      box1Total: filteredProduction.filter(r => r.boxNumber === 1).reduce((sum, r) => sum + r.quantity, 0),
      box2Total: filteredProduction.filter(r => r.boxNumber === 2).reduce((sum, r) => sum + r.quantity, 0),
      totalBags: filteredProduction.reduce((sum, r) => sum + r.quantity, 0)
    };

    // Packaging summary by collaborator
    const packagingSummary = teamMembers
      .filter(m => m.role === 'packaging')
      .map(member => {
        const memberRecords = filteredPackaging.filter(r => r.collaboratorId === member.id);
        return {
          name: member.name,
          total: memberRecords.reduce((sum, r) => sum + r.quantity, 0)
        };
      });

    // Stops summary
    const stopsSummary = {
      totalStops: filteredStops.length,
      totalTime: filteredStops.reduce((sum, s) => sum + (s.duration || 0), 0),
      activeStops: filteredStops.filter(s => s.isActive).length
    };

    return {
      dateRange: { start, end },
      production: productionSummary,
      packaging: packagingSummary,
      stops: stopsSummary,
      records: {
        production: filteredProduction,
        packaging: filteredPackaging,
        stops: filteredStops
      }
    };
  };

  const exportToPDF = () => {
    try {
      const reportData = generateReportData();
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Relatório de Produção', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Período: ${reportData.dateRange.start.toLocaleDateString('pt-BR')} - ${reportData.dateRange.end.toLocaleDateString('pt-BR')}`, 20, 30);
      
      let yPosition = 50;
      
      // Production summary
      doc.setFontSize(16);
      doc.text('Resumo de Produção', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.text(`Total de Sacos: ${reportData.production.totalBags}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Caixa 01: ${reportData.production.box1Total} sacos`, 20, yPosition);
      yPosition += 10;
      doc.text(`Caixa 02: ${reportData.production.box2Total} sacos`, 20, yPosition);
      yPosition += 20;
      
      // Packaging summary
      doc.setFontSize(16);
      doc.text('Embalagem por Colaboradora', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      reportData.packaging.forEach(p => {
        doc.text(`${p.name}: ${p.total} sacos`, 20, yPosition);
        yPosition += 10;
      });
      yPosition += 10;
      
      // Stops summary
      doc.setFontSize(16);
      doc.text('Resumo de Paradas', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.text(`Total de Paradas: ${reportData.stops.totalStops}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Tempo Total: ${reportData.stops.totalTime} minutos`, 20, yPosition);
      yPosition += 10;
      doc.text(`Paradas Ativas: ${reportData.stops.activeStops}`, 20, yPosition);
      
      doc.save(`relatorio-producao-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Sucesso",
        description: "Relatório PDF gerado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    try {
      const reportData = generateReportData();
      const wb = XLSX.utils.book_new();
      
      // Production sheet
      const productionData = reportData.records.production.map(r => {
        const product = products.find(p => p.id === r.productId);
        return {
          Data: r.date,
          Hora: r.time,
          Caixa: `Caixa ${r.boxNumber.toString().padStart(2, '0')}`,
          Produto: product?.name || 'N/A',
          Quantidade: r.quantity,
          Observações: r.observations || ''
        };
      });
      
      const productionWS = XLSX.utils.json_to_sheet(productionData);
      XLSX.utils.book_append_sheet(wb, productionWS, 'Produção');
      
      // Packaging sheet
      const packagingData = reportData.records.packaging.map(r => {
        const collaborator = teamMembers.find(m => m.id === r.collaboratorId);
        const product = r.productId ? products.find(p => p.id === r.productId) : null;
        return {
          Data: r.date,
          Colaboradora: collaborator?.name || 'N/A',
          Quantidade: r.quantity,
          Produto: product?.name || 'Não especificado'
        };
      });
      
      const packagingWS = XLSX.utils.json_to_sheet(packagingData);
      XLSX.utils.book_append_sheet(wb, packagingWS, 'Embalagem');
      
      // Stops sheet
      const stopsData = reportData.records.stops.map(s => ({
        Setor: s.sector === 'box1' ? 'Caixa 01' : s.sector === 'box2' ? 'Caixa 02' : 'Embalagem',
        'Hora Início': s.startTime,
        'Hora Fim': s.endTime || 'Em andamento',
        'Duração (min)': s.duration || 0,
        Motivo: s.reason,
        Status: s.isActive ? 'Ativo' : 'Encerrado'
      }));
      
      const stopsWS = XLSX.utils.json_to_sheet(stopsData);
      XLSX.utils.book_append_sheet(wb, stopsWS, 'Paradas');
      
      XLSX.writeFile(wb, `relatorio-producao-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Sucesso",
        description: "Relatório Excel gerado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar Excel",
        variant: "destructive"
      });
    }
  };

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filtros do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-card-foreground">Tipo de Relatório</Label>
              <Select value={filters.reportType} onValueChange={(value) => setFilters({ ...filters, reportType: value as ReportType })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Últimos 7 dias</SelectItem>
                  <SelectItem value="custom">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.reportType === 'custom' && (
              <>
                <div>
                  <Label htmlFor="startDate" className="text-card-foreground">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-card-foreground">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </>
            )}

            <div>
              <Label className="text-card-foreground">Setor</Label>
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value as any })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="box1">Caixa 01</SelectItem>
                  <SelectItem value="box2">Caixa 02</SelectItem>
                  <SelectItem value="packaging">Embalagem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-card-foreground">Produto</Label>
              <Select value={filters.productId} onValueChange={(value) => setFilters({ ...filters, productId: value })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Geral:</span>
                <span className="font-bold text-primary">{reportData.production.totalBags} sacos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Caixa 01:</span>
                <span className="font-medium text-card-foreground">{reportData.production.box1Total} sacos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Caixa 02:</span>
                <span className="font-medium text-card-foreground">{reportData.production.box2Total} sacos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Embalagem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.packaging.map(p => (
                <div key={p.name} className="flex justify-between">
                  <span className="text-muted-foreground">{p.name}:</span>
                  <span className="font-medium text-accent">{p.total} sacos</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-accent">
                    {reportData.packaging.reduce((sum, p) => sum + p.total, 0)} sacos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Paradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-destructive">{reportData.stops.totalStops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo Total:</span>
                <span className="font-medium text-card-foreground">{reportData.stops.totalTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ativas:</span>
                <span className="font-medium text-warning">{reportData.stops.activeStops}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-2">
            <Download className="h-5 w-5 text-accent" />
            <span>Exportar Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportToPDF} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={exportToExcel} className="bg-success hover:bg-success/90 text-success-foreground">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Os relatórios incluem todos os dados de produção, embalagem e paradas do período selecionado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};