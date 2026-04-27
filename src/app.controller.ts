import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './shared/firebase/firebase.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('set-admin')
  async setAdmin() {
    await this.firebaseService.getAdmin().setCustomUserClaims('r0xXWdAeqGagF3MSCGc9pXcghu73', { role: 'admin' });
    return { success: true };
  }

  @Get('check-admin')
  async checkAdmin() {
    const user = await this.firebaseService.getAdmin().getUser('r0xXWdAeqGagF3MSCGc9pXcghu73');
    return { customClaims: user.customClaims };
  }
}