import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { FirebaseModule } from '../../shared/firebase/firebase.module.js';

@Module({
  imports: [FirebaseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
