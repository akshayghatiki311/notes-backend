import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Note extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ default: [] })
  collaborators: string[];
}

export const NoteSchema = SchemaFactory.createForClass(Note);
