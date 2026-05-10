import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ImageService } from './image.service';

@Module({
  controllers: [AiController],
  providers: [AiService, ImageService],
})
export class AiModule {}