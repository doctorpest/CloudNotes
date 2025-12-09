import { Note } from './note.entity';

export abstract class NotePdfExporter {
  abstract export(note: Note): Promise<Buffer>;
}
