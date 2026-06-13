import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { AIService } from './ai.service';
import { FieldValue } from 'firebase-admin/firestore';

export interface LoyaltyCustomer {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  totalPoints: number;
  level: 'Silver' | 'Gold' | 'Platinum';
  joinDate: Date;
  lastPurchase: Date;
  purchaseCount: number;
  averageOrderValue: number;
  refillConsistency: number;
  engagementScore: number;
  predictedChurnRisk: number;
  recommendedOffers: string[];
  birthday?: Date;
}

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly aiService: AIService,
  ) {}

  private getDb() {
    return this.firebaseService.getDb();
  }

  async getCustomerProfile(uid: string): Promise<LoyaltyCustomer | null> {
    const db = this.getDb();
    const doc = await db.collection('loyaltyCustomers').doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      if (!data) return null;
      return {
        id: doc.id,
        ...data,
        joinDate: data.joinDate?.toDate(),
        lastPurchase: data.lastPurchase?.toDate(),
        birthday: data.birthday?.toDate(),
      } as LoyaltyCustomer;
    }

    return this.buildProfileFromOrders(uid);
  }

  async updateCustomerProfile(uid: string, updates: Partial<LoyaltyCustomer>) {
    const db = this.getDb();
    // ─── FIXED: was .update() which throws if the doc doesn't exist yet.
    // .set() with merge:true creates the doc if missing, updates fields if present.
    await db.collection('loyaltyCustomers').doc(uid).set(
      { ...updates, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  async calculatePoints(orderAmount: number): Promise<number> {
    return Math.floor(orderAmount);
  }

  async addPurchase(uid: string, orderAmount: number, orderId: string) {
    const db = this.getDb();
    const points = await this.calculatePoints(orderAmount);

    const profile = await this.getCustomerProfile(uid);
    if (!profile) {
      const newProfile: Omit<LoyaltyCustomer, 'id'> = {
        uid,
        name: '',
        email: '',
        totalSpent: orderAmount,
        totalPoints: points,
        level: 'Silver',
        joinDate: new Date(),
        lastPurchase: new Date(),
        purchaseCount: 1,
        averageOrderValue: orderAmount,
        refillConsistency: 0,
        engagementScore: 50,
        predictedChurnRisk: 20,
        recommendedOffers: [],
      };
      await db.collection('loyaltyCustomers').doc(uid).set(newProfile);
    } else {
      const newTotalSpent = profile.totalSpent + orderAmount;
      const newPurchaseCount = profile.purchaseCount + 1;
      const newTotalPoints = profile.totalPoints + points;
      const newLevel = this.calculateLevel(newTotalPoints);

      // updateCustomerProfile now uses set+merge so it's safe whether or not
      // the Firestore doc exists (profile may have been built from orders in memory)
      await this.updateCustomerProfile(uid, {
        totalSpent: newTotalSpent,
        totalPoints: newTotalPoints,
        level: newLevel,
        lastPurchase: new Date(),
        purchaseCount: newPurchaseCount,
        averageOrderValue: newTotalSpent / newPurchaseCount,
      });
    }

    await db.collection('loyaltyPurchases').add({
      uid,
      orderId,
      amount: orderAmount,
      pointsEarned: points,
      date: FieldValue.serverTimestamp(),
    });
  }

  private calculateLevel(points: number): 'Silver' | 'Gold' | 'Platinum' {
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    return 'Silver';
  }

  private async buildProfileFromOrders(uid: string): Promise<LoyaltyCustomer | null> {
    const db = this.getDb();
    const ordersSnapshot = await db
      .collection('CustomerOrders')
      .where('userId', '==', uid)
      .get();

    if (ordersSnapshot.empty) return null;

    const orders = ordersSnapshot.docs.map((doc) => doc.data());
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalPoints = orders.reduce((sum, order) => sum + Math.floor(order.totalAmount || 0), 0);
    const purchaseCount = orders.length;
    const sortedOrders = orders
      .map((order) => ({
        ...order,
        createdAt: order.createdAt?.toDate?.() || new Date(0),
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const joinDate = sortedOrders[0].createdAt || new Date();
    const lastPurchase = sortedOrders[sortedOrders.length - 1].createdAt || new Date();

    return {
      id: uid,
      uid,
      name: orders.find((order) => order.customerName)?.customerName || '',
      email: orders.find((order) => order.email)?.email || '',
      phone: orders.find((order) => order.phone)?.phone || '',
      totalSpent,
      totalPoints,
      level: this.calculateLevel(totalPoints),
      joinDate,
      lastPurchase,
      purchaseCount,
      averageOrderValue: purchaseCount ? totalSpent / purchaseCount : 0,
      refillConsistency: 0,
      engagementScore: 50,
      predictedChurnRisk: 20,
      recommendedOffers: [],
    } as LoyaltyCustomer;
  }

  async getTopCustomers(limit = 10): Promise<LoyaltyCustomer[]> {
    const db = this.getDb();
    const snapshot = await db
      .collection('loyaltyCustomers')
      .orderBy('totalSpent', 'desc')
      .limit(limit)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinDate: data?.joinDate?.toDate(),
          lastPurchase: data?.lastPurchase?.toDate(),
          birthday: data?.birthday?.toDate(),
        } as LoyaltyCustomer;
      });
    }

    const ordersSnapshot = await db.collection('CustomerOrders').get();
    const customers = new Map<string, LoyaltyCustomer>();

    ordersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const uid = data.userId || data.email || data.customerName || doc.id;
      const existing = customers.get(uid) || {
        id: uid,
        uid,
        name: data.customerName || '',
        email: data.email || '',
        phone: data.phone || '',
        totalSpent: 0,
        totalPoints: 0,
        level: 'Silver' as const,
        joinDate: new Date(8640000000000000),
        lastPurchase: new Date(0),
        purchaseCount: 0,
        averageOrderValue: 0,
        refillConsistency: 0,
        engagementScore: 50,
        predictedChurnRisk: 20,
        recommendedOffers: [],
      };

      const createdAt = data.createdAt?.toDate?.() || new Date();
      existing.totalSpent += Number(data.totalAmount || 0);
      existing.totalPoints += Math.floor(Number(data.totalAmount || 0));
      existing.purchaseCount += 1;
      existing.joinDate = createdAt < existing.joinDate ? createdAt : existing.joinDate;
      existing.lastPurchase = createdAt > existing.lastPurchase ? createdAt : existing.lastPurchase;
      existing.level = this.calculateLevel(existing.totalPoints);
      existing.averageOrderValue = existing.totalSpent / existing.purchaseCount;
      customers.set(uid, existing);
    });

    return Array.from(customers.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  async getAnalytics() {
    const db = this.getDb();
    const loyaltySnapshot = await db.collection('loyaltyCustomers').get();

    if (!loyaltySnapshot.empty) {
      const customers = loyaltySnapshot.docs;
      const purchases = await db.collection('loyaltyPurchases').get();

      const totalCustomers = customers.length;
      const totalRevenue = customers.reduce(
        (sum, doc) => sum + (doc.data().totalSpent || 0),
        0,
      );
      const totalPoints = customers.reduce(
        (sum, doc) => sum + (doc.data().totalPoints || 0),
        0,
      );

      return {
        totalCustomers,
        totalRevenue,
        totalPoints,
        averageOrderValue: purchases.size > 0 ? totalRevenue / purchases.size : 0,
        levelDistribution: {
          Silver: customers.filter((doc) => doc.data().level === 'Silver').length,
          Gold: customers.filter((doc) => doc.data().level === 'Gold').length,
          Platinum: customers.filter((doc) => doc.data().level === 'Platinum').length,
        },
      };
    }

    const ordersSnapshot = await db.collection('CustomerOrders').get();
    const customerMap = new Map<string, { totalSpent: number; totalPoints: number; totalOrders: number; level: 'Silver' | 'Gold' | 'Platinum' }>();

    ordersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const uid = data.userId || data.email || data.customerName || doc.id;
      const existing = customerMap.get(uid) || {
        totalSpent: 0,
        totalPoints: 0,
        totalOrders: 0,
        level: 'Silver' as const,
      };

      existing.totalSpent += Number(data.totalAmount || 0);
      existing.totalPoints += Math.floor(Number(data.totalAmount || 0));
      existing.totalOrders += 1;
      existing.level = this.calculateLevel(existing.totalPoints);
      customerMap.set(uid, existing);
    });

    const totalRevenue = Array.from(customerMap.values()).reduce((sum, value) => sum + value.totalSpent, 0);
    const totalPoints = Array.from(customerMap.values()).reduce((sum, value) => sum + value.totalPoints, 0);
    const totalOrders = ordersSnapshot.size;
    const levelDistribution = {
      Silver: Array.from(customerMap.values()).filter((value) => value.level === 'Silver').length,
      Gold: Array.from(customerMap.values()).filter((value) => value.level === 'Gold').length,
      Platinum: Array.from(customerMap.values()).filter((value) => value.level === 'Platinum').length,
    };

    return {
      totalCustomers: customerMap.size,
      totalRevenue,
      totalPoints,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      levelDistribution,
    };
  }

  async predictChurnRisk(uid: string): Promise<number> {
    const profile = await this.getCustomerProfile(uid);
    if (!profile) return 100;
    return this.aiService.predictChurnRisk(profile);
  }

  async generatePersonalizedOffers(uid: string): Promise<string[]> {
    const profile = await this.getCustomerProfile(uid);
    if (!profile) return [];
    return this.aiService.generatePersonalizedOffers(profile);
  }

  async syncFromOrders() {
    const db = this.getDb();
    const ordersSnapshot = await db.collection('orders').get();

    const ordersByUser: Record<string, any[]> = {};
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const uid = order.userId;
      if (!uid) continue;
      if (!ordersByUser[uid]) ordersByUser[uid] = [];
      ordersByUser[uid].push({ id: orderDoc.id, ...order });
    }

    for (const [uid, orders] of Object.entries(ordersByUser)) {
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const purchaseCount = orders.length;
      const averageOrderValue = totalSpent / purchaseCount;
      const totalPoints = Math.floor(totalSpent);
      const level = this.calculateLevel(totalPoints);

      const sorted = orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      const latest = sorted[0];
      const oldest = sorted[sorted.length - 1];

      const profileData = {
        uid,
        name: latest.customerName || '',
        email: latest.email || '',
        totalSpent,
        totalPoints,
        level,
        joinDate: oldest.createdAt || FieldValue.serverTimestamp(),
        lastPurchase: latest.createdAt || FieldValue.serverTimestamp(),
        purchaseCount,
        averageOrderValue,
        refillConsistency: 0,
        engagementScore: 50,
        predictedChurnRisk: 20,
        recommendedOffers: [],
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db
        .collection('loyaltyCustomers')
        .doc(uid)
        .set(profileData, { merge: true });
    }

    return { success: true, synced: Object.keys(ordersByUser).length };
  }
}