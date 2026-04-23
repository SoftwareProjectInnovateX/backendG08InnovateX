/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pinecone, Index, RecordMetadata } from '@pinecone-database/pinecone';
import { FirebaseService } from '../firebase/firebase.service.js';

const { pipeline } = require('@xenova/transformers');

interface Product {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  availability?: string;
  price?: number;
  imageUrl?: string;
  similarityScore: number;
  searchSource: string;
  [key: string]: unknown;
}

interface SearchLog {
  query: string;
  resultsCount: number;
  date: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private pinecone!: Pinecone;
  private index!: Index<RecordMetadata>;
  private embedder: any = null;

  constructor(private firebaseService: FirebaseService) {}

  async onModuleInit(): Promise<void> {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });
    this.index = this.pinecone.index(process.env.PINECONE_INDEX ?? '');
    console.log('✅ Pinecone connected to index:', process.env.PINECONE_INDEX);

    console.log('⏳ Loading embedding model...');
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
    );
    console.log('✅ Embedding model loaded');
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const output = await this.embedder(text, {
        pooling: 'mean',
        normalize: true,
      });
      return Array.from(output.data as number[]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Embedding error:', msg);
      throw new Error('Failed to generate embedding');
    }
  }

  private async vectorSearch(query: string): Promise<Product[]> {
    try {
      const queryVector = await this.getEmbedding(query);
      const pineconeResults = await this.index.query({
        vector: queryVector,
        topK: 10,
        includeMetadata: true,
      });

      console.log(
        'Pinecone matches:',
        pineconeResults.matches?.map((m) => ({
          id: m.id,
          score: m.score,
          name: m.metadata?.productName
        })),
      );

      if (!pineconeResults.matches?.length) return [];

      const db = this.firebaseService.getDb(); // ← changed from getFirestore()
      const results: Product[] = [];

      for (const match of pineconeResults.matches) {
        if (match.score === undefined || match.score < 0.3) continue;
        const doc = await db
          .collection('pharmacistProducts')
          .doc(match.id)
          .get();
        if (doc.exists) {
          results.push({
            ...(doc.data() as Product),
            id: doc.id,
            similarityScore: Math.round(match.score * 100),
            searchSource: 'vector',
          });
        }
      }
      return results;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Vector search failed:', msg);
      return [];
    }
  }

  private async keywordSearch(query: string): Promise<Product[]> {
    try {
      const db = this.firebaseService.getDb(); // ← changed from getFirestore()
      const queryLower = query.toLowerCase();
      const snapshot = await db.collection('pharmacistProducts').get();

      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Record<string, unknown>),
        }))
        .filter((product) => {
          const p = product as Product;
          return (
            p.name?.toLowerCase().includes(queryLower) ||
            p.description?.toLowerCase().includes(queryLower) ||
            p.category?.toLowerCase().includes(queryLower) ||
            p.manufacturer?.toLowerCase().includes(queryLower) ||
            p.availability?.toLowerCase().includes(queryLower)
          );
        })
        .map((product) => ({
          ...(product as Product),
          similarityScore: 100,
          searchSource: 'keyword',
        }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Keyword search failed:', msg);
      return [];
    }
  }

  private mergeResults(
    vectorResults: Product[],
    keywordResults: Product[],
  ): Product[] {
    const merged = new Map<string, Product>();
    for (const product of keywordResults) {
      merged.set(product.id, product);
    }
    for (const product of vectorResults) {
      if (!merged.has(product.id)) {
        merged.set(product.id, product);
      }
    }
    return Array.from(merged.values()).sort(
      (a, b) => b.similarityScore - a.similarityScore,
    );
  }

  private logSearch(query: string, resultsCount: number): void {
    const db = this.firebaseService.getDb(); // ← changed from getFirestore()
    db.collection('searchLogs')
      .add({
        query: query.toLowerCase().trim(),
        resultsCount,
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0],
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to log search:', msg);
      });
  }

  async search(query: string): Promise<unknown> {
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(query),
      this.keywordSearch(query),
    ]);
    const mergedResults = this.mergeResults(vectorResults, keywordResults);
    this.logSearch(query, mergedResults.length);
    return { results: mergedResults, total: mergedResults.length, query };
  }

  async getSearchAnalytics(): Promise<unknown> {
    const db = this.firebaseService.getDb(); // ← changed from getFirestore()
    const snapshot = await db
      .collection('searchLogs')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const logs = snapshot.docs.map((doc) => doc.data() as SearchLog);

    const queryCounts: Record<string, number> = {};
    const zeroResultQueries: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    for (const log of logs) {
      const q = log.query;
      const d = log.date;
      queryCounts[q] = (queryCounts[q] ?? 0) + 1;
      if (log.resultsCount === 0) {
        zeroResultQueries[q] = (zeroResultQueries[q] ?? 0) + 1;
      }
      dailyCounts[d] = (dailyCounts[d] ?? 0) + 1;
    }

    const topSearches = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([q, count]) => ({ query: q, count }));

    const zeroResults = Object.entries(zeroResultQueries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([q, count]) => ({ query: q, count }));

    const last7Days = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({ date, count }));

    return { totalSearches: logs.length, topSearches, zeroResults, last7Days };
  }

  async upsertProductToIndex(
    productId: string,
    product: Product,
  ): Promise<void> {
    const textToEmbed = [
      product.name ?? '',
      product.description ?? '',
      product.category ?? '',
      product.manufacturer ?? '',
      product.availability ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const vector = await this.getEmbedding(textToEmbed);
    await this.index.upsert({
      records: [
        {
          id: productId,
          values: vector,
          metadata: {
            productName: product.name ?? '',
            category: product.category ?? '',
          },
        },
      ],
    });
  }

  async removeProductFromIndex(productId: string): Promise<void> {
    await this.index.deleteOne({ id: productId });
  }
}
