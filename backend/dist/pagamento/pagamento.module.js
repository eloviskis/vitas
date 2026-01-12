"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pagamento_entity_1 = require("./entities/pagamento.entity");
const orcamento_entity_1 = require("../orcamento/entities/orcamento.entity");
const pagamento_service_1 = require("./services/pagamento.service");
const pagamento_controller_1 = require("./controllers/pagamento.controller");
const relatorio_financeiro_service_1 = require("./services/relatorio-financeiro.service");
const relatorio_financeiro_controller_1 = require("./controllers/relatorio-financeiro.controller");
let PagamentoModule = class PagamentoModule {
};
exports.PagamentoModule = PagamentoModule;
exports.PagamentoModule = PagamentoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pagamento_entity_1.Pagamento, orcamento_entity_1.Orcamento]),
        ],
        controllers: [pagamento_controller_1.PagamentoController, relatorio_financeiro_controller_1.RelatorioFinanceiroController],
        providers: [pagamento_service_1.PagamentoService, relatorio_financeiro_service_1.RelatorioFinanceiroService],
        exports: [pagamento_service_1.PagamentoService],
    })
], PagamentoModule);
