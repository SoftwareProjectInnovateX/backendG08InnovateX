import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ImageService } from './image.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly imageService: ImageService,
  ) {}

  @Post('describe')
  describe(@Body() body: { name: string; category?: string }) {
    return this.aiService.generateDescription(body.name, body.category);
  }

  @Post('generate-image')
  generateImage(@Body() body: { name: string; category?: string }) {
    return this.imageService.generateImage(body.name, body.category);
  }
}