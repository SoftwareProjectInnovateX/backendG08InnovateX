import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { LoyaltyService, LoyaltyCustomer } from './loyalty.service';
import { AIService } from './ai.service';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';

@Controller('loyalty')
@UseGuards(FirebaseAuthGuard)
export class LoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly aiService: AIService,
  ) {}

  @Get('customer/:uid')
  async getCustomerProfile(@Param('uid') uid: string): Promise<LoyaltyCustomer | null> {
    return this.loyaltyService.getCustomerProfile(uid);
  }

  @Put('customer/:uid')
  async updateCustomerProfile(
    @Param('uid') uid: string,
    @Body() updates: Partial<LoyaltyCustomer>,
  ) {
    await this.loyaltyService.updateCustomerProfile(uid, updates);
    return { success: true };
  }

  @Post('purchase')
  async addPurchase(
    @Body() body: { uid: string; orderAmount: number; orderId: string },
  ) {
    await this.loyaltyService.addPurchase(body.uid, body.orderAmount, body.orderId);
    return { success: true };
  }

  @Get('top-customers')
  async getTopCustomers(): Promise<LoyaltyCustomer[]> {
    return this.loyaltyService.getTopCustomers();
  }

  @Get('analytics')
  async getAnalytics() {
    return this.loyaltyService.getAnalytics();
  }

  @Get('customer/:uid/offers')
  async getPersonalizedOffers(@Param('uid') uid: string): Promise<{ offers: string[] }> {
    const offers = await this.loyaltyService.generatePersonalizedOffers(uid);
    return { offers };
  }

  @Get('campaign-ideas')
  async getCampaignIdeas(): Promise<{ ideas: string[] }> {
    const ideas = await this.aiService.generateCampaignIdeas();
    return { ideas };
  }

  @Post('sync-from-orders')
  async syncFromOrders() {
    return this.loyaltyService.syncFromOrders();
  }
}