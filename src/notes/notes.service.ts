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
    return this.noteModel.find({  owner: userId } ).exec();
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

  // Add collaborators to a note
  async addCollaborators(noteId: string, emails: string[], ownerId: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    // if (note.owner !== ownerId) {
    //   throw new ForbiddenException('You are not the owner of this note to add collaborators');
    // }
  
    const newCollaborators = emails;
    note.collaborators = [...newCollaborators];
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
  async validateAccess(noteId: string, userId: string, email: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
  
    if (note.owner !== userId && !note.collaborators.includes(email)) {
      throw new ForbiddenException('You do not have access to this note');
    }
  
    return note;
  }
  
  // Update the content of a note
  async updateNoteContent(noteId: string, title:string, content: string): Promise<Note> {
    const note = await this.noteModel.findById(noteId);
  
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    note.title = title;
    note.content = content;
    return note.save();
  }
  
  
  // Find all notes where the email id is a collaborator
  async findAllByCollaborator(emailId: string): Promise<Note[]> {
    return this.noteModel.find({ collaborators: { $in: [emailId] } }).exec();
  }
  
  
}
