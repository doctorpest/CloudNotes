import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { CreateNoteUseCase } from '../../../application/note/use-cases/create-note.usecase';
import { ListNotesUseCase } from '../../../application/note/use-cases/list-notes.usecase';
import { GetNoteUseCase } from '../../../application/note/use-cases/get-note.usecase';
import { DeleteNoteUseCase } from '../../../application/note/use-cases/delete-note.usecase';
import { CreateNoteDto } from '../../../application/note/dto/create-note.dto';
import { Patch } from '@nestjs/common';
import { UpdateNoteDto } from '../../../application/note/dto/update-note.dto';
import { UpdateNoteUseCase } from '../../../application/note/use-cases/update-note.usecase';

@Controller('notes')
export class NoteController {
  constructor(
    private readonly createNote: CreateNoteUseCase,
    private readonly listNotes: ListNotesUseCase,
    private readonly getNote: GetNoteUseCase,
    private readonly deleteNote: DeleteNoteUseCase,
    private readonly updateNote: UpdateNoteUseCase, // 👈 ajouté
  ) {}

  @Post()
  async create(@Body() body: CreateNoteDto) {
    const note = await this.createNote.execute(body);
    return {
      id: note.id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  @Get()
  async list() {
    const notes = await this.listNotes.execute();
    return notes.map((n) => ({
      id: n.id.toString(),
      title: n.title,
      content: n.content,
      category: n.category,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const note = await this.getNote.execute(id);
    return {
      id: note.id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateNoteDto) {
    const note = await this.updateNote.execute(id, body);
    return {
      id: note.id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteNote.execute(id);
    return { deleted: true };
  }
}
