"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
let ImageService = class ImageService {
    async generateImage(name, category) {
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
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)()
], ImageService);
//# sourceMappingURL=image.service.js.map