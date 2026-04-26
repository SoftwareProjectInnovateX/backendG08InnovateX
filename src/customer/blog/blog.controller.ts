import { Controller, Get, Post, Param } from '@nestjs/common';
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
  @Get('admin/pending')
  async getPendingBlog() {
    return await this.blogService.getPendingBlog();
  }

  // Route to approve a blog
  @Post('admin/approve/:id')
  async approveBlog(@Param('id') id: string) {
    return await this.blogService.approveBlog(id);
  }

  // Route to reject a blog
  @Post('admin/reject/:id')
  async rejectBlog(@Param('id') id: string) {
    return await this.blogService.rejectBlog(id);
  }

  // Route to get a specific blog by ID
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogService.getBlogById(id);
  }

  // Route to manually trigger AI generation (Useful for your Viva demo)
  @Post('generate-test')
  async triggerGeneration() {
    return await this.blogService.generateAutomatedHealthBlog();
  }

  // Route to seed distinct published blogs
  @Post('seed')
  async seedBlogs() {
    return await this.blogService.seedBlogs();
  }

  // Route to delete all existing blogs
  @Post('delete-all')
  async deleteAllBlogs() {
    return await this.blogService.deleteAllBlogs();
  }
}
