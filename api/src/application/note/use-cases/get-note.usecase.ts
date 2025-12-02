import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { Note } from '../../../domain/note/note.entity';
import { NoteId } from '../../../domain/note/note-id.value-object';

@Injectable()
export class GetNoteUseCase {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(id: string): Promise<Note> {
    const note = await this.noteRepo.findById(new NoteId(id));
    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    return note;
  }
}
