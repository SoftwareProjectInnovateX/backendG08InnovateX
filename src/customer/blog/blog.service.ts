import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { BLOG_STATUS, BLOG_CONFIG } from './blog.constants.js';
import OpenAI from 'openai';

const PREDEFINED_TOPICS = [
  { topic: "Epidemics and Communicable Diseases (Wasangatha Roga)", image: "https://images.unsplash.com/photo-1584483760114-41352ce00f40?w=800&q=80" },
  { topic: "Daily Fitness and Exercise", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" },
  { topic: "Diabetes (Diyawadiyawa) Prevention and Management", image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80" },
  { topic: "Heart Attacks and Cardiovascular Health", image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&q=80" },
  { topic: "Viral Infections and Immunity Boosting", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80" },
  { topic: "Dengue Fever Prevention and Mosquito Control", image: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?w=800&q=80" },
  { topic: "Arthritis (Atharaitees) and Joint Care", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80" },
  { topic: "High Blood Pressure and Hypertension", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80" },
  { topic: "Asthma and Respiratory Health", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80" },
  { topic: "Mental Health and Stress Management", image: "https://images.unsplash.com/photo-1474418397713-7ded61d46e18?w=800&q=80" },
  { topic: "HIV/AIDS Awareness and Prevention", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80" },
  { topic: "Rabies (Jalabeethikawa) and Pet Vaccination", image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80" },
  { topic: "Leptospirosis (Mee Una / Rat Fever) Prevention for Farmers", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },
  { topic: "Tuberculosis (Kshaya Rogaya) Symptoms and Cure", image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2ad4c?w=800&q=80" },
  { topic: "Chronic Kidney Disease (CKDu / Wrukka Rogaya) and Safe Drinking Water", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf3d?w=800&q=80" },
  { topic: "Maternal Health and Safe Pregnancy (Maathru Sowkhyaya)", image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80" },
  { topic: "Cataract (Sudha Ema) and Senior Eye Care", image: "https://images.unsplash.com/photo-1579154235828-40198284882c?w=800&q=80" },
  { topic: "First Aid for Snakebites in Sri Lanka", image: "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=800&q=80" },
  { topic: "Oral Cancer and Dangers of Betel Chewing (Bulath Kema)", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80" },
  { topic: "Thyroid Disorders (Vasiya) Symptoms and Management", image: "https://images.unsplash.com/photo-1576091160550-2173bdd99625?w=800&q=80" },
  { topic: "Child Nutrition and Preventing Malnutrition", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" }
];

@Injectable()
export class BlogService {
  private groq: OpenAI;

  constructor(
    private firebase: FirebaseService,
    private configService: ConfigService
  ) {}

  private getGroqClient() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') || process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('dummy')) {
      console.warn('WARNING: Using a dummy or missing GROQ_API_KEY. Generation will fail.');
    }
    return new OpenAI({
      apiKey: apiKey || 'gsk_dummy_key',
      baseURL: this.configService.get<string>('GROQ_BASE_URL') || process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    });
  }

  @Cron(BLOG_CONFIG.DAILY_CRON)
  async generateAutomatedHealthBlog() {
    try {
      const groqClient = this.getGroqClient();
      
      // Fetch existing blogs to avoid duplicate topics
      const existingSnapshot = await this.firebase.getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.PUBLISHED)
        .get();
      
      const existingTopics = existingSnapshot.docs.map(doc => doc.data().topic).filter(Boolean);
      
      // Filter available topics that are not already published
      let availableTopics = PREDEFINED_TOPICS.filter(t => !existingTopics.includes(t.topic));
      
      // Fallback if all topics are used, allow all again
      if (availableTopics.length === 0) availableTopics = PREDEFINED_TOPICS;
      
      const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
      const topic = randomTopic.topic;
      
      const response = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [{
          role: "user",
          content: `Write an engaging and conversational blog post about ${topic}. 
                    Requirements:
                    1. Keep the language very simple and easy to understand for an ordinary citizen (no complex medical jargon).
                    2. Provide practical, easy-to-follow health tips.
                    3. Give priority to the Sri Lankan context.
                    4. The tone should be smart, engaging, and relatable.
                    5. Format the post clearly using Markdown.
                    
                    You MUST return the output as a valid JSON object with the exact following structure:
                    {
                      "title": "<Catchy Title>",
                      "content": "<The full markdown content including disclaimer>",
                      "imagePrompt": "<A highly detailed, English prompt for generating a realistic, professional medical photograph related to this exact topic. Make it highly descriptive (e.g. 'A highly realistic, professional, cinematic 8k photograph of...')>"
                    }`
        }],
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) throw new Error("Empty response from AI");
      
      const parsedData = JSON.parse(responseText);
      const blogTitle = parsedData.title || topic;
      const blogContent = parsedData.content || '';

      const newBlogPost = {
        title: blogTitle,
        content: blogContent,
        imageUrl: randomTopic.image,
        topic: topic, // Store topic for deduplication
        status: BLOG_STATUS.PUBLISHED,
        createdAt: new Date().toISOString(),
      };

      const addedBlog = await this.firebase.getDb().collection('blogs').add(newBlogPost);

      // Keep only the latest 10 blogs
      const snapshot = await this.firebase.getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.PUBLISHED)
        .get();

      const docs = snapshot.docs.map(doc => ({ ref: doc.ref, data: doc.data() }));
      docs.sort((a: any, b: any) => {
        const timeA = a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0;
        const timeB = b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      if (docs.length > 10) {
        const batch = this.firebase.getDb().batch();
        docs.slice(10).forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }

      return addedBlog;
    } catch (error) {
      console.error('AI Generation Error Details:', error); 
      throw new InternalServerErrorException('AI Content Generation Failed');
    }
  }

  async getLatestPublishedBlogs() {
    const snapshot = await this.firebase.getDb()
      .collection('blogs')
      .where('status', '==', BLOG_STATUS.PUBLISHED)
      .get();

    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    
    return docs.slice(0, BLOG_CONFIG.LANDING_PAGE_LIMIT);
  }

  async getPendingBlog() {
    try {
      const snapshot = await this.firebase.getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.DRAFT)
        .get();
        
      if (snapshot.empty) {
        return null;
      }
      
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      return docs[0];
    } catch (error) {
      console.error("ERROR IN getPendingBlog:", error);
      throw error;
    }
  }

  async approveBlog(id: string) {
    const docRef = this.firebase.getDb().collection('blogs').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException('Blog not found');
    }

    await docRef.update({
      status: BLOG_STATUS.PUBLISHED,
      createdAt: new Date().toISOString()
    });

    const snapshot = await this.firebase.getDb()
      .collection('blogs')
      .where('status', '==', BLOG_STATUS.PUBLISHED)
      .get();

    const docs = snapshot.docs.map(doc => ({ ref: doc.ref, data: doc.data() }));
    docs.sort((a: any, b: any) => {
      const timeA = a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0;
      const timeB = b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (docs.length > 10) {
      const batch = this.firebase.getDb().batch();
      docs.slice(10).forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }

    return { message: 'Blog approved successfully' };
  }

  async rejectBlog(id: string) {
    const docRef = this.firebase.getDb().collection('blogs').doc(id);
    await docRef.delete();
    
    this.generateAutomatedHealthBlog().catch(console.error);
    
    return { message: 'Blog rejected and new generation triggered' };
  }

  async getBlogById(id: string) {
    const doc = await this.firebase.getDb().collection('blogs').doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Blog not found');
    }
    return { id: doc.id, ...doc.data() };
  }

  async deleteAllBlogs() {
    const snapshot = await this.firebase.getDb().collection('blogs').get();
    const batch = this.firebase.getDb().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return { message: `Deleted ${snapshot.size} blogs` };
  }

  async seedBlogs() {
    const results: any[] = [];
    const groqClient = this.getGroqClient();
    
    for (const item of PREDEFINED_TOPICS) {
      try {
        const response = await groqClient.chat.completions.create({
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
          messages: [{
            role: "user",
            content: `Write an engaging and conversational blog post about ${item.topic}. 
                      Requirements:
                      1. Keep the language very simple and easy to understand for an ordinary citizen.
                      2. Provide practical, easy-to-follow health tips.
                      3. Give priority to the Sri Lankan context.
                      4. The tone should be smart, engaging, and relatable.
                      5. Format the post clearly using Markdown.
                      
                      You MUST return the output as a valid JSON object with the exact following structure:
                      {
                        "title": "<Catchy Title>",
                        "content": "<The full markdown content including disclaimer>",
                        "imagePrompt": "<A highly detailed, English prompt for generating a realistic, professional medical photograph related to this exact topic. Make it highly descriptive (e.g. 'A highly realistic, professional, cinematic 8k photograph of...')>"
                      }`
          }],
        });

        const responseText = response.choices[0]?.message?.content;
        if (!responseText) throw new Error("Empty response from AI");
        
        const parsedData = JSON.parse(responseText);
        const blogTitle = parsedData.title || item.topic;
        const blogContent = parsedData.content || '';

        const newBlogPost = {
          title: blogTitle,
          content: blogContent,
          imageUrl: item.image,
          topic: item.topic,
          status: BLOG_STATUS.PUBLISHED,
          createdAt: new Date().toISOString(),
        };

        const docRef = await this.firebase.getDb().collection('blogs').add(newBlogPost);
        
        const snapshot = await this.firebase.getDb().collection('blogs').where('status', '==', BLOG_STATUS.PUBLISHED).get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, createdAt: doc.data().createdAt }));
        docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const toDelete = docs.slice(10);
        for (const docToDelete of toDelete) {
          await this.firebase.getDb().collection('blogs').doc(docToDelete.id).delete();
        }
        
        results.push({ id: docRef.id, ...newBlogPost });
      } catch (error) {
        console.error(`Failed to seed blog for topic ${item.topic}:`, error);
      }
    }
    return results;
  }
}
