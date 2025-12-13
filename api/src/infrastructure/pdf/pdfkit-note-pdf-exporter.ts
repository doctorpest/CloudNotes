import { Injectable } from '@nestjs/common';
import { NotePdfExporter } from '../../domain/note/note-pdf-exporter';
import { Note } from '../../domain/note/note.entity';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfKitNotePdfExporter implements NotePdfExporter {
  async export(note: Note): Promise<Buffer> {
    const doc = new PDFDocument({
      margin: 40,
      info: {
        Title: note.title || 'Note',
        Author: 'CloudNotes',
      },
    });

    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const marginLeft = doc.page.margins.left;
      const marginRight = doc.page.margins.right;

      // Fond lavande très doux
      doc.save().rect(0, 0, pageWidth, pageHeight).fill('#F5F3FF').restore();

      // Bande verticale à gauche (style carnet)
      const bandWidth = 32;
      doc.save().rect(0, 0, bandWidth, pageHeight).fill('#E0E7FF').restore();

      for (let y = 40; y < pageHeight - 40; y += 28) {
        doc
          .save()
          .circle(bandWidth / 2, y, 2.2)
          .fill('#CBD5F5')
          .restore();
      }

      /* ---------- CARTE CENTRALE POUR LA NOTE ---------- */

      const cardWidth = pageWidth - marginLeft - marginRight - 30;
      const cardX = marginLeft + 20;
      const cardY = 70;
      const cardHeight = pageHeight - cardY - 70;

      doc
        .save()
        .rect(cardX + 3, cardY + 4, cardWidth, cardHeight)
        .fill('#E5E7EB')
        .restore();

      // Carte principale
      doc
        .save()
        .roundedRect(cardX, cardY, cardWidth, cardHeight, 18)
        .fill('#FEFEFF')
        .restore();

      /* ---------- HEADER DANS LA CARTE ---------- */

      let cursorY = cardY + 26;

      doc
        .fontSize(22)
        .fillColor('#111827')
        .text(note.title || '(Sans titre)', cardX + 30, cursorY, {
          width: cardWidth - 60,
          align: 'center',
        });

      cursorY = doc.y + 6;

      const titleAccentWidth = 90;
      const titleAccentX = cardX + (cardWidth - titleAccentWidth) / 2;
      doc
        .save()
        .moveTo(titleAccentX, cursorY)
        .lineTo(titleAccentX + titleAccentWidth, cursorY)
        .lineWidth(2.2)
        .strokeColor('#A855F7') // violet accent
        .stroke()
        .restore();

      cursorY += 14;

      const created = note.createdAt.toLocaleString();
      const updated = note.updatedAt.toLocaleString();

      if (note.category) {
        const chipText = note.category;
        doc.fontSize(10);
        const chipTextWidth = doc.widthOfString(chipText);
        const chipWidth = chipTextWidth + 26;
        const chipHeight = 18;
        const chipX = cardX + (cardWidth - chipWidth) / 2;
        const chipY = cursorY;

        // Fond pill
        doc
          .save()
          .roundedRect(chipX, chipY, chipWidth, chipHeight, 999)
          .fill('#FCE7F3')
          .restore();

        // Texte pill
        doc
          .fontSize(10)
          .fillColor('#BE185D')
          .text(chipText, chipX, chipY + 3, {
            width: chipWidth,
            align: 'center',
          });

        cursorY = chipY + chipHeight + 10;
      }

      // Dates
      doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`créée le ${created}`, cardX + 30, cursorY, {
          width: cardWidth - 60,
          align: 'center',
        });

      cursorY = doc.y + 2;

      doc
        .fontSize(9)
        .fillColor('#9CA3AF')
        .text(`dernière modification ${updated}`, cardX + 30, cursorY, {
          width: cardWidth - 60,
          align: 'center',
        });

      cursorY = doc.y + 18;

      const contentPaddingX = 28;
      const contentLeft = cardX + contentPaddingX;
      const contentRight = cardX + cardWidth - contentPaddingX;
      const contentTop = cursorY + 4;
      const contentBottom = cardY + cardHeight - 32;
      /* ---------- LIGNES DE LA ZONE DE TEXTE ---------- */
      doc.save().lineWidth(0.4).strokeColor('#E5E7EB');
      for (let y = contentTop; y < contentBottom; y += 16) {
        doc.moveTo(contentLeft, y).lineTo(contentRight, y).stroke();
      }
      doc.restore();

      /* ---------- CONTENU DE LA NOTE ---------- */

      doc
        .fontSize(12)
        .fillColor('#111827')
        .text(note.content, contentLeft, contentTop - 4, {
          width: contentRight - contentLeft,
          align: 'left',
          lineGap: 4,
        });

      /* ---------- PETIT BADGE EN BAS DE LA CARTE ---------- */

      const badgeText = 'CloudNotes • export PDF';
      doc.fontSize(8).fillColor('#9CA3AF');
      const badgeWidth = doc.widthOfString(badgeText) + 16;
      const badgeHeight = 14;
      const badgeX = cardX + cardWidth - badgeWidth - 18;
      const badgeY = cardY + cardHeight - badgeHeight - 10;

      doc
        .save()
        .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 999)
        .fill('#F3F4F6')
        .restore();

      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(badgeText, badgeX, badgeY + 2, {
          width: badgeWidth,
          align: 'center',
        });

      /* ---------- FOOTER ---------- */

      doc
        .fontSize(8)
        .fillColor('#9CA3AF')
        .text('généré avec ♥ par CloudNotes', marginLeft, pageHeight - 30, {
          width: pageWidth - marginLeft - marginRight,
          align: 'center',
        });

      doc.end();
    });
  }
}
