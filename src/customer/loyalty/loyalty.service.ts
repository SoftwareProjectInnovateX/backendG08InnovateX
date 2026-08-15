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
    const ordersProfile = await this.buildProfileFromOrders(uid);

    if (ordersProfile) {
      const data = doc.exists ? doc.data() : null;

      if (!doc.exists || !data ||
          Number(data.totalPoints || 0) !== ordersProfile.totalPoints ||
          Number(data.totalSpent || 0) !== ordersProfile.totalSpent ||
          data.level !== ordersProfile.level
      ) {
        await db.collection('loyaltyCustomers').doc(uid).set({
          uid,
          name: ordersProfile.name || data?.name || '',
          email: ordersProfile.email || data?.email || '',
          phone: ordersProfile.phone || data?.phone || '',
          totalSpent: ordersProfile.totalSpent,
          totalPoints: ordersProfile.totalPoints,
          level: ordersProfile.level,
          joinDate: ordersProfile.joinDate || (data?.joinDate?.toDate?.() || FieldValue.serverTimestamp()),
          lastPurchase: ordersProfile.lastPurchase || (data?.lastPurchase?.toDate?.() || FieldValue.serverTimestamp()),
          purchaseCount: ordersProfile.purchaseCount,
          averageOrderValue: ordersProfile.averageOrderValue,
          refillConsistency: data?.refillConsistency || ordersProfile.refillConsistency,
          engagementScore: data?.engagementScore || ordersProfile.engagementScore,
          predictedChurnRisk: data?.predictedChurnRisk || ordersProfile.predictedChurnRisk,
          recommendedOffers: data?.recommendedOffers || ordersProfile.recommendedOffers,
          birthday: data?.birthday || null,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      return {
        ...ordersProfile,
        recommendedOffers: data?.recommendedOffers || ordersProfile.recommendedOffers,
      };
    }

    if (doc.exists) {
      const data = doc.data();
      if (!data) return null;
      let name = data.name || '';
      let email = data.email || '';
      if (!name || !email) {
        const enriched = await this.getNameEmailFromOrders(uid);
        name = name || enriched.name;
        email = email || enriched.email;
      }
      return {
        id: doc.id,
        uid: doc.id,
        name,
        email,
        phone: data.phone || '',
        totalSpent: data.totalSpent || 0,
        totalPoints: data.totalPoints || 0,
        level: data.level || 'Silver',
        joinDate: data.joinDate?.toDate?.() || new Date(),
        lastPurchase: data.lastPurchase?.toDate?.() || new Date(),
        purchaseCount: data.purchaseCount || 0,
        averageOrderValue: data.averageOrderValue || 0,
        refillConsistency: data.refillConsistency || 0,
        engagementScore: data.engagementScore || 50,
        predictedChurnRisk: data.predictedChurnRisk || 0,
        recommendedOffers: data.recommendedOffers || [],
        birthday: data.birthday?.toDate?.(),
      } as LoyaltyCustomer;
    }

    return null;
  }

  private async getNameEmailFromOrders(uid: string): Promise<{ name: string; email: string }> {
    try {
      const db = this.getDb();
      const snap = await db
        .collection('CustomerOrders')
        .where('userId', '==', uid)
        .limit(1)
        .get();
      if (!snap.empty) {
        const d = snap.docs[0].data();
        return { name: d.customerName || d.name || '', email: d.email || '' };
      }
    } catch (_) {}
    return { name: '', email: '' };
  }

  async getCustomerByEmailAndSync(email: string): Promise<LoyaltyCustomer | null> {
    const db = this.getDb();

    const ordersSnapshot = await db
      .collection('CustomerOrders')
      .where('email', '==', email)
      .get();

    if (ordersSnapshot.empty) {
      console.warn(`No orders found for email: ${email}`);
      return null;
    }

    const orders = ordersSnapshot.docs.map((doc) => doc.data());
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalPoints = orders.reduce((sum, o) => sum + Math.floor(Number(o.totalAmount || 0)), 0);
    const purchaseCount = orders.length;
    const sorted = orders
      .map((o) => ({ ...o, createdAt: o.createdAt?.toDate?.() || new Date(0) }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const uid = orders.find((o) => o.userId && !o.userId.includes('@'))?.userId || null;
    if (!uid) {
      console.warn(`No valid userId found for email ${email} — cannot sync`);
      return null;
    }

    const name = orders.find((o) => o.customerName)?.customerName || '';
    const phone = orders.find((o) => o.phone)?.phone || '';
    const level = this.calculateLevel(totalPoints);

    if (uid !== email) {
      const emailDocRef = db.collection('loyaltyCustomers').doc(email);
      const emailDoc = await emailDocRef.get();
      if (emailDoc.exists) {
        console.log(`Consolidating duplicate entry: deleting email-keyed entry for ${email}`);
        await emailDocRef.delete();
      }
    }

    await db.collection('loyaltyCustomers').doc(uid).set({
      uid,
      email,
      name,
      phone,
      totalSpent,
      totalPoints,
      level,
      joinDate: sorted[0]?.createdAt || FieldValue.serverTimestamp(),
      lastPurchase: sorted[sorted.length - 1]?.createdAt || FieldValue.serverTimestamp(),
      purchaseCount,
      averageOrderValue: purchaseCount ? totalSpent / purchaseCount : 0,
      refillConsistency: 0,
      engagementScore: 50,
      predictedChurnRisk: 20,
      recommendedOffers: [],
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      id: uid,
      uid,
      email,
      name,
      phone,
      totalSpent,
      totalPoints,
      level,
      joinDate: sorted[0]?.createdAt || new Date(),
      lastPurchase: sorted[sorted.length - 1]?.createdAt || new Date(),
      purchaseCount,
      averageOrderValue: purchaseCount ? totalSpent / purchaseCount : 0,
      refillConsistency: 0,
      engagementScore: 50,
      predictedChurnRisk: 20,
      recommendedOffers: [],
    };
  }

  async updateCustomerProfile(uid: string, updates: Partial<LoyaltyCustomer>) {
    const db = this.getDb();
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
      const { name, email } = await this.getNameEmailFromOrders(uid);
      await db.collection('loyaltyCustomers').doc(uid).set({
        uid,
        name,
        email,
        totalSpent: orderAmount,
        totalPoints: points,
        level: this.calculateLevel(points),
        joinDate: FieldValue.serverTimestamp(),
        lastPurchase: FieldValue.serverTimestamp(),
        purchaseCount: 1,
        averageOrderValue: orderAmount,
        refillConsistency: 0,
        engagementScore: 50,
        predictedChurnRisk: 20,
        recommendedOffers: [],
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const newTotalSpent = (profile.totalSpent || 0) + orderAmount;
      const newPurchaseCount = (profile.purchaseCount || 0) + 1;
      const newTotalPoints = (profile.totalPoints || 0) + points;
      const newLevel = this.calculateLevel(newTotalPoints);
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
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalPoints = orders.reduce((sum, o) => sum + Math.floor(Number(o.totalAmount || 0)), 0);
    const purchaseCount = orders.length;
    const sorted = orders
      .map((o) => ({ ...o, createdAt: o.createdAt?.toDate?.() || new Date(0) }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return {
      id: uid,
      uid,
      name: orders.find((o) => o.customerName)?.customerName || '',
      email: orders.find((o) => o.email)?.email || '',
      phone: orders.find((o) => o.phone)?.phone || '',
      totalSpent,
      totalPoints,
      level: this.calculateLevel(totalPoints),
      joinDate: sorted[0].createdAt,
      lastPurchase: sorted[sorted.length - 1].createdAt,
      purchaseCount,
      averageOrderValue: purchaseCount ? totalSpent / purchaseCount : 0,
      refillConsistency: 0,
      engagementScore: 50,
      predictedChurnRisk: 20,
      recommendedOffers: [],
    };
  }

  private async buildOrdersCustomerMap() {
    const db = this.getDb();
    const snapshot = await db.collection('CustomerOrders').get();
    const orderMap = new Map<string, {
      totalSpent: number;
      totalPoints: number;
      purchaseCount: number;
      level: 'Silver' | 'Gold' | 'Platinum';
      name: string;
      email: string;
      phone: string;
    }>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const uid = data.userId;
      // FIX: Only use userId — never fall back to email as key
      if (!uid || uid.includes('@')) return;

      const existing = orderMap.get(uid) || {
        totalSpent: 0,
        totalPoints: 0,
        purchaseCount: 0,
        level: 'Silver' as const,
        name: data.customerName || '',
        email: data.email || '',
        phone: data.phone || '',
      };

      existing.totalSpent += Number(data.totalAmount || 0);
      existing.totalPoints += Math.floor(Number(data.totalAmount || 0));
      existing.purchaseCount += 1;
      existing.level = this.calculateLevel(existing.totalPoints);
      existing.name = existing.name || data.customerName || '';
      existing.email = existing.email || data.email || '';
      existing.phone = existing.phone || data.phone || '';

      orderMap.set(uid, existing);
    });

    return orderMap;
  }

  async getTopCustomers(limit = 10): Promise<LoyaltyCustomer[]> {
    const db = this.getDb();

    // Single source of truth: CustomerOrders
    const ordersMap = await this.buildOrdersCustomerMap();

    const customers: LoyaltyCustomer[] = await Promise.all(
      Array.from(ordersMap.entries()).map(async ([uid, orderData]) => {
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        const name = userData?.fullName || userData?.name || orderData.name || '';
        const email = userData?.email || orderData.email || '';

        return {
          id: uid,
          uid,
          name,
          email,
          phone: userData?.phone || orderData.phone || '',
          totalSpent: orderData.totalSpent,
          totalPoints: orderData.totalPoints,
          level: orderData.level,
          joinDate: new Date(),
          lastPurchase: new Date(),
          purchaseCount: orderData.purchaseCount,
          averageOrderValue: orderData.purchaseCount
            ? orderData.totalSpent / orderData.purchaseCount
            : 0,
          refillConsistency: 0,
          engagementScore: 50,
          predictedChurnRisk: 20,
          recommendedOffers: [],
        } as LoyaltyCustomer;
      }),
    );

    const deduped = new Map<string, LoyaltyCustomer>();
    for (const customer of customers) {
      const key = customer.email || customer.uid;
      const existing = deduped.get(key);
      if (!existing || customer.totalPoints > existing.totalPoints) {
        deduped.set(key, customer);
      }
    }

    return Array.from(deduped.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  async getAnalytics() {
    const db = this.getDb();

    try {
      const loyaltySnapshot = await db.collection('loyaltyCustomers').get();
      const ordersMap = await this.buildOrdersCustomerMap();
      const customerMap = new Map<string, {
        totalSpent: number;
        totalPoints: number;
        purchaseCount: number;
        level: 'Silver' | 'Gold' | 'Platinum';
      }>();

      loyaltySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const orderData = ordersMap.get(doc.id);
        const totalSpent = orderData ? orderData.totalSpent : Number(data.totalSpent || 0);
        const totalPoints = orderData ? orderData.totalPoints : Number(data.totalPoints || 0);
        const purchaseCount = orderData ? orderData.purchaseCount : Number(data.purchaseCount || 0);
        const level = orderData ? orderData.level : ((data.level as 'Silver' | 'Gold' | 'Platinum') || 'Silver');

        customerMap.set(doc.id, {
          totalSpent,
          totalPoints,
          purchaseCount,
          level,
        });
      });

      ordersMap.forEach((orderData, uid) => {
        if (!customerMap.has(uid)) {
          customerMap.set(uid, {
            totalSpent: orderData.totalSpent,
            totalPoints: orderData.totalPoints,
            purchaseCount: orderData.purchaseCount,
            level: orderData.level,
          });
        }
      });

      const values = Array.from(customerMap.values());
      const totalRevenue = values.reduce((sum, v) => sum + v.totalSpent, 0);
      const totalPoints = values.reduce((sum, v) => sum + v.totalPoints, 0);
      const totalOrders = values.reduce((sum, v) => sum + v.purchaseCount, 0);

      return {
        totalCustomers: values.length,
        totalRevenue,
        totalPoints,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        levelDistribution: {
          Silver: values.filter((v) => v.level === 'Silver').length,
          Gold: values.filter((v) => v.level === 'Gold').length,
          Platinum: values.filter((v) => v.level === 'Platinum').length,
        },
      };
    } catch (error) {
      console.error('getAnalytics loyaltyCustomers error:', error);
    }

    // Fallback: build from CustomerOrders if something failed
    const ordersMap = await this.buildOrdersCustomerMap();
    const values = Array.from(ordersMap.values());
    const totalRevenue = values.reduce((sum, v) => sum + v.totalSpent, 0);
    const totalPoints = values.reduce((sum, v) => sum + v.totalPoints, 0);
    const totalOrders = values.reduce((sum, v) => sum + v.purchaseCount, 0);

    return {
      totalCustomers: values.length,
      totalRevenue,
      totalPoints,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      levelDistribution: {
        Silver: values.filter((v) => v.level === 'Silver').length,
        Gold: values.filter((v) => v.level === 'Gold').length,
        Platinum: values.filter((v) => v.level === 'Platinum').length,
      },
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
    const ordersSnapshot = await db.collection('CustomerOrders').get();

    await this.cleanupEmailKeyedLoyaltyDocs();

    const ordersByUser: Record<string, any[]> = {};
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const uid = order.userId;
      if (!uid || uid.includes('@')) {
        console.warn(`Skipping order ${orderDoc.id} — invalid userId: "${uid}"`);
        continue;
      }
      if (!ordersByUser[uid]) ordersByUser[uid] = [];
      ordersByUser[uid].push({ id: orderDoc.id, ...order });
    }

    for (const [uid, orders] of Object.entries(ordersByUser)) {
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const purchaseCount = orders.length;
      const totalPoints = Math.floor(totalSpent);
      const level = this.calculateLevel(totalPoints);

      const sorted = [...orders].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      const latest = sorted[0];
      const oldest = sorted[sorted.length - 1];

      await db.collection('loyaltyCustomers').doc(uid).set({
        uid,
        name: latest.customerName || latest.name || '',
        email: latest.email || '',
        phone: latest.phone || '',
        totalSpent,
        totalPoints,
        level,
        joinDate: oldest.createdAt || FieldValue.serverTimestamp(),
        lastPurchase: latest.createdAt || FieldValue.serverTimestamp(),
        purchaseCount,
        averageOrderValue: purchaseCount ? totalSpent / purchaseCount : 0,
        refillConsistency: 0,
        engagementScore: 50,
        predictedChurnRisk: 20,
        recommendedOffers: [],
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return { success: true, synced: Object.keys(ordersByUser).length };
  }

  private async cleanupEmailKeyedLoyaltyDocs() {
    const db = this.getDb();
    const snapshot = await db.collection('loyaltyCustomers').get();

    for (const doc of snapshot.docs) {
      if (doc.id.includes('@')) {
        await doc.ref.delete();
        console.log('Deleted stale email-keyed loyalty entry:', doc.id);
      }
    }
  }

  async consolidateDuplicates() {
    const db = this.getDb();
    const loyaltySnapshot = await db.collection('loyaltyCustomers').get();

    const entries = new Map<string, any>();
    for (const doc of loyaltySnapshot.docs) {
      entries.set(doc.id, { id: doc.id, ...doc.data() });
    }

    const ordersSnapshot = await db.collection('CustomerOrders').get();
    const uidToEmail = new Map<string, string>();
    const emailToUid = new Map<string, string>();

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const uid = order.userId;
      const email = order.email;
      if (uid && email) {
        uidToEmail.set(uid, email);
        emailToUid.set(email, uid);
      }
    }

    const toDelete: string[] = [];

    for (const [key, entry] of entries.entries()) {
      const email = entry.email;
      if (!email) continue;

      if (key === email) {
        const correctUid = emailToUid.get(email);
        if (correctUid && correctUid !== key && entries.has(correctUid)) {
          console.log(`Found duplicate: ${email} - deleting email-keyed entry, keeping uid=${correctUid}`);
          toDelete.push(key);
        }
      }
    }

    for (const key of toDelete) {
      await db.collection('loyaltyCustomers').doc(key).delete();
      console.log(`Deleted duplicate email-keyed entry: ${key}`);
    }

    return {
      success: true,
      duplicatesConsolidated: toDelete.length,
      deletedKeys: toDelete,
    };
  }
}