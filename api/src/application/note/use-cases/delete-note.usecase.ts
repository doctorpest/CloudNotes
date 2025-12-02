import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { NoteId } from '../../../domain/note/note-id.value-object';

@Injectable()
export class DeleteNoteUseCase {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(id: string): Promise<void> {
    await this.noteRepo.delete(new NoteId(id));
  }
}
