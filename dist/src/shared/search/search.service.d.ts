import { OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
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
export declare class SearchService implements OnModuleInit {
    private firebaseService;
    private pinecone;
    private index;
    private embedder;
    private productCache;
    private cacheTime;
    private readonly CACHE_DURATION;
    constructor(firebaseService: FirebaseService);
    onModuleInit(): Promise<void>;
    getEmbedding(text: string): Promise<number[]>;
    private vectorSearch;
    private keywordSearch;
    private mergeResults;
    private logSearch;
    search(query: string): Promise<unknown>;
    getSearchAnalytics(): Promise<unknown>;
    upsertProductToIndex(productId: string, product: Product): Promise<void>;
    removeProductFromIndex(productId: string): Promise<void>;
}
export {};
