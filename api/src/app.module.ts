import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NoteModule } from './infrastructure/api/note/note.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NoteModule],
})
export class AppModule {}
