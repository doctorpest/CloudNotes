import { Injectable } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { Note } from '../../../domain/note/note.entity';

@Injectable()
export class ListNotesUseCase {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(): Promise<Note[]> {
    return this.noteRepo.findAll();
  }
}
