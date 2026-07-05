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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const pinecone_1 = require("@pinecone-database/pinecone");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const { pipeline } = require('@xenova/transformers');
let SearchService = class SearchService {
    firebaseService;
    pinecone;
    index;
    embedder = null;
    productCache = [];
    cacheTime = 0;
    CACHE_DURATION = 5 * 60 * 1000;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async onModuleInit() {
        this.pinecone = new pinecone_1.Pinecone({
            apiKey: process.env.PINECONE_API_KEY ?? '',
        });
        this.index = this.pinecone.index(process.env.PINECONE_INDEX ?? '');
        console.log('✅ Pinecone connected to index:', process.env.PINECONE_INDEX);
        console.log('⏳ Loading embedding model...');
        this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('✅ Embedding model loaded');
    }
    async getEmbedding(text) {
        try {
            const output = await this.embedder(text, {
                pooling: 'mean',
                normalize: true,
            });
            return Array.from(output.data);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('Embedding error:', msg);
            throw new Error('Failed to generate embedding');
        }
    }
    async vectorSearch(query) {
        try {
            const queryVector = await this.getEmbedding(query);
            const pineconeResults = await this.index.query({
                vector: queryVector,
                topK: 10,
                includeMetadata: true,
            });
            if (!pineconeResults.matches?.length)
                return [];
            const db = this.firebaseService.getDb();
            const results = [];
            for (const match of pineconeResults.matches) {
                if (match.score === undefined || match.score < 0.3)
                    continue;
                const doc = await db
                    .collection('pharmacistProducts')
                    .doc(match.id)
                    .get();
                if (doc.exists) {
                    results.push({
                        ...doc.data(),
                        id: doc.id,
                        similarityScore: Math.round(match.score * 100),
                        searchSource: 'vector',
                    });
                }
            }
            return results;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('Vector search failed:', msg);
            return [];
        }
    }
    async keywordSearch(query) {
        try {
            const now = Date.now();
            const db = this.firebaseService.getDb();
            if (this.productCache.length === 0 ||
                now - this.cacheTime > this.CACHE_DURATION) {
                console.log('📦 Fetching products from Firestore...');
                const snapshot = await db.collection('pharmacistProducts').get();
                this.productCache = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                this.cacheTime = now;
                console.log(`✅ Cached ${this.productCache.length} products`);
            }
            const queryLower = query.toLowerCase();
            return this.productCache
                .filter((product) => {
                const p = product;
                return (p.name?.toLowerCase().includes(queryLower) ||
                    p.description?.toLowerCase().includes(queryLower) ||
                    p.category?.toLowerCase().includes(queryLower) ||
                    p.manufacturer?.toLowerCase().includes(queryLower) ||
                    p.availability?.toLowerCase().includes(queryLower));
            })
                .map((product) => ({
                ...product,
                similarityScore: 100,
                searchSource: 'keyword',
            }));
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('Keyword search failed:', msg);
            return [];
        }
    }
    mergeResults(vectorResults, keywordResults) {
        const merged = new Map();
        for (const product of keywordResults) {
            merged.set(product.id, product);
        }
        for (const product of vectorResults) {
            if (!merged.has(product.id)) {
                merged.set(product.id, product);
            }
        }
        return Array.from(merged.values()).sort((a, b) => b.similarityScore - a.similarityScore);
    }
    logSearch(query, resultsCount) {
        const db = this.firebaseService.getDb();
        db.collection('searchLogs')
            .add({
            query: query.toLowerCase().trim(),
            resultsCount,
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0],
        })
            .catch((err) => {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('Failed to log search:', msg);
        });
    }
    async search(query) {
        const [vectorResults, keywordResults] = await Promise.all([
            this.vectorSearch(query),
            this.keywordSearch(query),
        ]);
        const mergedResults = this.mergeResults(vectorResults, keywordResults);
        this.logSearch(query, mergedResults.length);
        return { results: mergedResults, total: mergedResults.length, query };
    }
    async getSearchAnalytics() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('searchLogs')
            .orderBy('timestamp', 'desc')
            .limit(500)
            .get();
        const logs = snapshot.docs.map((doc) => doc.data());
        const queryCounts = {};
        const zeroResultQueries = {};
        const dailyCounts = {};
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
    async upsertProductToIndex(productId, product) {
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
    async removeProductFromIndex(productId) {
        await this.index.deleteOne({ id: productId });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], SearchService);
//# sourceMappingURL=search.service.js.map