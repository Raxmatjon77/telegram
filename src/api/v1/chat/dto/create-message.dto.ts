import { MessageType } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The ID of the chat to send the message to',
    example: 'chat123',
    required: true
  })
  chatId: string;

  @ApiProperty({
    description: 'The text content of the message',
    example: 'Hello, how are you?',
    required: true
  })
  text: string;

  @ApiProperty({
    description: 'The type of the message (text, image, file, etc.)',
    example: 'text',
    required: false,
    enum: MessageType
  })
  type?: MessageType;

  @ApiProperty({
    description: 'The ID of the message this is a reply to',
    example: 'message456',
    required: false
  })
  replyToId?: string;
}