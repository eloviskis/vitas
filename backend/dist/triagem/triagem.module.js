"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriagemModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const triagem_entity_1 = require("./entities/triagem.entity");
const score_historico_entity_1 = require("./entities/score-historico.entity");
const triagem_service_1 = require("./services/triagem.service");
const score_rules_service_1 = require("./services/score-rules.service");
const triagem_controller_1 = require("./controllers/triagem.controller");
const score_controller_1 = require("./controllers/score.controller");
const chamado_module_1 = require("../chamado/chamado.module");
const profissional_module_1 = require("../profissional/profissional.module");
const chamado_entity_1 = require("../chamado/entities/chamado.entity");
const profissional_entity_1 = require("../profissional/entities/profissional.entity");
const avaliacao_entity_1 = require("../avaliacao/entities/avaliacao.entity");
const agendamento_entity_1 = require("../agendamento/entities/agendamento.entity");
let TriagemModule = class TriagemModule {
};
exports.TriagemModule = TriagemModule;
exports.TriagemModule = TriagemModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                triagem_entity_1.Triagem,
                score_historico_entity_1.ScoreHistorico,
                chamado_entity_1.Chamado,
                profissional_entity_1.Profissional,
                avaliacao_entity_1.Avaliacao,
                agendamento_entity_1.Agendamento,
            ]),
            chamado_module_1.ChamadoModule,
            profissional_module_1.ProfissionalModule,
        ],
        providers: [triagem_service_1.TriagemService, score_rules_service_1.ScoreRulesService],
        controllers: [triagem_controller_1.TriagemController, score_controller_1.ScoreController],
        exports: [triagem_service_1.TriagemService, score_rules_service_1.ScoreRulesService],
    })
], TriagemModule);
