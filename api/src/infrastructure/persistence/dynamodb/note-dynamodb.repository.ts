import { NoteRepository } from '../../../domain/note/note.repository';
import { Note } from '../../../domain/note/note.entity';
import { NoteId } from '../../../domain/note/note-id.value-object';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

type NoteItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category?: string | null;
};

export class NoteDynamoDbRepository extends NoteRepository {
  private static isNoteItem(item: unknown): item is NoteItem {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    const isValidCategory =
      candidate.category === undefined ||
      candidate.category === null ||
      typeof candidate.category === 'string';

    return (
      typeof candidate.id === 'string' &&
      typeof candidate.title === 'string' &&
      typeof candidate.content === 'string' &&
      typeof candidate.createdAt === 'string' &&
      typeof candidate.updatedAt === 'string' &&
      isValidCategory
    );
  }

  private readonly tableName: string;
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    super();

    const region = process.env.AWS_REGION || 'eu-west-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT;

    const client = new DynamoDBClient({
      region,
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });

    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });

    this.tableName = process.env.NOTES_TABLE || 'CloudNotesNotes';
  }

  async save(note: Note): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          category: note.category ?? null,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        },
      }),
    );
  }

  async findById(id: NoteId): Promise<Note | null> {
    const res = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: id.toString() },
      }),
    );
    if (!res.Item) return null;

    if (!NoteDynamoDbRepository.isNoteItem(res.Item)) return null;

    return Note.restore(
      new NoteId(res.Item.id),
      res.Item.title,
      res.Item.content,
      new Date(res.Item.createdAt),
      new Date(res.Item.updatedAt),
      res.Item.category ?? null,
    );
  }

  async findAll(): Promise<Note[]> {
    const res = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );
    if (!res.Items) return [];
    return res.Items.filter((item): item is NoteItem =>
      NoteDynamoDbRepository.isNoteItem(item),
    ).map((item) =>
      Note.restore(
        new NoteId(item.id),
        item.title,
        item.content,
        new Date(item.createdAt),
        new Date(item.updatedAt),
        item.category ?? null,
      ),
    );
  }

  async delete(id: NoteId): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id: id.toString() },
      }),
    );
  }
}
