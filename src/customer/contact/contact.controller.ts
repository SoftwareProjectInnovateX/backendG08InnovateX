import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Customer: submit a message
  @Post()
  async sendMessage(@Body() body: any) {
    return this.contactService.sendMessage(body);
  }

  // Customer: get messages by email
  @Get('by-email')
  async getMessagesByEmail(@Query('email') email: string) {
    return this.contactService.getMessagesByEmail(email);
  }

  // Pharmacist: get all messages
  @Get()
  async getAllMessages() {
    return this.contactService.getAllMessages();
  }

  // Pharmacist: mark as read
  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  // Pharmacist: send reply
  @Put(':id/reply')
  async replyMessage(@Param('id') id: string, @Body() body: { reply: string }) {
    return this.contactService.replyMessage(id, body.reply);
  }
}