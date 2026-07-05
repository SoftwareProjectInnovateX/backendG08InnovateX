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
exports.GeneratePdfDto = exports.InvoiceItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class InvoiceItemDto {
    productName;
    quantity;
    unitPrice;
}
exports.InvoiceItemDto = InvoiceItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "productName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "unitPrice", void 0);
class GeneratePdfDto {
    invoiceNumber;
    pharmacy;
    invoiceType;
    invoiceLabel;
    paymentStatus;
    invoiceDate;
    dueDate;
    items;
    totalAmount;
    subtotal;
    taxRate;
    taxAmount;
    totalOrderAmount;
    paidAmount;
    paidDate;
    paymentMethod;
    paymentNote;
}
exports.GeneratePdfDto = GeneratePdfDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "pharmacy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['INITIAL', 'FINAL']),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "invoiceType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "invoiceLabel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Paid', 'Pending', 'Overdue']),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "invoiceDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceItemDto),
    __metadata("design:type", Array)
], GeneratePdfDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "taxAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "totalOrderAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePdfDto.prototype, "paidAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "paidDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GeneratePdfDto.prototype, "paymentNote", void 0);
//# sourceMappingURL=generate-pdf.dto.js.map