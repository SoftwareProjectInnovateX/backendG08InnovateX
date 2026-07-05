"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        const k = key(item);
        (acc[k] ??= []).push(item);
        return acc;
    }, {});
}
function daysBetween(iso1, iso2) {
    return Math.round((new Date(iso2).getTime() - new Date(iso1).getTime()) / 86_400_000);
}
const PAGE_MARGIN = 40;
const PDF_COLORS = {
    blue: '#2563eb',
    slate: '#334155',
    slateLight: '#64748b',
    border: '#e2e8f0',
    headerBg: '#f8fafc',
    red: '#dc2626',
    amber: '#d97706',
    emerald: '#059669',
};
let AiAnalyticsService = class AiAnalyticsService {
    supplyRecommendations(dto) {
        const grouped = groupBy(dto.invoices, (inv) => inv.productName);
        const recommendations = Object.entries(grouped).map(([productName, invs]) => {
            const paidInvs = invs.filter((i) => i.paymentStatus === 'Paid');
            const pendingInvs = invs.filter((i) => i.paymentStatus === 'Pending');
            const overdueInvs = invs.filter((i) => i.paymentStatus === 'Overdue');
            const totalValue = invs.reduce((s, i) => s + i.totalAmount, 0);
            const avgOrderValue = totalValue / invs.length;
            const paymentRate = Math.round((paidInvs.length / invs.length) * 100);
            const sortedDates = invs.map((i) => i.invoiceDate).sort().reverse();
            const daysSinceLast = sortedDates[0]
                ? daysBetween(sortedDates[0], new Date().toISOString().split('T')[0])
                : 999;
            let score = 0;
            if (invs.length >= 5)
                score += 20;
            if (invs.length >= 3)
                score += 10;
            if (paymentRate >= 80)
                score += 25;
            if (daysSinceLast <= 30)
                score += 20;
            if (overdueInvs.length > 0)
                score -= 10;
            if (pendingInvs.length > 0)
                score -= 5;
            let urgency;
            let reason;
            if (score >= 55 && daysSinceLast <= 14) {
                urgency = 'urgent';
                reason = `High demand product with ${invs.length} invoices. Last order ${daysSinceLast} days ago. Payment rate ${paymentRate}%.`;
            }
            else if (score >= 40) {
                urgency = 'supply';
                reason = `Consistent order history (${invs.length} invoices). ${paymentRate}% payment rate. Consider replenishing soon.`;
            }
            else if (score >= 20) {
                urgency = 'monitor';
                reason = `Moderate order frequency. Monitor demand before committing to a supply run.`;
            }
            else {
                urgency = 'none';
                reason = `Low order frequency or poor payment history. No immediate action needed.`;
            }
            const confidence = Math.min(95, Math.max(30, score + 35));
            return {
                productName, urgency, reason,
                invoiceCount: invs.length,
                totalValue,
                avgOrderValue: Math.round(avgOrderValue),
                paymentRate,
                confidence,
            };
        });
        const order = { urgent: 0, supply: 1, monitor: 2, none: 3 };
        recommendations.sort((a, b) => order[a.urgency] - order[b.urgency]);
        return { recommendations };
    }
    demandForecast(dto) {
        const grouped = groupBy(dto.invoices, (inv) => inv.productName);
        const forecasts = Object.entries(grouped)
            .filter(([, invs]) => invs.length >= 2)
            .map(([productName, invs]) => {
            const byMonth = {};
            invs.forEach((inv) => {
                const monthKey = inv.invoiceDate.slice(0, 7);
                byMonth[monthKey] = (byMonth[monthKey] ?? 0) + inv.totalAmount;
            });
            const months = Object.keys(byMonth).sort();
            const values = months.map((m) => byMonth[m]);
            const n = values.length;
            const xMean = (n - 1) / 2;
            const yMean = values.reduce((a, b) => a + b, 0) / n;
            let numerator = 0, denominator = 0;
            values.forEach((y, x) => {
                numerator += (x - xMean) * (y - yMean);
                denominator += (x - xMean) ** 2;
            });
            const slope = denominator !== 0 ? numerator / denominator : 0;
            const intercept = yMean - slope * xMean;
            const predictedValue = Math.max(0, Math.round(intercept + slope * n));
            const growthRate = yMean > 0 ? Math.round((slope / yMean) * 100) : 0;
            const trend = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';
            const variance = values.reduce((s, v) => s + (v - yMean) ** 2, 0) / n;
            const cv = yMean > 0 ? Math.sqrt(variance) / yMean : 1;
            const confidence = Math.min(90, Math.max(30, Math.round(70 - cv * 20 + n * 3)));
            return {
                productName,
                avgMonthlyOrders: Math.round(invs.length / Math.max(months.length, 1)),
                trend, predictedValue, growthRate, confidence,
                monthlyHistory: months.map((m, i) => ({ month: m, value: Math.round(values[i]) })),
            };
        });
        forecasts.sort((a, b) => b.predictedValue - a.predictedValue);
        return { forecasts };
    }
    paymentRisk(dto) {
        const today = new Date().toISOString().split('T')[0];
        const unpaid = dto.invoices.filter((inv) => inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Overdue');
        const pharmacyStats = {};
        dto.invoices.forEach((inv) => {
            pharmacyStats[inv.pharmacy] ??= { total: 0, late: 0 };
            pharmacyStats[inv.pharmacy].total++;
            if (inv.paymentStatus === 'Overdue')
                pharmacyStats[inv.pharmacy].late++;
        });
        const risks = unpaid.map((inv) => {
            const daysOverdue = inv.dueDate ? Math.max(0, daysBetween(inv.dueDate, today)) : 0;
            const pharmacyStat = pharmacyStats[inv.pharmacy] ?? { total: 1, late: 0 };
            const lateRate = pharmacyStat.late / pharmacyStat.total;
            let riskScore = 0;
            riskScore += Math.min(40, daysOverdue * 2);
            riskScore += Math.round(lateRate * 30);
            if (inv.totalAmount > 50_000)
                riskScore += 10;
            if (inv.invoiceType === 'FINAL')
                riskScore += 5;
            riskScore = Math.min(98, Math.max(5, riskScore));
            const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
            let reason = '';
            if (daysOverdue > 0)
                reason += `${daysOverdue} days past due date. `;
            if (lateRate > 0.2)
                reason += `Pharmacy has ${Math.round(lateRate * 100)}% historical late-pay rate. `;
            if (inv.totalAmount > 50_000)
                reason += 'High-value invoice increases risk. ';
            if (!reason)
                reason = 'No overdue days. Low historical risk.';
            return {
                invoiceNumber: inv.id.slice(0, 12).toUpperCase(),
                productName: inv.productName,
                pharmacy: inv.pharmacy,
                amount: inv.totalAmount,
                dueDate: inv.dueDate,
                daysOverdue: daysOverdue > 0 ? daysOverdue : null,
                riskScore, riskLevel,
                reason: reason.trim(),
            };
        });
        risks.sort((a, b) => b.riskScore - a.riskScore);
        return { risks };
    }
    restockSuggestions(dto) {
        const grouped = groupBy(dto.invoices, (inv) => inv.productName);
        const suggestions = Object.entries(grouped).map(([productName, invs]) => {
            const recentCutoff = new Date();
            recentCutoff.setDate(recentCutoff.getDate() - 90);
            const recentInvs = invs.filter((i) => new Date(i.invoiceDate) >= recentCutoff);
            const avgInvoiceValue = invs.reduce((s, i) => s + i.totalAmount, 0) / invs.length;
            const recentOrders = recentInvs.length;
            const recentMonths = {};
            recentInvs.forEach((inv) => {
                const m = inv.invoiceDate.slice(0, 7);
                recentMonths[m] = (recentMonths[m] ?? 0) + inv.totalAmount;
            });
            const monthlyValues = Object.values(recentMonths);
            const projectedMonthlyDemand = monthlyValues.length > 0
                ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
                : avgInvoiceValue;
            const restock = recentOrders >= 2 || invs.length >= 3;
            const suggestedOrderValue = restock ? Math.round(projectedMonthlyDemand * 1.1) : 0;
            const reasoning = restock
                ? `${recentOrders} orders in the last 90 days. Projected monthly demand: Rs. ${suggestedOrderValue.toLocaleString()}.`
                : 'Insufficient recent order history. Monitor before restocking.';
            const confidence = Math.min(88, Math.max(35, 40 + invs.length * 5 + recentOrders * 3));
            return {
                productName, recentOrders,
                avgInvoiceValue: Math.round(avgInvoiceValue),
                restock, suggestedOrderValue, reasoning, confidence,
            };
        });
        suggestions.sort((a, b) => {
            if (a.restock !== b.restock)
                return a.restock ? -1 : 1;
            return b.suggestedOrderValue - a.suggestedOrderValue;
        });
        return { suggestions };
    }
    async generateSummaryPdf(dto) {
        try {
            return await this.buildSummaryPdf(dto);
        }
        catch (error) {
            console.error('Summary PDF generation failed:', error);
            throw new common_1.InternalServerErrorException('Failed to generate summary PDF');
        }
    }
    buildSummaryPdf(dto) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: PAGE_MARGIN, bufferPages: true });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.pdfHeader(doc, dto);
            this.pdfOverview(doc, dto);
            this.pdfSupplySection(doc, dto.supplyRecommendations);
            this.pdfDemandSection(doc, dto.demandForecast);
            this.pdfRiskSection(doc, dto.paymentRisk);
            this.pdfRestockSection(doc, dto.restockSuggestions);
            this.pdfFooterOnAllPages(doc);
            doc.end();
        });
    }
    pdfHeader(doc, dto) {
        doc
            .fillColor(PDF_COLORS.blue)
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('AI Analytics Summary', PAGE_MARGIN, PAGE_MARGIN);
        doc
            .fillColor(PDF_COLORS.slateLight)
            .fontSize(10)
            .font('Helvetica')
            .text(`Generated ${new Date(dto.generatedAt).toLocaleString()} · Supplier ID: ${dto.supplierId}`, PAGE_MARGIN, doc.y + 2);
        doc.moveDown(0.5);
        this.pdfHr(doc, PDF_COLORS.slate, 1);
        doc.moveDown(0.5);
    }
    pdfOverview(doc, dto) {
        const urgent = dto.supplyRecommendations.filter((r) => r.urgency === 'urgent').length;
        const highRisk = dto.paymentRisk.filter((r) => r.riskLevel === 'High').length;
        const restock = dto.restockSuggestions.filter((r) => r.restock).length;
        const stats = [
            { label: 'Invoices Analysed', value: String(dto.invoiceCount) },
            { label: 'Urgent Supply Items', value: String(urgent) },
            { label: 'High Payment Risk', value: String(highRisk) },
            { label: 'Restock Needed', value: String(restock) },
        ];
        const usableWidth = doc.page.width - PAGE_MARGIN * 2;
        const boxWidth = usableWidth / 4 - 8;
        const boxHeight = 50;
        const startY = doc.y;
        stats.forEach((s, i) => {
            const x = PAGE_MARGIN + i * (boxWidth + 10.6);
            doc.rect(x, startY, boxWidth, boxHeight).fillAndStroke(PDF_COLORS.headerBg, PDF_COLORS.border);
            doc
                .fillColor(PDF_COLORS.slateLight)
                .fontSize(8)
                .font('Helvetica-Bold')
                .text(s.label.toUpperCase(), x + 8, startY + 8, { width: boxWidth - 16 });
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(18)
                .font('Helvetica-Bold')
                .text(s.value, x + 8, startY + 22, { width: boxWidth - 16 });
        });
        doc.y = startY + boxHeight + 20;
    }
    pdfSupplySection(doc, items) {
        this.pdfSectionTitle(doc, 'Supply Recommendations');
        if (!items.length) {
            this.pdfEmptyState(doc, 'No supply recommendations generated.');
            return;
        }
        const urgencyColor = {
            urgent: PDF_COLORS.red,
            supply: PDF_COLORS.blue,
            monitor: PDF_COLORS.amber,
            none: PDF_COLORS.slateLight,
        };
        items.forEach((rec) => {
            this.pdfEnsureSpace(doc, 70);
            const startY = doc.y;
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(rec.productName, PAGE_MARGIN, startY, { continued: true });
            doc
                .fillColor(urgencyColor[rec.urgency] || PDF_COLORS.slateLight)
                .fontSize(9)
                .font('Helvetica-Bold')
                .text(`   [${rec.urgency.toUpperCase()}]`, { continued: false });
            doc
                .fillColor(PDF_COLORS.slateLight)
                .fontSize(9.5)
                .font('Helvetica')
                .text(rec.reason, PAGE_MARGIN, doc.y + 2, { width: 500 });
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(9)
                .font('Helvetica')
                .text(`Invoices: ${rec.invoiceCount}   ·   Total Value: Rs. ${rec.totalValue.toFixed(2)}   ·   Avg Order: Rs. ${rec.avgOrderValue.toFixed(2)}   ·   Paid Rate: ${rec.paymentRate}%   ·   Confidence: ${rec.confidence}%`, PAGE_MARGIN, doc.y + 4, { width: 500 });
            doc.moveDown(0.8);
            this.pdfHr(doc, PDF_COLORS.border, 0.5);
            doc.moveDown(0.5);
        });
    }
    pdfDemandSection(doc, items) {
        this.pdfSectionTitle(doc, 'Demand Forecast');
        if (!items.length) {
            this.pdfEmptyState(doc, 'Not enough data to generate demand forecasts.');
            return;
        }
        const cols = [
            { label: 'Product', width: 130 },
            { label: 'Avg/Mo', width: 55 },
            { label: 'Trend', width: 60 },
            { label: 'Predicted', width: 90 },
            { label: 'Growth', width: 60 },
            { label: 'Confidence', width: 75 },
        ];
        this.pdfTableHeader(doc, cols);
        items.forEach((item) => {
            this.pdfEnsureSpace(doc, 22);
            const y = doc.y;
            const trendLabel = item.trend === 'up' ? 'Up' : item.trend === 'down' ? 'Down' : 'Stable';
            const row = [
                item.productName,
                String(item.avgMonthlyOrders),
                trendLabel,
                `Rs. ${item.predictedValue.toFixed(2)}`,
                `${item.growthRate >= 0 ? '+' : ''}${item.growthRate}%`,
                `${item.confidence}%`,
            ];
            this.pdfTableRow(doc, cols, row, y);
        });
        doc.moveDown(1);
    }
    pdfRiskSection(doc, items) {
        this.pdfSectionTitle(doc, 'Payment Risk Analysis');
        if (!items.length) {
            this.pdfEmptyState(doc, 'No unpaid invoices to assess for payment risk.');
            return;
        }
        const riskFg = {
            High: PDF_COLORS.red,
            Medium: PDF_COLORS.amber,
            Low: PDF_COLORS.emerald,
        };
        items.forEach((risk) => {
            this.pdfEnsureSpace(doc, 60);
            const startY = doc.y;
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(10.5)
                .font('Helvetica-Bold')
                .text(`${risk.invoiceNumber}  ·  ${risk.productName}`, PAGE_MARGIN, startY, { continued: true });
            doc
                .fillColor(riskFg[risk.riskLevel] || PDF_COLORS.slateLight)
                .fontSize(9)
                .text(`   [${risk.riskLevel.toUpperCase()} RISK]`);
            doc
                .fillColor(PDF_COLORS.slateLight)
                .fontSize(9.5)
                .font('Helvetica')
                .text(risk.reason, PAGE_MARGIN, doc.y + 2, { width: 500 });
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(9)
                .text(`Amount: Rs. ${risk.amount.toFixed(2)}   ·   Due: ${risk.dueDate}   ·   Overdue: ${risk.daysOverdue ? risk.daysOverdue + 'd' : 'N/A'}   ·   Risk Score: ${risk.riskScore}%`, PAGE_MARGIN, doc.y + 4, { width: 500 });
            doc.moveDown(0.8);
            this.pdfHr(doc, PDF_COLORS.border, 0.5);
            doc.moveDown(0.5);
        });
    }
    pdfRestockSection(doc, items) {
        this.pdfSectionTitle(doc, 'Restock Suggestions');
        if (!items.length) {
            this.pdfEmptyState(doc, 'Not enough data to generate restock suggestions.');
            return;
        }
        const cols = [
            { label: 'Product', width: 110 },
            { label: 'Orders', width: 50 },
            { label: 'Avg Value', width: 75 },
            { label: 'Restock?', width: 60 },
            { label: 'Suggested', width: 80 },
            { label: 'Confidence', width: 75 },
        ];
        this.pdfTableHeader(doc, cols);
        items.forEach((item) => {
            this.pdfEnsureSpace(doc, 22);
            const y = doc.y;
            const row = [
                item.productName,
                String(item.recentOrders),
                `Rs. ${item.avgInvoiceValue.toFixed(2)}`,
                item.restock ? 'Yes' : 'No',
                item.restock && item.suggestedOrderValue ? `Rs. ${item.suggestedOrderValue.toFixed(2)}` : '-',
                `${item.confidence}%`,
            ];
            this.pdfTableRow(doc, cols, row, y);
        });
        doc.moveDown(1);
    }
    pdfSectionTitle(doc, title) {
        this.pdfEnsureSpace(doc, 40);
        doc.fillColor(PDF_COLORS.blue).fontSize(14).font('Helvetica-Bold').text(title, PAGE_MARGIN, doc.y);
        doc.moveDown(0.4);
        this.pdfHr(doc, PDF_COLORS.slate, 1);
        doc.moveDown(0.5);
    }
    pdfEmptyState(doc, message) {
        doc.fillColor(PDF_COLORS.slateLight).fontSize(9.5).font('Helvetica-Oblique').text(message, PAGE_MARGIN, doc.y);
        doc.moveDown(1);
    }
    pdfTableHeader(doc, cols) {
        this.pdfEnsureSpace(doc, 24);
        const y = doc.y;
        let x = PAGE_MARGIN;
        const totalWidth = cols.reduce((s, c) => s + c.width, 0);
        doc.rect(PAGE_MARGIN, y, totalWidth, 20).fill(PDF_COLORS.headerBg);
        cols.forEach((c) => {
            doc
                .fillColor(PDF_COLORS.slateLight)
                .fontSize(8)
                .font('Helvetica-Bold')
                .text(c.label.toUpperCase(), x + 5, y + 6, { width: c.width - 8 });
            x += c.width;
        });
        doc.y = y + 20;
    }
    pdfTableRow(doc, cols, values, y) {
        let x = PAGE_MARGIN;
        const totalWidth = cols.reduce((s, c) => s + c.width, 0);
        doc
            .moveTo(PAGE_MARGIN, y + 18)
            .lineTo(PAGE_MARGIN + totalWidth, y + 18)
            .strokeColor(PDF_COLORS.border)
            .lineWidth(0.5)
            .stroke();
        cols.forEach((c, i) => {
            doc
                .fillColor(PDF_COLORS.slate)
                .fontSize(8.5)
                .font('Helvetica')
                .text(values[i], x + 5, y + 4, { width: c.width - 8 });
            x += c.width;
        });
        doc.y = y + 18;
    }
    pdfHr(doc, color, width) {
        doc
            .moveTo(PAGE_MARGIN, doc.y)
            .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
            .strokeColor(color)
            .lineWidth(width)
            .stroke();
    }
    pdfEnsureSpace(doc, needed) {
        const bottomLimit = doc.page.height - PAGE_MARGIN - 30;
        if (doc.y + needed > bottomLimit) {
            doc.addPage();
        }
    }
    pdfFooterOnAllPages(doc) {
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc
                .fillColor(PDF_COLORS.slateLight)
                .fontSize(8)
                .font('Helvetica')
                .text(`Page ${i + 1} of ${range.count}   ·   AI predictions are decision-support suggestions, not guaranteed outcomes.`, PAGE_MARGIN, doc.page.height - PAGE_MARGIN, { width: doc.page.width - PAGE_MARGIN * 2, align: 'center' });
        }
    }
};
exports.AiAnalyticsService = AiAnalyticsService;
exports.AiAnalyticsService = AiAnalyticsService = __decorate([
    (0, common_1.Injectable)()
], AiAnalyticsService);
//# sourceMappingURL=ai-analytics.service.js.map