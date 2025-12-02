import { NoteId } from './note-id.value-object';

export class Note {
  private constructor(
    private _id: NoteId,
    private _title: string,
    private _content: string,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _category: string | null = null,
  ) {}

  get id(): NoteId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get category(): string | null {
    return this._category;
  }

  update(title: string, content: string, category?: string | null) {
    this._title = title;
    this._content = content;
    this._category = category ?? this._category;
    this._updatedAt = new Date();
  }

  static createNew(
    id: NoteId,
    title: string,
    content: string,
    category?: string | null,
  ): Note {
    const now = new Date();
    return new Note(id, title, content, now, now, category ?? null);
  }

  static restore(
    id: NoteId,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    category?: string | null,
  ): Note {
    return new Note(id, title, content, createdAt, updatedAt, category ?? null);
  }
}
