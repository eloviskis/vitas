"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lgpd_controller_1 = require("./lgpd.controller");
const lgpd_service_1 = require("./lgpd.service");
const user_entity_1 = require("../auth/entities/user.entity");
const chamado_entity_1 = require("../chamado/entities/chamado.entity");
const pagamento_entity_1 = require("../pagamento/entities/pagamento.entity");
const avaliacao_entity_1 = require("../avaliacao/entities/avaliacao.entity");
let LgpdModule = class LgpdModule {
};
exports.LgpdModule = LgpdModule;
exports.LgpdModule = LgpdModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, chamado_entity_1.Chamado, pagamento_entity_1.Pagamento, avaliacao_entity_1.Avaliacao]),
        ],
        controllers: [lgpd_controller_1.LgpdController],
        providers: [lgpd_service_1.LgpdService],
        exports: [lgpd_service_1.LgpdService],
    })
], LgpdModule);
