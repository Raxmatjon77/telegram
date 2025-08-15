import { MessageType } from "@prisma/client";

export class CreateMessageDto {
  chatId: string;
  text: string;
  type?: MessageType;
  replyToId?: string;
}