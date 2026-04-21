import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';

interface ChatRequest {
  message: string;
  history: { role: string; text: string }[];
}

@Controller('api/admin/chat')
@UseGuards(FirebaseAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequest) {
    const { message, history } = body;
    if (!message || message.trim() === '') {
      return { reply: 'Please type a message.' };
    }
    return this.chatService.chat(message.trim(), history || []);
  }
}