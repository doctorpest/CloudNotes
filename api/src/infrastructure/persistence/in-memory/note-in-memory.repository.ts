import { NoteRepository } from '../../../domain/note/note.repository';
import { Note } from '../../../domain/note/note.entity';
import { NoteId } from '../../../domain/note/note-id.value-object';

export class NoteInMemoryRepository extends NoteRepository {
  private readonly notes = new Map<string, Note>();

  save(note: Note): Promise<void> {
    this.notes.set(note.id.toString(), note);
    return Promise.resolve();
  }

  findById(id: NoteId): Promise<Note | null> {
    return Promise.resolve(this.notes.get(id.toString()) ?? null);
  }

  findAll(): Promise<Note[]> {
    return Promise.resolve(Array.from(this.notes.values()));
  }

  delete(id: NoteId): Promise<void> {
    this.notes.delete(id.toString());
    return Promise.resolve();
  }
}
