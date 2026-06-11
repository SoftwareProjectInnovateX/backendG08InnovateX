import { Injectable } from '@nestjs/common';
import { AnalyseInvoicesDto, InvoiceRecord } from './dto/ai-analytics.dto.js';

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function daysBetween(iso1: string, iso2: string): number {
  return Math.round((new Date(iso2).getTime() - new Date(iso1).getTime()) / 86_400_000);
}

@Injectable()
export class AiAnalyticsService {

  supplyRecommendations(dto: AnalyseInvoicesDto) {
    const grouped = groupBy(dto.invoices, (inv) => inv.productName);

    const recommendations = Object.entries(grouped).map(([productName, invs]) => {
      const paidInvs    = invs.filter((i) => i.paymentStatus === 'Paid');
      const pendingInvs = invs.filter((i) => i.paymentStatus === 'Pending');
      const overdueInvs = invs.filter((i) => i.paymentStatus === 'Overdue');

      const totalValue    = invs.reduce((s, i) => s + i.totalAmount, 0);
      const avgOrderValue = totalValue / invs.length;
      const paymentRate   = Math.round((paidInvs.length / invs.length) * 100);

      const sortedDates = invs.map((i) => i.invoiceDate).sort().reverse();
      const daysSinceLast = sortedDates[0]
        ? daysBetween(sortedDates[0], new Date().toISOString().split('T')[0])
        : 999;

      let score = 0;
      if (invs.length >= 5)       score += 20;
      if (invs.length >= 3)       score += 10;
      if (paymentRate >= 80)      score += 25;
      if (daysSinceLast <= 30)    score += 20;
      if (overdueInvs.length > 0) score -= 10;
      if (pendingInvs.length > 0) score -= 5;

      let urgency: string;
      let reason: string;

      if (score >= 55 && daysSinceLast <= 14) {
        urgency = 'urgent';
        reason  = `High demand product with ${invs.length} invoices. Last order ${daysSinceLast} days ago. Payment rate ${paymentRate}%.`;
      } else if (score >= 40) {
        urgency = 'supply';
        reason  = `Consistent order history (${invs.length} invoices). ${paymentRate}% payment rate. Consider replenishing soon.`;
      } else if (score >= 20) {
        urgency = 'monitor';
        reason  = `Moderate order frequency. Monitor demand before committing to a supply run.`;
      } else {
        urgency = 'none';
        reason  = `Low order frequency or poor payment history. No immediate action needed.`;
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

  demandForecast(dto: AnalyseInvoicesDto) {
    const grouped = groupBy(dto.invoices, (inv) => inv.productName);

    const forecasts = Object.entries(grouped)
      .filter(([, invs]) => invs.length >= 2)
      .map(([productName, invs]) => {
        const byMonth: Record<string, number> = {};
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
          numerator   += (x - xMean) * (y - yMean);
          denominator += (x - xMean) ** 2;
        });

        const slope          = denominator !== 0 ? numerator / denominator : 0;
        const intercept      = yMean - slope * xMean;
        const predictedValue = Math.max(0, Math.round(intercept + slope * n));
        const growthRate     = yMean > 0 ? Math.round((slope / yMean) * 100) : 0;
        const trend          = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';

        const variance   = values.reduce((s, v) => s + (v - yMean) ** 2, 0) / n;
        const cv         = yMean > 0 ? Math.sqrt(variance) / yMean : 1;
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

  paymentRisk(dto: AnalyseInvoicesDto) {
    const today  = new Date().toISOString().split('T')[0];
    const unpaid = dto.invoices.filter(
      (inv) => inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Overdue'
    );

    const pharmacyStats: Record<string, { total: number; late: number }> = {};
    dto.invoices.forEach((inv) => {
      pharmacyStats[inv.pharmacy] ??= { total: 0, late: 0 };
      pharmacyStats[inv.pharmacy].total++;
      if (inv.paymentStatus === 'Overdue') pharmacyStats[inv.pharmacy].late++;
    });

    const risks = unpaid.map((inv) => {
      const daysOverdue  = inv.dueDate ? Math.max(0, daysBetween(inv.dueDate, today)) : 0;
      const pharmacyStat = pharmacyStats[inv.pharmacy] ?? { total: 1, late: 0 };
      const lateRate     = pharmacyStat.late / pharmacyStat.total;

      let riskScore = 0;
      riskScore += Math.min(40, daysOverdue * 2);
      riskScore += Math.round(lateRate * 30);
      if (inv.totalAmount > 50_000)        riskScore += 10;
      if (inv.invoiceType === 'FINAL')     riskScore += 5;
      riskScore = Math.min(98, Math.max(5, riskScore));

      const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';

      let reason = '';
      if (daysOverdue > 0)          reason += `${daysOverdue} days past due date. `;
      if (lateRate > 0.2)           reason += `Pharmacy has ${Math.round(lateRate * 100)}% historical late-pay rate. `;
      if (inv.totalAmount > 50_000) reason += 'High-value invoice increases risk. ';
      if (!reason)                   reason  = 'No overdue days. Low historical risk.';

      return {
        invoiceNumber: inv.id.slice(0, 12).toUpperCase(),
        productName:   inv.productName,
        pharmacy:      inv.pharmacy,
        amount:        inv.totalAmount,
        dueDate:       inv.dueDate,
        daysOverdue:   daysOverdue > 0 ? daysOverdue : null,
        riskScore, riskLevel,
        reason: reason.trim(),
      };
    });

    risks.sort((a, b) => b.riskScore - a.riskScore);
    return { risks };
  }

  restockSuggestions(dto: AnalyseInvoicesDto) {
    const grouped = groupBy(dto.invoices, (inv) => inv.productName);

    const suggestions = Object.entries(grouped).map(([productName, invs]) => {
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 90);
      const recentInvs = invs.filter((i) => new Date(i.invoiceDate) >= recentCutoff);

      const avgInvoiceValue = invs.reduce((s, i) => s + i.totalAmount, 0) / invs.length;
      const recentOrders    = recentInvs.length;

      const recentMonths: Record<string, number> = {};
      recentInvs.forEach((inv) => {
        const m = inv.invoiceDate.slice(0, 7);
        recentMonths[m] = (recentMonths[m] ?? 0) + inv.totalAmount;
      });

      const monthlyValues          = Object.values(recentMonths);
      const projectedMonthlyDemand = monthlyValues.length > 0
        ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
        : avgInvoiceValue;

      const restock             = recentOrders >= 2 || invs.length >= 3;
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
      if (a.restock !== b.restock) return a.restock ? -1 : 1;
      return b.suggestedOrderValue - a.suggestedOrderValue;
    });

    return { suggestions };
  }
}