import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from '../../../domain/note/note.repository';
import { Note } from '../../../domain/note/note.entity';
import { NoteId } from '../../../domain/note/note-id.value-object';
import { UpdateNoteDto } from '../dto/update-note.dto';

@Injectable()
export class UpdateNoteUseCase {
  constructor(private readonly noteRepo: NoteRepository) {}

  async execute(id: string, dto: UpdateNoteDto): Promise<Note> {
    const noteId = new NoteId(id);
    const existing = await this.noteRepo.findById(noteId);

    if (!existing) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    const newTitle = dto.title ?? existing.title;
    const newContent = dto.content ?? existing.content;
    const newCategory = dto.category ?? existing.category;

    existing.update(newTitle, newContent, newCategory);
    await this.noteRepo.save(existing);

    return existing;
  }
}
