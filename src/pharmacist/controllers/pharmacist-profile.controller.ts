import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { PharmacistProfileService } from '../services/pharmacist-profile.service.js';

@Controller('pharmacist/profile')
export class PharmacistProfileController {
  constructor(private readonly profileService: PharmacistProfileService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @Put(':id')
  async updateProfile(@Param('id') id: string, @Body() updateData: any) {
    return this.profileService.updateProfile(id, updateData);
  }
}
