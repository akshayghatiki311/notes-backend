import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { NotesService } from './notes.service';
  
  interface HandshakeQuery {
    userId: string;
  }
  @WebSocketGateway({ cors: { origin: '*' } })
  export class NotesGateway {
    @WebSocketServer() server: Server;
  
    constructor(private readonly notesService: NotesService) {}
  
    @SubscribeMessage('joinNote')
    async handleJoinNote(
      @MessageBody() data: { noteId: string },
      @ConnectedSocket() client: Socket
    ) {
      client.join(data.noteId);
      console.log(`Client ${client.id} joined note: ${data.noteId}`);
    }

  
    @SubscribeMessage('editNote')
async handleEditNote(
  @MessageBody() data: { noteId: string; content: string },
  @ConnectedSocket() client: Socket & { handshake: { query: HandshakeQuery } }
) {
  const { noteId, content } = data;

  const userId = client.handshake.query.userId;
  await this.notesService.validateAccess(noteId, userId);

  await this.notesService.updateNoteContent(noteId, content);

  this.server.to(noteId).emit('noteUpdated', { noteId, content });
}
  }
  