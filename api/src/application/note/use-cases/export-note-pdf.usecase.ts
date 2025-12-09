import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { NoteId } from '../../../domain/note/note-id.value-object';
import { NotePdfExporter } from '../../../domain/note/note-pdf-exporter';

@Injectable()
export class ExportNotePdfUseCase {
  constructor(
    private readonly noteRepo: NoteRepository,
    private readonly pdfExporter: NotePdfExporter,
  ) {}

  async execute(noteId: string): Promise<{ filename: string; buffer: Buffer }> {
    const id = new NoteId(noteId);
    const note = await this.noteRepo.findById(id);

    if (!note) {
      throw new NotFoundException(`Note with id ${noteId} not found`);
    }

    const buffer = await this.pdfExporter.export(note);
    const safeTitle = (note.title || 'note')
      .replace(/[^a-z0-9\-_\s]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const filename = `${safeTitle || 'note'}-${note.id.toString()}.pdf`;

    return { filename, buffer };
  }
}
