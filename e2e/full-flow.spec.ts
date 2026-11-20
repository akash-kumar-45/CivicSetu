import { test, expect } from "@playwright/test";
import { authService } from "../backend/src/server/services/auth.service";
import { groupsService } from "../backend/src/server/services/groups.service";
import { listingsService } from "../backend/src/server/services/listings.service";
import { bookingsService } from "../backend/src/server/services/bookings.service";
import { ledgerService } from "../backend/src/server/services/ledger.service";
import { reviewsService } from "../backend/src/server/services/reviews.service";

test.describe("Full Cooperative End-to-End Lifecycle Flow", () => {
  let mockDb: any;
  let customAuth: any;
  let customGroups: any;
  let customListings: any;
  let customLedger: any;
  let customBookings: any;
  let customReviews: any;

  // In-memory persistent database store for this full lifecycle test
  const memoryStore = {
    users: new Map<string, any>(),
    groups: new Map<string, any>(),
    memberships: new Map<string, any>(),
    listings: new Map<string, any>(),
    bookings: new Map<string, any>(),
    ledgerEntries: new Map<string, any>(),
    reviews: new Map<string, any>(),
  };

  test.beforeAll(() => {
    mockDb = {
      user: {
        findUnique: async ({ where }: any) => {
          if (where.email) {
            return Array.from(memoryStore.users.values()).find((u) => u.email === where.email) || null;
          }
          if (where.id) {
            return memoryStore.users.get(where.id) || null;
          }
          return null;
        },
        create: async ({ data }: any) => {
          const user = { id: `u_${Date.now()}_${Math.random()}`, ...data, createdAt: new Date() };
          memoryStore.users.set(user.id, user);
          return user;
        },
        update: async ({ where, data }: any) => {
          const existing = memoryStore.users.get(where.id);
          const updated = { ...existing, ...data };
          memoryStore.users.set(where.id, updated);
          return updated;
        },
      },
      coopGroup: {
        create: async ({ data }: any) => {
          const id = `g_${Date.now()}`;
          const group = { id, name: data.name, locality: data.locality, createdAt: new Date() };
          memoryStore.groups.set(id, group);

          // Add creator membership
          if (data.memberships?.create) {
            const m = {
              id: `m_${Date.now()}`,
              userId: data.memberships.create.userId,
              groupId: id,
              status: data.memberships.create.status,
              createdAt: new Date(),
            };
            memoryStore.memberships.set(`${m.userId}_${m.groupId}`, m);
          }
          return group;
        },
        findUnique: async ({ where }: any) => {
          return memoryStore.groups.get(where.id) || null;
        },
      },
      membership: {
        findUnique: async ({ where }: any) => {
          const key = where.userId_groupId ? `${where.userId_groupId.userId}_${where.userId_groupId.groupId}` : null;
          const membership = key ? memoryStore.memberships.get(key) : null;
          if (membership) {
            const user = memoryStore.users.get(membership.userId);
            return { ...membership, user };
          }
          return null;
        },
        create: async ({ data }: any) => {
          const m = { id: `m_${Date.now()}`, ...data, createdAt: new Date() };
          memoryStore.memberships.set(`${data.userId}_${data.groupId}`, m);
          return m;
        },
        update: async ({ where, data }: any) => {
          const key = `${where.userId_groupId.userId}_${where.userId_groupId.groupId}`;
          const existing = memoryStore.memberships.get(key);
          const updated = { ...existing, ...data };
          memoryStore.memberships.set(key, updated);
          return updated;
        },
      },
      listing: {
        create: async ({ data }: any) => {
          const listing = { id: `l_${Date.now()}`, ...data, createdAt: new Date() };
          memoryStore.listings.set(listing.id, listing);
          return listing;
        },
        findUnique: async ({ where }: any) => {
          return memoryStore.listings.get(where.id) || null;
        },
      },
      booking: {
        create: async ({ data }: any) => {
          const b = { id: `b_${Date.now()}`, ...data, createdAt: new Date() };
          memoryStore.bookings.set(b.id, b);
          return b;
        },
        findUnique: async ({ where }: any) => {
          const b = memoryStore.bookings.get(where.id);
          if (b) {
            const listing = memoryStore.listings.get(b.listingId);
            return { ...b, listing };
          }
          return null;
        },
        findMany: async ({ where }: any) => {
          return Array.from(memoryStore.bookings.values()).filter((b) => {
            if (where.providerId && b.providerId !== where.providerId) return false;
            if (where.status && b.status !== where.status) return false;
            if (where.id?.not && b.id === where.id.not) return false;
            return true;
          });
        },
        update: async ({ where, data }: any) => {
          const existing = memoryStore.bookings.get(where.id);
          const updated = { ...existing, ...data };
          memoryStore.bookings.set(where.id, updated);
          return updated;
        },
      },
      ledgerEntry: {
        findMany: async ({ where }: any) => {
          return Array.from(memoryStore.ledgerEntries.values()).filter((entry) => {
            if (where.toUserId && entry.toUserId !== where.toUserId) return false;
            if (where.fromUserId && entry.fromUserId !== where.fromUserId) return false;
            if (where.groupId && entry.groupId !== where.groupId) return false;
            return true;
          });
        },
        create: async ({ data }: any) => {
          const entry = { id: `tx_${Date.now()}`, ...data, createdAt: new Date() };
          memoryStore.ledgerEntries.set(entry.bookingId, entry);
          return entry;
        },
      },
      review: {
        findUnique: async ({ where }: any) => {
          if (where.bookingId_reviewerId) {
            const key = `${where.bookingId_reviewerId.bookingId}_${where.bookingId_reviewerId.reviewerId}`;
            return memoryStore.reviews.get(key) || null;
          }
          return null;
        },
        create: async ({ data }: any) => {
          const key = `${data.bookingId}_${data.reviewerId}`;
          const review = { id: `rev_${Date.now()}`, ...data, createdAt: new Date() };
          memoryStore.reviews.set(key, review);
          return review;
        },
        findMany: async ({ where }: any) => {
          return Array.from(memoryStore.reviews.values()).filter((r) => {
            if (where.revieweeId && r.revieweeId !== where.revieweeId) return false;
            return true;
          });
        },
      },
      $transaction: async (cb: any) => cb(mockDb),
    };

    customAuth = new (authService.constructor as any)(mockDb);
    customGroups = new (groupsService.constructor as any)(mockDb);
    customListings = new (listingsService.constructor as any)(mockDb);
    customLedger = new (ledgerService.constructor as any)(mockDb);
    customBookings = new (bookingsService.constructor as any)(mockDb, customLedger);
    customReviews = new (reviewsService.constructor as any)(mockDb);
  });

  test("Step 1 to 10: Complete flow across all modules", async () => {
    // 1. Register Alice (Admin/Provider) and Bob (Member/Requester)
    const alice = await customAuth.register({
      name: "Alice Cooper",
      email: "alice.flow@example.com",
      password: "password123",
      role: "ADMIN",
    });
    expect(alice.id).toBeDefined();

    const bob = await customAuth.register({
      name: "Bob Builder",
      email: "bob.flow@example.com",
      password: "password123",
      role: "MEMBER",
    });
    expect(bob.id).toBeDefined();

    // 2. Alice creates a Cooperative Group: "Greenway Housing Society"
    const group = await customGroups.createGroup(alice.id, {
      name: "Greenway Housing Society",
      locality: "Greenway Lane",
    });
    expect(group.id).toBeDefined();
    expect(group.name).toBe("Greenway Housing Society");

    // 3. Bob requests to join Greenway Housing Society
    const joinReq = await customGroups.requestToJoin(bob.id, group.id);
    expect(joinReq.status).toBe("PENDING");

    // 4. Alice (Admin) approves Bob's membership
    const approvedMember = await customGroups.approveMember(alice.id, group.id, bob.id);
    expect(approvedMember.status).toBe("ACTIVE");

    // 5. Bootstrap Bob's time-credit balance with 5 initial community credits
    // so Bob has sufficient balance to pay for services
    await mockDb.ledgerEntry.create({
      data: {
        groupId: group.id,
        fromUserId: alice.id,
        toUserId: bob.id,
        amount: 5,
        bookingId: `genesis_grant_${bob.id}`,
      },
    });

    const bobInitialBalance = await customLedger.getUserBalance(bob.id, group.id);
    expect(bobInitialBalance).toBe(5);

    // 6. Alice creates an OFFER listing: "Home Cooking & Meal Prep" at 2 credits/hr
    const listing = await customListings.createListing(alice.id, {
      groupId: group.id,
      type: "OFFER",
      category: "Cooking",
      title: "Home Cooking & Meal Prep",
      description: "Nutritious home cooked batch meals for busy families.",
      hourlyCredits: 2,
    });
    expect(listing.id).toBeDefined();
    expect(listing.title).toBe("Home Cooking & Meal Prep");

    // 7. Bob requests a booking on Alice's listing (duration: 60 mins -> 2 credits)
    // Starts 1 hour ago so completion is immediately valid
    const oneHourAgo = new Date(Date.now() - 3600000);
    const booking = await customBookings.createBookingRequest(bob.id, {
      listingId: listing.id,
      startsAt: oneHourAgo.toISOString(),
      durationMinutes: 60,
    });
    expect(booking.status).toBe("REQUESTED");
    expect(booking.creditAmount).toBe(2);
    expect(booking.requesterId).toBe(bob.id);
    expect(booking.providerId).toBe(alice.id);

    // 8. Alice accepts the booking
    const acceptedBooking = await customBookings.acceptBooking(alice.id, booking.id);
    expect(acceptedBooking.status).toBe("ACCEPTED");

    // 9. Alice marks booking completed:
    // Atomic execution transfers 2 credits from Bob to Alice
    const completionResult = await customBookings.completeBooking(alice.id, booking.id);
    expect(completionResult.booking.status).toBe("COMPLETED");
    expect(completionResult.ledgerEntry.amount).toBe(2);

    // Verify derived balances on the append-only ledger
    const bobFinalBalance = await customLedger.getUserBalance(bob.id, group.id);
    const aliceFinalBalance = await customLedger.getUserBalance(alice.id, group.id);

    expect(bobFinalBalance).toBe(3); // 5 - 2 = 3
    expect(aliceFinalBalance).toBe(-3); // paid 5 grant, earned 2 = -3 (net)

    // 10. Bob reviews Alice (5 stars)
    const review = await customReviews.createReview(bob.id, {
      bookingId: booking.id,
      rating: 5,
      comment: "Delicious meals, very kind neighbor!",
    });
    expect(review.rating).toBe(5);

    const aliceRatingSummary = await customReviews.getUserRatingSummary(alice.id);
    expect(aliceRatingSummary.averageRating).toBe(5);
    expect(aliceRatingSummary.totalReviews).toBe(1);

    // Verify booking transitioned to REVIEWED
    const finalBooking = await customBookings.getBookingById(alice.id, booking.id);
    expect(finalBooking.status).toBe("REVIEWED");
  });
});
