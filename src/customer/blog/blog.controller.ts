import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';
import { BlogService } from './blog.service.js';

@Controller('customer/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Route to get latest 3 published blogs for landing page
  @Get('latest')
  async getLatestBlogs() {
    return await this.blogService.getLatestPublishedBlogs();
  }

  // Route to get the pending blog for admin approval
  @UseGuards(FirebaseAuthGuard)
  @Get('admin/pending')
  async getPendingBlog() {
    return await this.blogService.getPendingBlog();
  }

  // Route to approve a blog
  @UseGuards(FirebaseAuthGuard)
  @Post('admin/approve/:id')
  async approveBlog(@Param('id') id: string) {
    return await this.blogService.approveBlog(id);
  }

  // Route to reject a blog
  @UseGuards(FirebaseAuthGuard)
  @Post('admin/reject/:id')
  async rejectBlog(@Param('id') id: string) {
    return await this.blogService.rejectBlog(id);
  }

  // Route to get a specific blog by ID
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogService.getBlogById(id);
  }

  // Route to like a blog
  @Post(':id/like')
  async likeBlog(@Param('id') id: string) {
    return await this.blogService.incrementLikes(id);
  }

  // Route to get comments for a blog
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return await this.blogService.getComments(id);
  }

  // Route to add a comment
  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body('userName') userName: string,
    @Body('text') text: string
  ) {
    return await this.blogService.addComment(id, userName, text);
  }

  // Route to manually trigger AI generation (Useful for your Viva demo)
  @UseGuards(FirebaseAuthGuard)
  @Post('generate-test')
  async triggerGeneration() {
    return await this.blogService.generateAutomatedHealthBlog();
  }

  // Route to seed distinct published blogs
  @UseGuards(FirebaseAuthGuard)
  @Post('seed')
  async seedBlogs() {
    return await this.blogService.seedBlogs();
  }

  // Route to delete all existing blogs
  @UseGuards(FirebaseAuthGuard)
  @Post('delete-all')
  async deleteAllBlogs() {
    return await this.blogService.deleteAllBlogs();
  }
}
