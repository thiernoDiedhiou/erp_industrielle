"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogistiqueModule = void 0;
const common_1 = require("@nestjs/common");
const logistique_service_1 = require("./logistique.service");
const logistique_controller_1 = require("./logistique.controller");
let LogistiqueModule = class LogistiqueModule {
};
exports.LogistiqueModule = LogistiqueModule;
exports.LogistiqueModule = LogistiqueModule = __decorate([
    (0, common_1.Module)({
        providers: [logistique_service_1.LogistiqueService],
        controllers: [logistique_controller_1.LogistiqueController],
        exports: [logistique_service_1.LogistiqueService],
    })
], LogistiqueModule);
//# sourceMappingURL=logistique.module.js.map