"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AIService = class AIService {
    openai;
    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
        else {
            this.openai = null;
            console.warn('⚠️  OpenAI API key not configured. AI features will use fallback responses.');
        }
    }
    async generatePersonalizedOffers(customerData) {
        if (!this.openai) {
            return [
                '10% discount on next purchase',
                'Free delivery on orders over $50',
                'Bonus loyalty points on vitamins',
                'Birthday special - 15% off your favorite items',
                'Refer a friend and earn bonus points'
            ];
        }
        const prompt = `
    Based on this customer data, suggest 3-5 personalized loyalty offers or promotions:
    - Name: ${customerData.name}
    - Level: ${customerData.level}
    - Total Spent: $${customerData.totalSpent}
    - Purchase Count: ${customerData.purchaseCount}
    - Average Order Value: $${customerData.averageOrderValue}
    - Last Purchase: ${customerData.lastPurchase}
    - Churn Risk: ${customerData.predictedChurnRisk}%

    Focus on pharmacy products and encourage repeat purchases.
    `;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
            });
            const suggestions = response.choices[0]?.message?.content?.split('\n').filter(line => line.trim()) || [];
            return suggestions.slice(0, 5);
        }
        catch (error) {
            console.error('AI service error:', error);
            return ['10% discount on next purchase', 'Free delivery on orders over $50', 'Bonus loyalty points on vitamins'];
        }
    }
    async predictChurnRisk(customerData) {
        const daysSinceLastPurchase = (Date.now() - new Date(customerData.lastPurchase).getTime()) / (1000 * 60 * 60 * 24);
        const risk = Math.min(100, Math.max(0, (daysSinceLastPurchase - 30) * 2 + (100 - customerData.purchaseCount)));
        return Math.round(risk);
    }
    async generateCampaignIdeas() {
        if (!this.openai) {
            return [
                'Monthly refill reminder program with points bonus',
                'Family health package discounts',
                'Senior citizen wellness rewards',
                'Seasonal vitamin promotion campaigns',
                'Loyalty points for health check referrals'
            ];
        }
        const prompt = `
    Generate 5 creative loyalty campaign ideas for a pharmacy, focusing on:
    - Encouraging repeat purchases
    - Medicine refill reminders
    - Seasonal promotions
    - Family health packages
    - Senior citizen discounts
    `;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            });
            return response.choices[0]?.message?.content?.split('\n').filter(line => line.trim()) || [];
        }
        catch (error) {
            console.error('AI service error:', error);
            return [
                'Monthly refill reminder program with points bonus',
                'Family health package discounts',
                'Senior citizen wellness rewards',
                'Seasonal vitamin promotion campaigns',
                'Loyalty points for health check referrals'
            ];
        }
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIService);
//# sourceMappingURL=ai.service.js.map