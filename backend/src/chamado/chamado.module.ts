import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chamado } from './entities/chamado.entity';
import { ChamadoHistorico } from './entities/chamado-historico.entity';
import { HistoricoService } from './services/historico.service';
import { ChamadoService } from './services/chamado.service';
import { HistoricoController } from './controllers/historico.controller';
import { ChamadoController } from './controllers/chamado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chamado, ChamadoHistorico])],
  providers: [HistoricoService, ChamadoService],
  controllers: [HistoricoController, ChamadoController],
  exports: [HistoricoService, ChamadoService],
})
export class ChamadoModule {}

