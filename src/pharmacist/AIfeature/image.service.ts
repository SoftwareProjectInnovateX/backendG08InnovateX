import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  async generateImage(
    name: string,
    category?: string,
  ): Promise<{ imageUrl: string }> {
    const query = `${name} ${category} medicine product`;

    const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}&num=1`;

    const response = await fetch(url);
    const data = await response.json();

    console.log('SerpApi response:', JSON.stringify(data?.images_results?.[0]));

    const imageUrl = data?.images_results?.[0]?.original;

    if (!imageUrl) {
      throw new Error('No image found');
    }

    return { imageUrl };
  }
}
