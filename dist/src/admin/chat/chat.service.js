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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let ChatService = class ChatService {
    groq;
    constructor() {
        this.groq = new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY ?? '',
        });
    }
    prescriptionDrugs = [
        'amoxicillin',
        'azithromycin',
        'metformin',
        'atorvastatin',
        'adipalin',
        'sergey',
    ];
    systemPrompt = `
You are a health assistant for MediCareX pharmacy.

RULES — follow strictly:
1. Only provide advice based on WHO (World Health Organization) guidelines.
   If WHO has no guidance, say: "I don't have WHO-backed information on that. Please consult a doctor."
2. NEVER recommend or mention prescription drugs.
   If asked, say: "That requires a prescription. Please consult a licensed doctor."
3. You CAN recommend OTC products: Paracetamol, Ibuprofen, vitamins, baby care items.
4. Always end responses with:
   "⚕️ This is general health information only. Not a substitute for professional medical advice."
5. If symptoms sound life-threatening (chest pain, difficulty breathing), say:
   "This sounds serious. Please call emergency services or go to a hospital immediately."
6. Keep responses short and in simple language.
`;
    async chat(message, history) {
        const messageLower = message.toLowerCase();
        const foundDrug = this.prescriptionDrugs.find((drug) => messageLower.includes(drug.toLowerCase()));
        if (foundDrug) {
            return {
                reply: `${foundDrug.charAt(0).toUpperCase() + foundDrug.slice(1)} is a prescription medication. Please consult a licensed doctor.\n\n⚕️ This is general health information only — not a substitute for professional medical advice.`,
            };
        }
        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...history.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.text,
                })),
                { role: 'user', content: message },
            ];
            const response = await this.groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages,
                max_tokens: 500,
            });
            const reply = response.choices[0]?.message?.content ??
                'Sorry, I could not generate a response.';
            return { reply };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('Groq error:', msg);
            return { reply: 'Sorry, I am currently unavailable. Please try again.' };
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChatService);
//# sourceMappingURL=chat.service.js.map