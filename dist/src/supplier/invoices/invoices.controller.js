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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const generate_pdf_dto_1 = require("./dto/generate-pdf.dto");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async generatePdf(dto, res) {
        const pdfBuffer = await this.invoicesService.generatePdf(dto);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Invoice-${dto.invoiceNumber}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)('generate-pdf'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_pdf_dto_1.GeneratePdfDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "generatePdf", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('supplier/invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map