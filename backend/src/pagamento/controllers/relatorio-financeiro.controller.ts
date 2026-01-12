import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RelatorioFinanceiroService } from '../services/relatorio-financeiro.service';

@Controller('relatorios-financeiros')
@UseGuards(JwtAuthGuard)
export class RelatorioFinanceiroController {
  constructor(private relatorioService: RelatorioFinanceiroService) {}

  @Get('resumo')
  async resumo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    return await this.relatorioService.obterResumoFinanceiro(inicio, fim);
  }

  @Get('diarias')
  async metricasDiarias(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    return await this.relatorioService.obterMetricasDiarias(inicio, fim);
  }

  @Get('conversao')
  async taxaConversao(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    return await this.relatorioService.obterTaxaConversao(inicio, fim);
  }
}
