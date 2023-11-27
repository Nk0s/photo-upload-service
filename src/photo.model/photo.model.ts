import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Photo extends Document {
  @Prop()
  path: string;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
