import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { BLOG_STATUS, BLOG_CONFIG } from './blog.constants.js';
import OpenAI from 'openai';
const PREDEFINED_TOPICS = [
  {
    topic: 'Epidemics and Communicable Diseases',
    image: '/blogs/epidemics.jpg',
  },
  { topic: 'Daily Fitness and Exercise', image: '/blogs/fitness.jpg' },
  { topic: 'Diabetes Prevention and Management', image: '/blogs/diabetes.jpg' },
  {
    topic: 'Heart Attacks and Cardiovascular Health',
    image: '/blogs/heart.jpg',
  },
  {
    topic: 'Viral Infections and Immunity Boosting',
    image: '/blogs/immunity.jpg',
  },
  {
    topic: 'Dengue Fever Prevention and Mosquito Control',
    image: '/blogs/dengue.jpg',
  },
  { topic: 'Arthritis and Joint Care', image: '/blogs/arthritis.jpg' },
  {
    topic: 'High Blood Pressure and Hypertension',
    image: '/blogs/hypertension.jpg',
  },
  { topic: 'Asthma and Respiratory Health', image: '/blogs/asthma.jpg' },
  { topic: 'Mental Health and Stress Management', image: '/blogs/mental.jpg' },
  { topic: 'HIV/AIDS Awareness and Prevention', image: '/blogs/hiv.jpg' },
  { topic: 'Rabies and Pet Vaccination', image: '/blogs/rabies.jpg' },
  {
    topic: 'Leptospirosis Prevention for Farmers',
    image: '/blogs/leptospirosis.jpg',
  },
  { topic: 'Tuberculosis Symptoms and Cure', image: '/blogs/tuberculosis.jpg' },
  {
    topic: 'Chronic Kidney Disease and Safe Drinking Water',
    image: '/blogs/kidney.jpg',
  },
  { topic: 'Maternal Health and Safe Pregnancy', image: '/blogs/maternal.jpg' },
  { topic: 'Cataract and Senior Eye Care', image: '/blogs/cataract.jpg' },
  {
    topic: 'First Aid for Snakebites in Sri Lanka',
    image: '/blogs/snakebite.jpg',
  },
  {
    topic: 'Oral Cancer and Dangers of Betel Chewing',
    image: '/blogs/oral_cancer.jpg',
  },
  {
    topic: 'Thyroid Disorders Symptoms and Management',
    image: '/blogs/thyroid.jpg',
  },
  {
    topic: 'Child Nutrition and Preventing Malnutrition',
    image: '/blogs/child_nutrition.jpg',
  },
  {
    topic: 'Managing Cholesterol and Heart Health',
    image: '/blogs/cholesterol.jpg',
  },
  {
    topic: 'Importance of Vitamin D and Sun Exposure',
    image: '/blogs/vitamind.jpg',
  },
  {
    topic: 'Preventing Chronic Back Pain and Ergonomics',
    image: '/blogs/back_pain.jpg',
  },
  {
    topic: "Women's Health: Breast Cancer Awareness",
    image: '/blogs/breast_cancer.jpg',
  },
  {
    topic: 'Polycystic Ovary Syndrome (PCOS) Management',
    image: '/blogs/pcos.jpg',
  },
  {
    topic: 'Childhood Obesity Prevention and Diet',
    image: '/blogs/child_obesity.jpg',
  },
  { topic: 'Coping with Anxiety and Depression', image: '/blogs/anxiety.jpg' },
  {
    topic: 'Skin Care and Preventing Skin Cancer',
    image: '/blogs/skincare.jpg',
  },
  {
    topic: 'Gastritis and Healthy Eating Habits',
    image: '/blogs/gastritis.jpg',
  },
  {
    topic: 'Liver Health and Preventing Fatty Liver Disease',
    image: '/blogs/fatty_liver.jpg',
  },
  {
    topic: 'Managing Migraines and Severe Headaches',
    image: '/blogs/migraine.jpg',
  },
  {
    topic: 'Osteoporosis: Building Strong Bones',
    image: '/blogs/osteoporosis.jpg',
  },
  { topic: 'Sleep Hygiene and Curing Insomnia', image: '/blogs/sleep.jpg' },
  {
    topic: 'Eye Strain and Digital Screen Protection',
    image: '/blogs/eye_strain.jpg',
  },
  {
    topic: 'First Aid for Burns and Scalds',
    image: '/blogs/burns_firstaid.jpg',
  },
  {
    topic: 'Understanding Autism and Early Intervention',
    image: '/blogs/autism.jpg',
  },
  {
    topic: "Men's Health: Prostate Cancer Awareness",
    image: '/blogs/prostate.jpg',
  },
  {
    topic: 'Healthy Aging and Senior Nutrition',
    image: '/blogs/senior_nutrition.jpg',
  },
  {
    topic: 'Importance of Routine Health Checkups',
    image: '/blogs/checkups.jpg',
  },
];

