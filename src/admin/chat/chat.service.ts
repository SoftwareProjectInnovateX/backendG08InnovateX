import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY ?? '',
    });
  }

  private readonly prescriptionDrugs = [
    'amoxicillin',
    'azithromycin',
    'metformin',
    'atorvastatin',
    'adipalin',
    'sergey',
  ];

  private readonly systemPrompt = `
You are a health assistant for MediCareX pharmacy.

RULES — follow strictly:
1. For general health and first aid advice, follow WHO (World Health Organization) guidelines only.
   For OTC product advice, you may also refer to NHS (UK National Health Service) and FDA (US Food & Drug Administration) guidelines.
   If none of these sources have guidance on a topic, say: "I don't have verified information on that. Please consult a doctor."
2. NEVER recommend or mention prescription drugs.
   If asked, say: "That requires a prescription. Please consult a licensed doctor."
3. You CAN recommend OTC products approved by WHO, NHS, or FDA: Paracetamol, Ibuprofen, antacids, antihistamines, vitamins, baby care items.
4. Always end responses with:
   "⚕️ This is general health information only. Not a substitute for professional medical advice."
5. If symptoms sound life-threatening (chest pain, difficulty breathing), say:
   "This sounds serious. Please call emergency services or go to a hospital immediately."
6. Formatting rules:
   - NEVER use markdown tables.
   - Limit responses to 2-3 short sentences (a single clean paragraph).
   - Use simple bullet points (maximum 3, if necessary) rather than dense headers or multi-section checklists.
   - Keep the language conversational, brief, and suitable for a compact chat interface.
`;

  async chat(
    message: string,
    history: { role: string; text: string }[],
  ): Promise<{ reply: string }> {
    // Block prescription drugs
    const messageLower = message.toLowerCase();
    const foundDrug = this.prescriptionDrugs.find((drug) =>
      messageLower.includes(drug.toLowerCase()),
    );
    if (foundDrug) {
      return {
        reply: `${foundDrug.charAt(0).toUpperCase() + foundDrug.slice(1)} is a prescription medication. Please consult a licensed doctor.\n\n⚕️ This is general health information only — not a substitute for professional medical advice.`,
      };
    }

    try {
      // Build message history for Groq
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
        ...history.map((msg) => ({
          role:
            msg.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.text,
        })),
        { role: 'user', content: message },
      ];

      const response = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages,
        max_tokens: 500,
      });

      const reply =
        response.choices[0]?.message?.content ??
        'Sorry, I could not generate a response.';
      return { reply };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Groq error:', msg);
      return { reply: 'Sorry, I am currently unavailable. Please try again.' };
    }
  }
}
