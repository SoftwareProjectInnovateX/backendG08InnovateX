import { Module } from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { BlogController } from './blog.controller.js';
import { FirebaseModule } from '../../shared/firebase/firebase.module.js';

@Module({
  imports: [FirebaseModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
