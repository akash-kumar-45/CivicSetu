import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Global singleton for PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var memoryStoreGlobal: any | undefined;
}

// In-Memory database store for seamless local execution and demonstration
class InMemoryPrismaStore {
  users = new Map<string, any>();
  coopGroups = new Map<string, any>();
  memberships = new Map<string, any>();
  listings = new Map<string, any>();
  bookings = new Map<string, any>();
  ledgerEntries = new Map<string, any>();
  reviews = new Map<string, any>();

  constructor() {
    this.seedDemoData();
  }

  seedDemoData() {
    const passwordHash = bcrypt.hashSync("password123", 10);

    // 1. Users
    const admin = {
      id: "user-admin-1",
      name: "Alex Vance (Admin)",
      email: "admin@coop.local",
      passwordHash,
      role: "ADMIN",
      createdAt: new Date(),
    };
    const maya = {
      id: "user-member-1",
      name: "Maya Patel",
      email: "maya@coop.local",
      passwordHash,
      role: "MEMBER",
      createdAt: new Date(),
    };
    const rohan = {
      id: "user-member-2",
      name: "Rohan Verma",
      email: "rohan@coop.local",
      passwordHash,
      role: "MEMBER",
      createdAt: new Date(),
    };

    this.users.set(admin.id, admin);
    this.users.set(maya.id, maya);
    this.users.set(rohan.id, rohan);

    // 2. Groups
    const group1 = {
      id: "group-greenway",
      name: "Greenway Cooperative Society",
      locality: "North District, Sector 4",
      createdAt: new Date(),
    };
    const group2 = {
      id: "group-hostel",
      name: "University Hostel Co-op",
      locality: "Campus Block B",
      createdAt: new Date(),
    };
    this.coopGroups.set(group1.id, group1);
    this.coopGroups.set(group2.id, group2);

    // 3. Memberships
    const mAdmin = {
      id: "m-1",
      userId: admin.id,
      groupId: group1.id,
      status: "ACTIVE",
      createdAt: new Date(),
    };
    const mMaya = {
      id: "m-2",
      userId: maya.id,
      groupId: group1.id,
      status: "ACTIVE",
      createdAt: new Date(),
    };
    const mRohan = {
      id: "m-3",
      userId: rohan.id,
      groupId: group1.id,
      status: "ACTIVE",
      createdAt: new Date(),
    };
    this.memberships.set(`${admin.id}_${group1.id}`, mAdmin);
    this.memberships.set(`${maya.id}_${group1.id}`, mMaya);
    this.memberships.set(`${rohan.id}_${group1.id}`, mRohan);

    // 4. Listings
    const l1 = {
      id: "list-1",
      ownerId: maya.id,
      groupId: group1.id,
      type: "OFFER",
      category: "Cleaning",
      title: "Apartment Deep Clean & Dusting",
      description: "Thorough 2-hour home cleaning including kitchen, floor scrubbing, and windows.",
      hourlyCredits: 2,
      active: true,
      createdAt: new Date(),
    };
    const l2 = {
      id: "list-2",
      ownerId: rohan.id,
      groupId: group1.id,
      type: "OFFER",
      category: "Tutoring",
      title: "Linear Algebra & Calculus Tutoring",
      description: "College-level mathematics coaching and exam preparation support.",
      hourlyCredits: 1,
      active: true,
      createdAt: new Date(),
    };
    const l3 = {
      id: "list-3",
      ownerId: admin.id,
      groupId: group1.id,
      type: "REQUEST",
      category: "Repairs",
      title: "Kitchen Sink Leak & Tap Replacement",
      description: "Need help fixing a loose pipe and replacing the mixer tap in the kitchen.",
      hourlyCredits: 1,
      active: true,
      createdAt: new Date(),
    };
    const l4 = {
      id: "list-4",
      ownerId: maya.id,
      groupId: group1.id,
      type: "OFFER",
      category: "Cooking",
      title: "Home Cooked Weekend Meal Batch Prep",
      description: "Nutritious batch meal preparation tailored to dietary requirements.",
      hourlyCredits: 3,
      active: true,
      createdAt: new Date(),
    };
    this.listings.set(l1.id, l1);
    this.listings.set(l2.id, l2);
    this.listings.set(l3.id, l3);
    this.listings.set(l4.id, l4);

    // 5. Initial Community Ledger Entries (Bootstrap Balances)
    const txAdmin = {
      id: "tx-grant-admin",
      groupId: group1.id,
      fromUserId: admin.id,
      toUserId: admin.id,
      amount: 15,
      bookingId: "genesis_admin",
      createdAt: new Date(Date.now() - 86400000 * 2),
    };
    const txMaya = {
      id: "tx-grant-maya",
      groupId: group1.id,
      fromUserId: admin.id,
      toUserId: maya.id,
      amount: 10,
      bookingId: "genesis_maya",
      createdAt: new Date(Date.now() - 86400000 * 2),
    };
    const txRohan = {
      id: "tx-grant-rohan",
      groupId: group1.id,
      fromUserId: admin.id,
      toUserId: rohan.id,
      amount: 10,
      bookingId: "genesis_rohan",
      createdAt: new Date(Date.now() - 86400000 * 2),
    };
    this.ledgerEntries.set(txAdmin.bookingId, txAdmin);
    this.ledgerEntries.set(txMaya.bookingId, txMaya);
    this.ledgerEntries.set(txRohan.bookingId, txRohan);

    // 6. Sample Completed Booking & Review
    const bCompleted = {
      id: "booking-demo-completed",
      listingId: l1.id,
      requesterId: admin.id,
      providerId: maya.id,
      startsAt: new Date(Date.now() - 86400000),
      durationMinutes: 60,
      creditAmount: 2,
      status: "REVIEWED",
      createdAt: new Date(Date.now() - 86400000),
    };
    this.bookings.set(bCompleted.id, bCompleted);

    const txBooking = {
      id: "tx-booking-completed",
      groupId: group1.id,
      fromUserId: admin.id,
      toUserId: maya.id,
      amount: 2,
      bookingId: bCompleted.id,
      createdAt: new Date(Date.now() - 86400000),
    };
    this.ledgerEntries.set(txBooking.bookingId, txBooking);

    const rev1 = {
      id: "rev-demo-1",
      bookingId: bCompleted.id,
      reviewerId: admin.id,
      revieweeId: maya.id,
      rating: 5,
      comment: "Superb deep cleaning! Left the kitchen spotless and shining.",
      createdAt: new Date(Date.now() - 86400000),
    };
    this.reviews.set(`${bCompleted.id}_${admin.id}`, rev1);
  }

