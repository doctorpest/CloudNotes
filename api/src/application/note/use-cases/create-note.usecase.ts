import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { CreateNoteDto } from '../dto/create-note.dto';
import { Note } from '../../../domain/note/note.entity';
import { NoteId } from '../../../domain/note/note-id.value-object';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateNoteUseCase {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(dto: CreateNoteDto): Promise<Note> {
    const note = Note.createNew(
      new NoteId(randomUUID()),
      dto.title,
      dto.content,
      dto.category ?? null,
    );
    await this.noteRepo.save(note);
    return note;
  }
}
