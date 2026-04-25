import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':uid')
  async getProfile(@Param('uid') uid: string) {
    return this.profileService.getProfile(uid);
  }

  @Put(':uid')
  async updateProfile(@Param('uid') uid: string, @Body() body: any) {
    return this.profileService.updateProfile(uid, body);
  }
}