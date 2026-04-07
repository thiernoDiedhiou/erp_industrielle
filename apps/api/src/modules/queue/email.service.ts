import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailMessage } from './queue.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER', ''),
        pass: this.config.get('SMTP_PASSWORD', ''),
      },
    });
  }

  async envoyerEmail(message: EmailMessage): Promise<void> {
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
    } catch (err: any) {
      // En développement sans SMTP configuré, on logue seulement
      this.logger.warn(`Email non envoyé (SMTP non configuré) : ${subject} → ${to}`);
      this.logger.debug(`Contenu simulé :\n${html}`);
    }
  }

  private rendreCoprs(template: string, data: Record<string, unknown>): string {
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
}
