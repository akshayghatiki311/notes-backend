import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard) // Protect all note-related routes
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // Create a new note
  @Post()
  async create(@Body() createNoteDto: CreateNoteDto, @Request() req: any) {
    createNoteDto.owner = req.user.userId; // Automatically set the owner as the logged-in user
    return this.notesService.create(createNoteDto);
  }

  // Get all notes for the logged-in user
  @Get()
  async findAll(@Request() req: any) {
    return this.notesService.findAll(req.user.userId);
  }

  // Get a specific note by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const note = await this.notesService.findById(id);
    if (!note) {
      return { message: 'Note not found' };
    }
    return note;
  }

  // Update a note
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, updateNoteDto);
  }

  // Delete a note
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }

  // Add a collaborator to a note
  @Post(':id/collaborators')
  @UseGuards(JwtAuthGuard)
  async addCollaborator(
    @Param('id') noteId: string,
    @Body('collaboratorEmails') collaboratorEmails: string,
    @Request() req
  ) {
    const emails = collaboratorEmails.split(',');
    return this.notesService.addCollaborators(noteId, emails, req.user.userId);
  }

  // Remove a collaborator from a note
  @Delete(':id/collaborators')
  @UseGuards(JwtAuthGuard)
  async removeCollaborator(
    @Param('id') noteId: string,
    @Body('collaboratorId') collaboratorId: string,
    @Request() req
  ) {
    return this.notesService.removeCollaborator(noteId, collaboratorId, req.user.userId);
  }

  // Endpoint to allow collaborative real-time editing (for WebSocket validation)
  @Post(':id/edit')
  async editNote(
    @Param('id') noteId: string,
    @Body('content') content: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    const email = req.user.email;

    // Validate if the user has access to edit the note
    const note = await this.notesService.validateAccess(noteId, userId, email);

    // Update the content in the database
    return this.notesService.updateNoteContent(noteId, content);
  }

  
  // Get all notes in which the user is a collaborator
  @Get('get/collaborations')
  @UseGuards(JwtAuthGuard)
  async getCollaborations(@Request() req) {
    const email = req.user.email;
    return this.notesService.findAllByCollaborator(email);
  }


}
