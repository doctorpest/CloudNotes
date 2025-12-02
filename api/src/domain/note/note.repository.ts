import { Note } from './note.entity';
import { NoteId } from './note-id.value-object';

export abstract class NoteRepository {
  abstract save(note: Note): Promise<void>;
  abstract findById(id: NoteId): Promise<Note | null>;
  abstract findAll(): Promise<Note[]>;
  abstract delete(id: NoteId): Promise<void>;
}
