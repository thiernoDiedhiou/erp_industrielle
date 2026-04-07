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
const pdfkit_1 = require("pdfkit");
let PdfService = class PdfService {
    async genererFacturePdf(data) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            doc.rect(0, 0, doc.page.width, 80).fill('#1565C0');
            doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
                .text('ERP INDUSTRIEL', 50, 25);
            doc.fontSize(10).font('Helvetica')
                .text(data.tenant.nom, 50, 50);
            doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
                .text('FACTURE', 0, 30, { align: 'right' });
            doc.fontSize(11).font('Helvetica')
                .text(data.reference, 0, 55, { align: 'right' });
            doc.fillColor('#333333');
            const y = 110;
            doc.fontSize(9).font('Helvetica-Bold').text('DE :', 50, y);
            doc.font('Helvetica').fontSize(9)
                .text(data.tenant.nom, 50, y + 15)
                .text(data.tenant.adresse || '', 50, y + 27)
                .text(data.tenant.ville || 'Thiès, Sénégal', 50, y + 39)
                .text(data.tenant.telephone || '', 50, y + 51);
            doc.fontSize(9).font('Helvetica-Bold').text('FACTURER À :', 300, y);
            doc.font('Helvetica').fontSize(9)
                .text(data.client.nom, 300, y + 15)
                .text(data.client.adresse || '', 300, y + 27)
                .text(data.client.ville || '', 300, y + 39)
                .text(data.client.telephone || data.client.email || '', 300, y + 51);
            if (data.client.ninea) {
                doc.text(`NINEA: ${data.client.ninea}`, 300, y + 63);
            }
            const yMeta = 200;
            doc.rect(50, yMeta, 495, 40).fillAndStroke('#f0f4ff', '#c5d5f0');
            doc.fillColor('#333').fontSize(9);
            const cols = [
                { label: 'N° FACTURE', val: data.reference },
                { label: 'DATE ÉMISSION', val: this.formatDate(data.dateEmission) },
                { label: 'ÉCHÉANCE', val: this.formatDate(data.dateEcheance) },
                { label: 'STATUT', val: data.statut.toUpperCase() },
            ];
            cols.forEach((col, i) => {
                const x = 60 + i * 124;
                doc.font('Helvetica-Bold').text(col.label, x, yMeta + 8, { width: 120 });
                doc.font('Helvetica').text(col.val, x, yMeta + 22, { width: 120 });
            });
            const tableTop = 260;
            const headers = ['DÉSIGNATION', 'QTÉ', 'P.U. HT (FCFA)', 'MONTANT HT (FCFA)'];
            const widths = [220, 50, 110, 115];
            const startX = 50;
            doc.rect(startX, tableTop, 495, 22).fill('#1565C0');
            doc.fillColor('white').font('Helvetica-Bold').fontSize(8);
            let cx = startX + 5;
            headers.forEach((h, i) => {
                doc.text(h, cx, tableTop + 7, { width: widths[i], align: i > 0 ? 'right' : 'left' });
                cx += widths[i];
            });
            let rowY = tableTop + 22;
            doc.fillColor('#333').font('Helvetica').fontSize(9);
            data.lignes.forEach((ligne, idx) => {
                const bg = idx % 2 === 0 ? '#ffffff' : '#f7f9ff';
                doc.rect(startX, rowY, 495, 20).fill(bg);
                doc.fillColor('#333');
                let lx = startX + 5;
                const cells = [
                    { val: ligne.designation, align: 'left' },
                    { val: String(ligne.quantite), align: 'right' },
                    { val: this.formatMontant(ligne.prixUnitaire), align: 'right' },
                    { val: this.formatMontant(ligne.montant), align: 'right' },
                ];
                cells.forEach((cell, i) => {
                    doc.text(cell.val, lx, rowY + 5, {
                        width: widths[i] - 5,
                        align: cell.align,
                    });
                    lx += widths[i];
                });
                rowY += 20;
            });
            doc.rect(startX, tableTop + 22, 495, rowY - tableTop - 22).stroke('#dde3f0');
            rowY += 15;
            const totaux = [
                { label: 'Total HT', val: this.formatMontant(data.totalHT) },
                { label: 'TVA (18%)', val: this.formatMontant(data.tva) },
                { label: 'TOTAL TTC', val: this.formatMontant(data.totalTTC), bold: true },
            ];
            totaux.forEach((t) => {
                if (t.bold) {
                    doc.rect(320, rowY - 3, 225, 24).fill('#1565C0');
                    doc.fillColor('white').font('Helvetica-Bold').fontSize(11);
                    doc.text(t.label, 325, rowY + 2, { width: 100 });
                    doc.text(t.val + ' FCFA', 325, rowY + 2, { width: 210, align: 'right' });
                    rowY += 24;
                }
                else {
                    doc.fillColor('#333').font('Helvetica').fontSize(9);
                    doc.text(t.label, 325, rowY, { width: 100 });
                    doc.text(t.val + ' FCFA', 325, rowY, { width: 210, align: 'right' });
                    rowY += 18;
                }
            });
            if (data.notes) {
                rowY += 20;
                doc.fillColor('#555').fontSize(8).font('Helvetica-Bold').text('Notes :', 50, rowY);
                doc.font('Helvetica').text(data.notes, 50, rowY + 12, { width: 400 });
            }
            const footerY = doc.page.height - 60;
            doc.rect(0, footerY, doc.page.width, 60).fill('#1565C0');
            doc.fillColor('white').fontSize(8).font('Helvetica')
                .text('Merci pour votre confiance — Paiement à 30 jours', 50, footerY + 15, { align: 'center' })
                .text('ERP Industriel SaaS — Plateforme de gestion industrielle africaine', 50, footerY + 30, { align: 'center' });
            doc.end();
        });
    }
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-SN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    }
    formatMontant(val) {
        return new Intl.NumberFormat('fr-SN').format(Math.round(val));
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map