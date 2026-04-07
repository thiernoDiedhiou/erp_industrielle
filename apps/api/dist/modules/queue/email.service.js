"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
            port: this.config.get('SMTP_PORT', 587),
            secure: false,
            auth: {
                user: this.config.get('SMTP_USER', ''),
                pass: this.config.get('SMTP_PASSWORD', ''),
            },
        });
    }
    async envoyerEmail(message) {
        const { to, subject, template, data } = message;
        const html = this.rendreCoprs(template, data);
        try {
            await this.transporter.sendMail({
                from: this.config.get('SMTP_FROM', 'noreply@gisac.sn'),
                to,
                subject,
                html,
            });
            this.logger.log(`Email envoyé : ${subject} → ${to}`);
        }
        catch (err) {
            this.logger.warn(`Email non envoyé (SMTP non configuré) : ${subject} → ${to}`);
            this.logger.debug(`Contenu simulé :\n${html}`);
        }
    }
    rendreCoprs(template, data) {
        switch (template) {
            case 'facture':
                return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1565C0;">Facture ${data['reference']}</h2>
            <p>Bonjour,</p>
            <p>Veuillez trouver ci-joint votre facture <strong>${data['reference']}</strong>
               d'un montant de <strong>${data['montant']} FCFA TTC</strong>.</p>
            <p>Date d'échéance : <strong>${data['echeance']}</strong></p>
            <hr/>
            <p style="color: #666; font-size: 12px;">
              GISAC — Global Invest Samoura &amp; Co — Thiès, Sénégal<br/>
              Tél : 33 999 01 79
            </p>
          </div>`;
            case 'commande_confirmee':
                return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1565C0;">Commande confirmée : ${data['reference']}</h2>
            <p>Bonjour <strong>${data['client']}</strong>,</p>
            <p>Votre commande <strong>${data['reference']}</strong> a bien été confirmée.</p>
            <p>Montant total : <strong>${data['montant']} FCFA TTC</strong></p>
            <p>Date de livraison prévue : <strong>${data['livraison'] ?? 'À confirmer'}</strong></p>
            <hr/>
            <p style="color: #666; font-size: 12px;">GISAC — Thiès, Sénégal — 33 999 01 79</p>
          </div>`;
            case 'alerte_stock':
                return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f44336;">⚠ Alerte stock critique</h2>
            <p>La matière première <strong>${data['matiere']}</strong> est en dessous du seuil minimum.</p>
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; border:1px solid #ddd;">Stock actuel</td>
                  <td style="padding:8px; border:1px solid #ddd;"><strong>${data['stockActuel']} ${data['unite']}</strong></td></tr>
              <tr><td style="padding:8px; border:1px solid #ddd;">Seuil minimum</td>
                  <td style="padding:8px; border:1px solid #ddd;">${data['stockMinimum']} ${data['unite']}</td></tr>
            </table>
            <p>Merci de réapprovisionner rapidement.</p>
            <hr/>
            <p style="color: #666; font-size: 12px;">GISAC — Système ERP automatique</p>
          </div>`;
            case 'bienvenue':
                return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Bienvenue sur GISAC ERP</h2>
            <p>Bonjour <strong>${data['prenom']} ${data['nom']}</strong>,</p>
            <p>Votre compte a été créé avec succès.</p>
            <p>Email : <strong>${data['email']}</strong><br/>
               Rôle : <strong>${data['role']}</strong></p>
            <hr/>
            <p style="color: #666; font-size: 12px;">GISAC — Thiès, Sénégal — 33 999 01 79</p>
          </div>`;
            default:
                return `<p>${JSON.stringify(data)}</p>`;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map