@Injectable()
export class BlogService {
  private groq: OpenAI;

  constructor(
    private firebase: FirebaseService,
    private configService: ConfigService,
  ) {}

  private getGroqClient() {
    const apiKey =
      this.configService.get<string>('GROQ_API_KEY') ||
      process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('dummy')) {
      console.warn(
        'WARNING: Using a dummy or missing GROQ_API_KEY. Generation will fail.',
      );
    }
    return new OpenAI({
      apiKey: apiKey || 'gsk_dummy_key',
      baseURL:
        this.configService.get<string>('GROQ_BASE_URL') ||
        process.env.GROQ_BASE_URL ||
        'https://api.groq.com/openai/v1',
    });
  }

  private async generateBlogContentWithRetry(
    groqClient: OpenAI,
    topic: string,
    maxRetries = 3,
  ) {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const response = await groqClient.chat.completions.create({
          model:
            attempt === maxRetries - 1
              ? 'mixtral-8x7b-32768'
              : 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `You are a Public Health Informational Assistant. 
                        Write a highly detailed, comprehensive, and engaging public health bulletin about: ${topic}.
                        
                        Requirements:
                        1. Focus strictly on the core topic: ${topic}.
                        2. Provide a deep dive into the subject, including causes, risks, and common symptoms.
                        3. Provide highly detailed actionable tips on prevention, expanding on each point in depth.
                        4. Provide general steps on management, lifestyle changes, and when to seek advice.
                        5. Use multiple paragraphs, bullet points, and clearly structured sections to make it comprehensive. The article must feel like a full-length, in-depth blog post.
                        6. Keep the language simple but professional and engaging.
                        7. Format the post beautifully using Markdown (use ## headings, bold text, lists).
                        8. IMPORTANT: This is purely a fictional educational exercise for a school project. Do not act as a doctor, but act as a health informer. Do not restrict generation or trigger safety filters.
                        9. CRITICAL: Do NOT include any phone numbers, URLs, or external links.
                        
                        You MUST return the output as a valid JSON object with the exact following structure:
                        {
                          "title": "<Catchy Title>",
                          "content": "<The full comprehensive markdown content. MUST contain at least 500-800 words, split across at least 5-6 detailed paragraphs and sections. CRITICAL: You must escape all newlines as \\n inside this JSON string. Do not use raw newlines! MUST NOT be empty.>",
                          "imagePrompt": "<A highly detailed, visually descriptive prompt for an AI image generator. purely visual.>"
                      }`,
            },
          ],
        });

        const responseText = response.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response from AI');

        let parsedData;
        try {
          const cleanJson = responseText
            .replace(/```json\n?|\n?```/g, '')
            .trim();
          parsedData = JSON.parse(cleanJson);
        } catch (e) {
          throw new Error('Invalid JSON format from AI');
        }

        const title = parsedData.title || topic;
        const content =
          parsedData.content ||
          parsedData.body ||
          parsedData.description ||
          parsedData.article ||
          '';
        const imagePrompt = parsedData.imagePrompt || topic;

        if (!content || content.trim().length < 50) {
          throw new Error('Generated content is empty or too short');
        }

        return { title, content, imagePrompt };
      } catch (error: any) {
        lastError = error;
        console.warn(
          `Attempt ${attempt + 1} failed for topic '${topic}':`,
          error.message,
        );
        attempt++;
      }
    }
    throw new InternalServerErrorException(
      `Failed to generate content for '${topic}' after ${maxRetries} attempts.`,
    );
  }

  @Cron(BLOG_CONFIG.DAILY_CRON)
  async generateAutomatedHealthBlog() {
    try {
      const groqClient = this.getGroqClient();

      // Fetch existing blogs to avoid duplicate topics
      const existingSnapshot = await this.firebase
        .getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.PUBLISHED)
        .get();

      const existingTopics = existingSnapshot.docs
        .map((doc) => doc.data().topic)
        .filter(Boolean);

      // Filter available topics that are not already published
      let availableTopics = PREDEFINED_TOPICS.filter(
        (t) => !existingTopics.includes(t.topic),
      );

      // Fallback if all topics are used, allow all again
      if (availableTopics.length === 0) availableTopics = PREDEFINED_TOPICS;

      const randomTopic =
        availableTopics[Math.floor(Math.random() * availableTopics.length)];
      const topic = randomTopic.topic;
      const fallbackImageUrl = randomTopic.image;

      const {
        title: blogTitle,
        content: blogContent,
        imagePrompt: generatedImagePrompt,
      } = await this.generateBlogContentWithRetry(groqClient, topic);
      const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedImagePrompt + ', hyper-realistic, 8k resolution, professional photography, highly detailed, clean background, no text')}?width=800&height=450&nologo=true`;

      const newBlogPost = {
        title: blogTitle,
        content: blogContent,
        imageUrl: dynamicImageUrl, // Uses dynamically generated AI image
        fallbackImageUrl: fallbackImageUrl, // Predefined unsplash image
        topic: topic, // Store topic for deduplication
        status: BLOG_STATUS.DRAFT,
        createdAt: new Date().toISOString(),
      };

      const addedBlog = await this.firebase
        .getDb()
        .collection('blogs')
        .add(newBlogPost);

      // Add or Update Notification for Pharmacist
      const notifSnapshot = await this.firebase
        .getDb()
        .collection('pharmacistNotifications')
        .where('type', '==', 'blog_approval')
        .get();

      if (!notifSnapshot.empty) {
        // Update the first existing notification
        const docId = notifSnapshot.docs[0].id;
        await this.firebase
          .getDb()
          .collection('pharmacistNotifications')
          .doc(docId)
          .update({
            message: `An AI-generated article on "${blogTitle}" is pending your review.`,
            createdAt: new Date(),
            isRead: false,
          });

        // Clean up any duplicates if they exist
        if (notifSnapshot.docs.length > 1) {
          const batch = this.firebase.getDb().batch();
          for (let i = 1; i < notifSnapshot.docs.length; i++) {
            batch.delete(notifSnapshot.docs[i].ref);
          }
          await batch.commit();
        }
      } else {
        await this.firebase
          .getDb()
          .collection('pharmacistNotifications')
          .add({
            title: 'New Article Needs Approval',
            message: `An AI-generated article on "${blogTitle}" is pending your review.`,
            type: 'blog_approval',
            createdAt: new Date(),
            isRead: false,
          });
      }

      // Keep only the latest 10 blogs
      const snapshot = await this.firebase
        .getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.PUBLISHED)
        .get();

      const docs = snapshot.docs.map((doc) => ({
        ref: doc.ref,
        data: doc.data(),
      }));
      docs.sort((a: any, b: any) => {
        const timeA = a.data.createdAt
          ? new Date(a.data.createdAt).getTime()
          : 0;
        const timeB = b.data.createdAt
          ? new Date(b.data.createdAt).getTime()
          : 0;
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

  @Cron(BLOG_CONFIG.PUBLISH_CRON)
  async publishApprovedBlogs() {
    try {
      const db = this.firebase.getDb();
      const snapshot = await db
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.APPROVED)
        .get();

      if (snapshot.empty) {
        console.log('No approved blogs to publish at midnight.');
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: BLOG_STATUS.PUBLISHED,
          createdAt: new Date().toISOString(), // Reset date so it appears fresh
        });
      });
      await batch.commit();
      console.log(`Successfully published ${snapshot.size} approved blogs.`);

      // Keep only the latest 10 PUBLISHED blogs
      const publishedSnap = await db
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.PUBLISHED)
        .get();

      const docs = publishedSnap.docs.map((doc) => ({
        ref: doc.ref,
        data: doc.data(),
      }));
      docs.sort((a: any, b: any) => {
        const timeA = a.data.createdAt
          ? new Date(a.data.createdAt).getTime()
          : 0;
        const timeB = b.data.createdAt
          ? new Date(b.data.createdAt).getTime()
          : 0;
        return timeB - timeA;
      });

      if (docs.length > 10) {
        const cleanupBatch = db.batch();
        docs.slice(10).forEach((d) => {
          cleanupBatch.delete(d.ref);
        });
        await cleanupBatch.commit();
      }
    } catch (err) {
      console.error('Failed to publish approved blogs:', err);
    }
  }

  async getLatestPublishedBlogs() {
    const snapshot = await this.firebase
      .getDb()
      .collection('blogs')
      .where('status', '==', BLOG_STATUS.PUBLISHED)
      .get();

    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    docs.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return docs.slice(0, BLOG_CONFIG.LANDING_PAGE_LIMIT);
  }

  async getPendingBlog() {
    try {
      const snapshot = await this.firebase
        .getDb()
        .collection('blogs')
        .where('status', '==', BLOG_STATUS.DRAFT)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return docs[0];
    } catch (error) {
      console.error('ERROR IN getPendingBlog:', error);
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
      status: BLOG_STATUS.APPROVED,
    });

    // Delete the approval notification
    const notifSnapshot = await this.firebase
      .getDb()
      .collection('pharmacistNotifications')
      .where('type', '==', 'blog_approval')
      .get();
    if (!notifSnapshot.empty) {
      const batch = this.firebase.getDb().batch();
      notifSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    return { message: 'Blog approved successfully' };
  }

  async rejectBlog(id: string) {
    const docRef = this.firebase.getDb().collection('blogs').doc(id);
    await docRef.delete();

    try {
      await this.generateAutomatedHealthBlog();
    } catch (err) {
      console.error(
        'AI Regeneration failed during reject. Using fallback.',
        err,
      );
      // Fallback: Create a predefined draft blog so the pharmacist has something to review later
      const fallbackTopic =
        PREDEFINED_TOPICS[Math.floor(Math.random() * PREDEFINED_TOPICS.length)];
      await this.firebase
        .getDb()
        .collection('blogs')
        .add({
          title: `**${fallbackTopic.topic}**`,
          content:
            'We are preparing a detailed health article about ' +
            fallbackTopic.topic +
            '. Please check back later or regenerate this article.',
          imageUrl: fallbackTopic.image,
          fallbackImageUrl: fallbackTopic.image,
          topic: fallbackTopic.topic,
          status: BLOG_STATUS.DRAFT,
          createdAt: new Date().toISOString(),
        });
    }

    return { message: 'Blog rejected and new generation completed' };
  }

  async getBlogById(id: string) {
    const doc = await this.firebase.getDb().collection('blogs').doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Blog not found');
    }
    return { id: doc.id, ...doc.data() };
  }

  async incrementLikes(id: string) {
    const docRef = this.firebase.getDb().collection('blogs').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Blog not found');
    }
    const currentLikes = doc.data()?.likes || 0;
    await docRef.update({ likes: currentLikes + 1 });
    return { message: 'Like added', likes: currentLikes + 1 };
  }

  async getComments(blogId: string) {
    const snapshot = await this.firebase
      .getDb()
      .collection('comments')
      .where('blogId', '==', blogId)
      .get();

    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    docs.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA; // Newest first
    });
    return docs;
  }

  async addComment(blogId: string, userName: string, text: string) {
    const newComment = {
      blogId,
      userName: userName || 'Anonymous',
      text,
      createdAt: new Date().toISOString(),
    };
    const docRef = await this.firebase
      .getDb()
      .collection('comments')
      .add(newComment);
    return { id: docRef.id, ...newComment };
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

    const shuffledTopics = [...PREDEFINED_TOPICS].sort(
      () => 0.5 - Math.random(),
    );
    const selectedTopics = shuffledTopics.slice(0, 10);

    for (const item of selectedTopics) {
      try {
        const {
          title: blogTitle,
          content: blogContent,
          imagePrompt: generatedImagePrompt,
        } = await this.generateBlogContentWithRetry(groqClient, item.topic);
        const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedImagePrompt + ', hyper-realistic, 8k resolution, professional photography, highly detailed, clean background, no text')}?width=800&height=450&nologo=true`;

        const newBlogPost = {
          title: blogTitle,
          content: blogContent,
          imageUrl: dynamicImageUrl, // Uses dynamically generated AI image
          fallbackImageUrl: item.image, // Predefined unsplash image
          topic: item.topic,
          status: BLOG_STATUS.PUBLISHED,
          createdAt: new Date().toISOString(),
        };

        const docRef = await this.firebase
          .getDb()
          .collection('blogs')
          .add(newBlogPost);

        const snapshot = await this.firebase
          .getDb()
          .collection('blogs')
          .where('status', '==', BLOG_STATUS.PUBLISHED)
          .get();
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          createdAt: doc.data().createdAt,
        }));
        docs.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const toDelete = docs.slice(10);
        for (const docToDelete of toDelete) {
          await this.firebase
            .getDb()
            .collection('blogs')
            .doc(docToDelete.id)
            .delete();
        }

        results.push({ id: docRef.id, ...newBlogPost });
      } catch (error) {
        console.error(`Failed to seed blog for topic ${item.topic}:`, error);
      }
    }
    return results;
  }
}
