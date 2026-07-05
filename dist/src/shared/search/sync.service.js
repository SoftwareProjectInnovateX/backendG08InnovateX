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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const search_service_js_1 = require("./search.service.js");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
let SyncService = class SyncService {
    searchService;
    firebaseService;
    constructor(searchService, firebaseService) {
        this.searchService = searchService;
        this.firebaseService = firebaseService;
    }
    async syncAllProducts() {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection('pharmacistProducts').get();
        console.log(`\n🔄 Starting sync of ${snapshot.size} products...\n`);
        let success = 0;
        let failed = 0;
        for (const doc of snapshot.docs) {
            const product = doc.data();
            try {
                await this.searchService.upsertProductToIndex(doc.id, {
                    id: doc.id,
                    ...product,
                    similarityScore: 0,
                    searchSource: 'sync',
                });
                success++;
                console.log(`  ✅ (${success}/${snapshot.size}) ${String(product['name'] ?? '')}`);
            }
            catch (err) {
                failed++;
                const msg = err instanceof Error ? err.message : String(err);
                console.error(`  ❌ Failed: ${String(product['name'] ?? '')} — ${msg}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        console.log(`\n✅ Sync complete: ${success} succeeded, ${failed} failed\n`);
        return { message: 'Sync complete', total: snapshot.size, success, failed };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [search_service_js_1.SearchService,
        firebase_service_js_1.FirebaseService])
], SyncService);
//# sourceMappingURL=sync.service.js.map