  // User queries
  user = {
    findUnique: async ({ where }: any) => {
      if (where.email) {
        return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      if (where.id) {
        return this.users.get(where.id) || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const id = `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const user = { id, ...data, createdAt: new Date() };
      this.users.set(id, user);
      return user;
    },
    update: async ({ where, data }: any) => {
      const user = this.users.get(where.id);
      if (!user) throw new Error("User not found");
      const updated = { ...user, ...data };
      this.users.set(where.id, updated);
      return updated;
    },
  };

  // CoopGroup queries
  coopGroup = {
    findUnique: async ({ where }: any) => {
      const group = this.coopGroups.get(where.id);
      if (!group) return null;
      const memberships = Array.from(this.memberships.values())
        .filter((m) => m.groupId === group.id)
        .map((m) => ({
          ...m,
          user: this.users.get(m.userId),
        }));
      return { ...group, memberships };
    },
    findMany: async () => {
      return Array.from(this.coopGroups.values()).map((g) => {
        const activeMemberships = Array.from(this.memberships.values()).filter(
          (m) => m.groupId === g.id && m.status === "ACTIVE"
        );
        const activeListings = Array.from(this.listings.values()).filter(
          (l) => l.groupId === g.id && l.active === true
        );
        return {
          ...g,
          _count: {
            memberships: activeMemberships.length,
            listings: activeListings.length,
          },
        };
      });
    },
    create: async ({ data }: any) => {
      const id = `g_${Date.now()}`;
      const group = { id, name: data.name, locality: data.locality, createdAt: new Date() };
      this.coopGroups.set(id, group);

      if (data.memberships?.create) {
        const m = {
          id: `m_${Date.now()}`,
          userId: data.memberships.create.userId,
          groupId: id,
          status: data.memberships.create.status,
          createdAt: new Date(),
        };
        this.memberships.set(`${m.userId}_${id}`, m);
      }
      return group;
    },
  };

  // Membership queries
  membership = {
    findUnique: async ({ where }: any) => {
      const key = where.userId_groupId ? `${where.userId_groupId.userId}_${where.userId_groupId.groupId}` : null;
      const m = key ? this.memberships.get(key) : null;
      if (m) {
        const user = this.users.get(m.userId);
        return { ...m, user };
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      return Array.from(this.memberships.values()).filter((m) => {
        if (where.groupId && m.groupId !== where.groupId) return false;
        if (where.userId && m.userId !== where.userId) return false;
        if (where.status && m.status !== where.status) return false;
        return true;
      });
    },
    create: async ({ data }: any) => {
      const id = `m_${Date.now()}`;
      const m = { id, ...data, createdAt: new Date() };
      this.memberships.set(`${data.userId}_${data.groupId}`, m);
      return m;
    },
    update: async ({ where, data }: any) => {
      const key = `${where.userId_groupId.userId}_${where.userId_groupId.groupId}`;
      const existing = this.memberships.get(key);
      if (!existing) throw new Error("Membership not found");
      const updated = { ...existing, ...data };
      this.memberships.set(key, updated);
      return updated;
    },
    delete: async ({ where }: any) => {
      const key = `${where.userId_groupId.userId}_${where.userId_groupId.groupId}`;
      this.memberships.delete(key);
      return {};
    },
    count: async ({ where }: any) => {
      return Array.from(this.memberships.values()).filter((m) => {
        if (where.groupId && m.groupId !== where.groupId) return false;
        if (where.status && m.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  // Listing queries
  listing = {
    findUnique: async ({ where }: any) => {
      const l = this.listings.get(where.id);
      if (!l) return null;
      return {
        ...l,
        owner: this.users.get(l.ownerId),
        group: this.coopGroups.get(l.groupId),
      };
    },
    findMany: async ({ where }: any) => {
      return Array.from(this.listings.values())
        .filter((l) => {
          if (where.groupId && l.groupId !== where.groupId) return false;
          if (where.active !== undefined && l.active !== where.active) return false;
          if (where.type && l.type !== where.type) return false;
          if (where.category?.equals && l.category.toLowerCase() !== where.category.equals.toLowerCase()) return false;
          return true;
        })
        .map((l) => ({
          ...l,
          owner: this.users.get(l.ownerId),
        }));
    },
    create: async ({ data }: any) => {
      const id = `list_${Date.now()}`;
      const l = { id, ...data, createdAt: new Date() };
      this.listings.set(id, l);
      return { ...l, owner: this.users.get(l.ownerId) };
    },
    update: async ({ where, data }: any) => {
      const existing = this.listings.get(where.id);
      if (!existing) throw new Error("Listing not found");
      const updated = { ...existing, ...data };
      this.listings.set(where.id, updated);
      return updated;
    },
    count: async ({ where }: any) => {
      return Array.from(this.listings.values()).filter((l) => {
        if (where.groupId && l.groupId !== where.groupId) return false;
        if (where.active !== undefined && l.active !== where.active) return false;
        return true;
      }).length;
    },
  };

  // Booking queries
  booking = {
    findUnique: async ({ where }: any) => {
      const b = this.bookings.get(where.id);
      if (!b) return null;
      return {
        ...b,
        listing: this.listings.get(b.listingId),
        requester: this.users.get(b.requesterId),
        provider: this.users.get(b.providerId),
        ledgerEntry: this.ledgerEntries.get(b.id) || null,
        reviews: Array.from(this.reviews.values()).filter((r) => r.bookingId === b.id),
      };
    },
    findMany: async ({ where }: any) => {
      return Array.from(this.bookings.values())
        .filter((b) => {
          if (where.providerId && b.providerId !== where.providerId) return false;
          if (where.requesterId && b.requesterId !== where.requesterId) return false;
          if (where.status && b.status !== where.status) return false;
          if (where.id?.not && b.id === where.id.not) return false;
          if (where.OR) {
            const matchesOr = where.OR.some(
              (cond: any) =>
                (cond.requesterId && b.requesterId === cond.requesterId) ||
                (cond.providerId && b.providerId === cond.providerId)
            );
            if (!matchesOr) return false;
          }
          return true;
        })
        .map((b) => ({
          ...b,
          listing: this.listings.get(b.listingId),
          requester: this.users.get(b.requesterId),
          provider: this.users.get(b.providerId),
          ledgerEntry: this.ledgerEntries.get(b.id) || null,
          reviews: Array.from(this.reviews.values()).filter((r) => r.bookingId === b.id),
        }));
    },
    create: async ({ data }: any) => {
      const id = `b_${Date.now()}`;
      const b = { id, ...data, createdAt: new Date() };
      this.bookings.set(id, b);
      return {
        ...b,
        listing: this.listings.get(b.listingId),
        requester: this.users.get(b.requesterId),
        provider: this.users.get(b.providerId),
      };
    },
    update: async ({ where, data }: any) => {
      const existing = this.bookings.get(where.id);
      if (!existing) throw new Error("Booking not found");
      const updated = { ...existing, ...data };
      this.bookings.set(where.id, updated);
      return updated;
    },
    count: async ({ where }: any) => {
      return Array.from(this.bookings.values()).filter((b) => {
        if (where.listing?.groupId) {
          const l = this.listings.get(b.listingId);
          if (l?.groupId !== where.listing.groupId) return false;
        }
        if (where.status?.in && !where.status.in.includes(b.status)) return false;
        return true;
      }).length;
    },
  };

  // Ledger queries
  ledgerEntry = {
    findMany: async ({ where }: any) => {
      return Array.from(this.ledgerEntries.values())
        .filter((tx) => {
          if (where.groupId && tx.groupId !== where.groupId) return false;
          if (where.toUserId && tx.toUserId !== where.toUserId) return false;
          if (where.fromUserId && tx.fromUserId !== where.fromUserId) return false;
          if (where.OR) {
            const matchesOr = where.OR.some(
              (cond: any) =>
                (cond.fromUserId && tx.fromUserId === cond.fromUserId) ||
                (cond.toUserId && tx.toUserId === cond.toUserId)
            );
            if (!matchesOr) return false;
          }
          return true;
        })
        .map((tx) => ({
          ...tx,
          fromUser: this.users.get(tx.fromUserId),
          toUser: this.users.get(tx.toUserId),
          group: this.coopGroups.get(tx.groupId),
        }));
    },
    create: async ({ data }: any) => {
      const id = `tx_${Date.now()}`;
      const entry = { id, ...data, createdAt: new Date() };
      this.ledgerEntries.set(entry.bookingId, entry);
      return entry;
    },
  };

  // Review queries
  review = {
    findUnique: async ({ where }: any) => {
      if (where.bookingId_reviewerId) {
        const key = `${where.bookingId_reviewerId.bookingId}_${where.bookingId_reviewerId.reviewerId}`;
        return this.reviews.get(key) || null;
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      return Array.from(this.reviews.values())
        .filter((r) => {
          if (where.revieweeId && r.revieweeId !== where.revieweeId) return false;
          if (where.bookingId && r.bookingId !== where.bookingId) return false;
          return true;
        })
        .map((r) => ({
          ...r,
          reviewer: this.users.get(r.reviewerId),
          reviewee: this.users.get(r.revieweeId),
        }));
    },
    create: async ({ data }: any) => {
      const key = `${data.bookingId}_${data.reviewerId}`;
      const id = `rev_${Date.now()}`;
      const r = { id, ...data, createdAt: new Date() };
      this.reviews.set(key, r);
      return {
        ...r,
        reviewer: this.users.get(r.reviewerId),
        reviewee: this.users.get(r.revieweeId),
      };
    },
  };

  // Atomic transaction support
  $transaction = async (callback: any) => {
    return callback(this);
  };
}

const memoryStore = globalThis.memoryStoreGlobal ?? new InMemoryPrismaStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.memoryStoreGlobal = memoryStore;
}

// Check whether a valid remote PostgreSQL database is configured
const hasPostgresUrl =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("ep-sample-pooler") &&
  !process.env.DATABASE_URL.includes("localhost:5432");

export const prisma: any = hasPostgresUrl
  ? globalThis.prismaGlobal ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : memoryStore;

if (hasPostgresUrl && process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
