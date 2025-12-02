import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { CreateNoteUseCase } from '../../../application/note/use-cases/create-note.usecase';
import { ListNotesUseCase } from '../../../application/note/use-cases/list-notes.usecase';
import { GetNoteUseCase } from '../../../application/note/use-cases/get-note.usecase';
import { DeleteNoteUseCase } from '../../../application/note/use-cases/delete-note.usecase';
import { NoteRepository } from '../../../domain/note/note.repository';
// import { NoteInMemoryRepository } from '../../persistence/in-memory/note-in-memory.repository';
import { NoteDynamoDbRepository } from '../../persistence/dynamodb/note-dynamodb.repository';
import { UpdateNoteUseCase } from 'src/application/note/use-cases/update-note.usecase';

@Module({
  controllers: [NoteController],
  providers: [
    {
      provide: NoteRepository,
      useClass: NoteDynamoDbRepository, // 🔁 ICI on switche
    },
    CreateNoteUseCase,
    ListNotesUseCase,
    GetNoteUseCase,
    DeleteNoteUseCase,
    UpdateNoteUseCase,
  ],
})
export class NoteModule {}
