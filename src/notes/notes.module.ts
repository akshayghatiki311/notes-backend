import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from './schemas/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]), // Register the schema
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService], // Export if needed in other modules
})
export class NotesModule {}
