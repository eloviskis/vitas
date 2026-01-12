"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const chamado_module_1 = require("./chamado/chamado.module");
const triagem_module_1 = require("./triagem/triagem.module");
const profissional_module_1 = require("./profissional/profissional.module");
const agendamento_module_1 = require("./agendamento/agendamento.module");
const auth_module_1 = require("./auth/auth.module");
const orcamento_module_1 = require("./orcamento/orcamento.module");
const avaliacao_module_1 = require("./avaliacao/avaliacao.module");
const pagamento_module_1 = require("./pagamento/pagamento.module");
const followup_module_1 = require("./followup/followup.module");
const storage_module_1 = require("./storage/storage.module");
const notification_module_1 = require("./notification/notification.module");
const lgpd_module_1 = require("./lgpd/lgpd.module");
const metrics_module_1 = require("./metrics/metrics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbType = configService.get('DATABASE_TYPE') || 'sqlite';
                    if (dbType === 'postgres') {
                        return {
                            type: 'postgres',
                            host: configService.get('DATABASE_HOST') || 'localhost',
                            port: configService.get('DATABASE_PORT') || 5432,
                            username: configService.get('DATABASE_USER') || 'vitas',
                            password: configService.get('DATABASE_PASSWORD') || '',
                            database: configService.get('DATABASE_NAME') || 'vitas',
                            entities: ['dist/**/*.entity.js'],
                            synchronize: true, // Ativar auto-criação de tabelas
                            logging: configService.get('NODE_ENV') === 'development',
                        };
                    }
                    // SQLite fallback
                    return {
                        type: 'sqlite',
                        database: configService.get('DATABASE_PATH') || './data/vitas.db',
                        entities: ['dist/**/*.entity.js'],
                        synchronize: configService.get('NODE_ENV') !== 'production',
                        logging: configService.get('NODE_ENV') === 'development',
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            storage_module_1.StorageModule,
            notification_module_1.NotificationModule,
            chamado_module_1.ChamadoModule,
            triagem_module_1.TriagemModule,
            profissional_module_1.ProfissionalModule,
            agendamento_module_1.AgendamentoModule,
            orcamento_module_1.OrcamentoModule,
            avaliacao_module_1.AvaliacaoModule,
            pagamento_module_1.PagamentoModule,
            followup_module_1.FollowupModule,
            lgpd_module_1.LgpdModule,
            metrics_module_1.MetricsModule,
        ],
    })
], AppModule);
