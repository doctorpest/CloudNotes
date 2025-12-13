import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { CreateNoteUseCase } from '../../../application/note/use-cases/create-note.usecase';
import { ListNotesUseCase } from '../../../application/note/use-cases/list-notes.usecase';
import { GetNoteUseCase } from '../../../application/note/use-cases/get-note.usecase';
import { DeleteNoteUseCase } from '../../../application/note/use-cases/delete-note.usecase';
import { NoteRepository } from '../../../domain/note/note.repository';
import { NoteDynamoDbRepository } from '../../persistence/dynamodb/note-dynamodb.repository';
import { UpdateNoteUseCase } from 'src/application/note/use-cases/update-note.usecase';
import { NotePdfExporter } from '../../../domain/note/note-pdf-exporter';
import { PdfKitNotePdfExporter } from '../../pdf/pdfkit-note-pdf-exporter';
import { ExportNotePdfUseCase } from '../../../application/note/use-cases/export-note-pdf.usecase';

@Module({
  controllers: [NoteController],
  providers: [
    {
      provide: NoteRepository,
      useClass: NoteDynamoDbRepository,
    },
    CreateNoteUseCase,
    ListNotesUseCase,
    GetNoteUseCase,
    DeleteNoteUseCase,
    UpdateNoteUseCase,
    ExportNotePdfUseCase,
    {
      provide: NotePdfExporter,
      useClass: PdfKitNotePdfExporter,
    },
  ],
})
export class NoteModule {}
