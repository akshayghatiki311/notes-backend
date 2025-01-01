import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  // Create a new note
  async create(noteDto: any): Promise<Note> {
    return this.noteModel.create(noteDto);
  }

  // Get all notes for a specific user
  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel.find({ $or: [{ owner: userId }, { collaborators: userId }] }).exec();
  }

  // Find a specific note by ID
  async findById(noteId: string): Promise<Note | null> {
    return this.noteModel.findById(noteId).exec();
  }

  // Update a note
  async update(noteId: string, updateDto: any): Promise<Note> {
    return this.noteModel.findByIdAndUpdate(noteId, updateDto, { new: true }).exec();
  }

  // Delete a note
  async delete(noteId: string): Promise<any> {
    return this.noteModel.findByIdAndDelete(noteId).exec();
  }

  // Add a collaborator to a note
  async addCollaborator(noteId: string, collaboratorId: string, ownerId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    if (note.owner !== ownerId) {
      throw new ForbiddenException('You are not the owner of this note');
    }
  
    if (note.collaborators.includes(collaboratorId)) {
      throw new BadRequestException('Collaborator already added');
    }
  
    note.collaborators.push(collaboratorId);
    return note.save();
  }

  // Remove a collaborator from a note
  async removeCollaborator(noteId: string, collaboratorId: string, ownerId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    if (note.owner !== ownerId) {
      throw new ForbiddenException('You are not the owner of this note');
    }
  
    note.collaborators = note.collaborators.filter((id) => id !== collaboratorId);
    return note.save();
  }

  // Validate access to a note
  async validateAccess(noteId: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    if (note.owner !== userId && !note.collaborators.includes(userId)) {
      throw new ForbiddenException('You do not have access to this note');
    }
  
    return note;
  }
  
  // Update the content of a note
  async updateNoteContent(noteId: string, content: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    note.content = content;
    return note.save();
  }
  
  
}
