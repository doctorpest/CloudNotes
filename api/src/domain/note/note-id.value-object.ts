export class NoteId {
  constructor(private readonly value: string) {
    if (!value) {
      throw new Error('NoteId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: NoteId): boolean {
    return this.value === other.value;
  }
}
