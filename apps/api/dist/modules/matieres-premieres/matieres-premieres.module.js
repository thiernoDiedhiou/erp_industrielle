"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatieresPremiereModule = void 0;
const common_1 = require("@nestjs/common");
const matieres_premieres_service_1 = require("./matieres-premieres.service");
const matieres_premieres_controller_1 = require("./matieres-premieres.controller");
let MatieresPremiereModule = class MatieresPremiereModule {
};
exports.MatieresPremiereModule = MatieresPremiereModule;
exports.MatieresPremiereModule = MatieresPremiereModule = __decorate([
    (0, common_1.Module)({
        providers: [matieres_premieres_service_1.MatieresPremiereService],
        controllers: [matieres_premieres_controller_1.MatieresPremiereController],
        exports: [matieres_premieres_service_1.MatieresPremiereService],
    })
], MatieresPremiereModule);
//# sourceMappingURL=matieres-premieres.module.js.map