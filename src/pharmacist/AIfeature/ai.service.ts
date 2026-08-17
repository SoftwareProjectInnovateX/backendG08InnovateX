import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async generateDescription(name: string, category?: string) {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // fast + free
          messages: [
            {
              role: 'user',
              content: `You are a professional pharmacy product copywriter. Write an attractive and detailed product description for a pharmacy product with the following details:
- Product Name: "${name}"
- Category: "${category}"

Write the description in 3 short paragraphs:
1. What the product is and what it does
2. Key benefits and who should use it
3. Usage advice and why customers should trust it

Make it warm, professional, and easy to read. Only return the paragraphs, no headings, no bullet points, no extra text.`,
            },
          ],
          max_tokens: 500,
        }),
      },
    );

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    if (data.error) {
      throw new Error(`Groq error: ${data.error.message}`);
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content returned from Groq');
    }

    return { description: data.choices[0].message.content };
  }
}
