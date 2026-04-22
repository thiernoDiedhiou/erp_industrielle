"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const BLEU = '#1565C0';
const GRIS_FOND = '#f7f9ff';
const GRIS_TEXTE = '#333333';
const GRIS_LABEL = '#888888';
let PdfService = class PdfService {
    async genererFacturePdf(data) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            this.dessiner(doc, data);
            doc.end();
        });
    }
    dessiner(doc, data) {
        const W = doc.page.width;
        doc.rect(0, 0, W, 85).fill(BLEU);
        const nomFontSize = data.tenant.nom.length > 22 ? 13 : 17;
        doc.fillColor('white').fontSize(nomFontSize).font('Helvetica-Bold')
            .text(data.tenant.nom, 50, 25, { width: 280, lineBreak: false });
        const infoTenant = [data.tenant.adresse, data.tenant.ville, data.tenant.telephone]
            .filter(Boolean).join('  |  ');
        if (infoTenant) {
            doc.fontSize(8).font('Helvetica').text(infoTenant, 50, 50, { width: 280, lineBreak: false });
        }
        doc.fontSize(26).font('Helvetica-Bold')
            .text('FACTURE', W - 230, 20, { width: 180, align: 'right' });
        doc.fontSize(11).font('Helvetica')
            .text(data.reference, W - 230, 52, { width: 180, align: 'right' });
        doc.fillColor(GRIS_TEXTE);
        const yAddr = 105;
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GRIS_LABEL)
            .text('DE :', 50, yAddr);
        const lignesTenant = [
            data.tenant.nom,
            data.tenant.adresse,
            data.tenant.ville,
            data.tenant.telephone,
        ].filter((v) => !!v).map((v) => this.sanitize(v));
        doc.fontSize(9).font('Helvetica').fillColor(GRIS_TEXTE)
            .text(lignesTenant.join('\n'), 50, yAddr + 12, { width: 240, lineGap: 1 });
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GRIS_LABEL)
            .text('FACTURER A :', 310, yAddr);
        const lignesClient = [
            data.client.nom,
            data.client.adresse,
            data.client.ville,
            data.client.telephone,
            data.client.email,
            data.client.ninea ? `NINEA : ${data.client.ninea}` : null,
        ].filter((v) => !!v).map((v) => this.sanitize(v));
        doc.fontSize(9).font('Helvetica').fillColor(GRIS_TEXTE)
            .text(lignesClient.join('\n'), 310, yAddr + 12, { width: 235, lineGap: 1 });
        const yMeta = 210;
        doc.rect(50, yMeta, 495, 38).fillAndStroke('#eef2fb', '#c8d4ef');
        const cols = [
            { label: 'N FACTURE', val: data.reference },
            { label: 'EMISSION', val: this.fmtDate(data.dateEmission) },
            { label: 'ECHEANCE', val: this.fmtDate(data.dateEcheance) },
            { label: 'STATUT', val: this.labelStatut(data.statut) },
        ];
        cols.forEach((col, i) => {
            const x = 62 + i * 124;
            doc.fillColor(GRIS_LABEL).font('Helvetica-Bold').fontSize(7)
                .text(col.label, x, yMeta + 7, { width: 118 });
            doc.fillColor(GRIS_TEXTE).font('Helvetica').fontSize(9)
                .text(col.val, x, yMeta + 20, { width: 118 });
        });
        const tableTop = 268;
        const colW = [225, 48, 112, 110];
        doc.rect(50, tableTop, 495, 22).fill(BLEU);
        doc.fillColor('white').font('Helvetica-Bold').fontSize(8);
        const headers = ['DESIGNATION', 'QTE', 'P.U. HT (FCFA)', 'MONTANT HT (FCFA)'];
        let cx = 56;
        headers.forEach((h, i) => {
            doc.text(h, cx, tableTop + 7, { width: colW[i] - 6, align: i > 0 ? 'right' : 'left' });
            cx += colW[i];
        });
        let rowY = tableTop + 22;
        data.lignes.forEach((ligne, idx) => {
            doc.rect(50, rowY, 495, 22).fill(idx % 2 === 0 ? 'white' : GRIS_FOND);
            doc.fillColor(GRIS_TEXTE).font('Helvetica').fontSize(9);
            let lx = 56;
            [
                { val: this.sanitize(ligne.designation), align: 'left' },
                { val: String(ligne.quantite), align: 'right' },
                { val: this.fmt(ligne.prixUnitaire), align: 'right' },
                { val: this.fmt(ligne.montant), align: 'right' },
            ].forEach((cell, i) => {
                doc.text(cell.val, lx, rowY + 6, {
                    width: colW[i] - 6,
                    align: cell.align,
                });
                lx += colW[i];
            });
            rowY += 22;
        });
        doc.rect(50, tableTop + 22, 495, rowY - tableTop - 22).stroke('#d5ddf0');
        rowY += 14;
        [
            { label: 'Total HT', val: this.fmt(data.totalHT) + ' FCFA' },
            { label: 'TVA (18%)', val: this.fmt(data.tva) + ' FCFA' },
        ].forEach((t) => {
            doc.fillColor(GRIS_TEXTE).font('Helvetica').fontSize(9)
                .text(t.label, 340, rowY, { width: 90, align: 'right' })
                .text(t.val, 435, rowY, { width: 110, align: 'right' });
            rowY += 17;
        });
        rowY += 4;
        doc.rect(330, rowY, 215, 26).fill(BLEU);
        doc.fillColor('white').font('Helvetica-Bold').fontSize(11)
            .text('TOTAL TTC', 336, rowY + 7, { width: 99, align: 'right' })
            .text(this.fmt(data.totalTTC) + ' FCFA', 440, rowY + 7, { width: 100, align: 'right' });
        rowY += 26;
        if (data.notes) {
            rowY += 16;
            doc.fillColor(GRIS_LABEL).fontSize(8).font('Helvetica-Bold')
                .text('Notes :', 50, rowY);
            const notesSanitisees = this.sanitize(data.notes);
            doc.fillColor(GRIS_TEXTE).font('Helvetica')
                .text(notesSanitisees, 50, rowY + 11, { width: 400 });
            rowY += 11 + doc.heightOfString(notesSanitisees, { width: 400 });
        }
        rowY += 28;
        doc.rect(50, rowY, 495, 0.5).fill('#d5ddf0');
        rowY += 10;
        doc.fillColor(GRIS_LABEL).fontSize(7.5).font('Helvetica')
            .text('Merci pour votre confiance  --  Reglement a 30 jours', 50, rowY, { align: 'center', width: 495 });
        rowY += 13;
        doc.fillColor('#aaaaaa').fontSize(7)
            .text('ERP Industriel SaaS  --  Plateforme de gestion industrielle africaine', 50, rowY, { align: 'center', width: 495 });
    }
    labelStatut(statut) {
        const map = {
            emise: 'Emise',
            partiellement_payee: 'Part. payee',
            payee: 'Payee',
            annulee: 'Annulee',
        };
        return map[statut] ?? statut;
    }
    fmt(val) {
        return Math.round(val)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    fmtDate(date) {
        const d = new Date(date);
        return [
            d.getDate().toString().padStart(2, '0'),
            (d.getMonth() + 1).toString().padStart(2, '0'),
            d.getFullYear(),
        ].join('/');
    }
    sanitize(text) {
        return text
            .replace(/μ/g, 'u')
            .replace(/µ/g, 'u')
            .replace(/’/g, "'")
            .replace(/‘/g, "'")
            .replace(/“/g, '"')
            .replace(/”/g, '"')
            .replace(/–/g, '-')
            .replace(/—/g, '-')
            .replace(/[^\x00-\xFF]/g, '?');
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map