import { Controller, Get, Post, Param, HttpCode } from '@nestjs/common';
import { AccountRequestsService } from './account-requests.service.js';

@Controller('api/account-requests')
export class AccountRequestsController {
  constructor(private readonly service: AccountRequestsService) {}

  @Get()
  getAll() {
    return this.service.getRequests();
  }

  @Post(':id/approve')
  @HttpCode(200)
  approve(@Param('id') id: string) {
    return this.service.approveRequest(id);
  }

  @Post(':id/reject')
  @HttpCode(200)
  reject(@Param('id') id: string) {
    return this.service.rejectRequest(id);
  }
}
