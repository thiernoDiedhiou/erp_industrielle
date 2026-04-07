"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let NotificationsService = class NotificationsService {
    constructor() {
        this.stream$ = new rxjs_1.Subject();
    }
    emit(notification) {
        this.stream$.next({ ...notification, createdAt: new Date() });
    }
    getStreamForTenant(tenantId) {
        return this.stream$.pipe((0, operators_1.filter)((n) => n.tenantId === tenantId), (0, operators_1.map)((n) => ({
            data: JSON.stringify({
                type: n.type,
                titre: n.titre,
                message: n.message,
                data: n.data,
                createdAt: n.createdAt,
            }),
        })));
    }
    alerteStock(tenantId, matiere, stockActuel, unite) {
        this.emit({
            tenantId,
            type: 'alerte_stock',
            titre: 'Alerte stock',
            message: `Stock bas : ${matiere} — ${stockActuel} ${unite} restant(s)`,
            data: { matiere, stockActuel, unite },
        });
    }
    statutCommande(tenantId, reference, ancienStatut, nouveauStatut) {
        this.emit({
            tenantId,
            type: 'statut_commande',
            titre: 'Commande mise à jour',
            message: `Commande ${reference} : ${ancienStatut} → ${nouveauStatut}`,
            data: { reference, ancienStatut, nouveauStatut },
        });
    }
    statutOF(tenantId, reference, nouveauStatut) {
        this.emit({
            tenantId,
            type: 'statut_of',
            titre: 'OF mis à jour',
            message: `OF ${reference} est maintenant : ${nouveauStatut}`,
            data: { reference, nouveauStatut },
        });
    }
    paiementRecu(tenantId, factureRef, montant) {
        this.emit({
            tenantId,
            type: 'paiement_recu',
            titre: 'Paiement reçu',
            message: `Paiement de ${new Intl.NumberFormat('fr-SN').format(montant)} FCFA sur ${factureRef}`,
            data: { factureRef, montant },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map