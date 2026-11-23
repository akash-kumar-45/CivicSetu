import prisma from "../db";

export class FriendsService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  /**
   * Sends a mutual Trusted Circle / Friend request.
   */
  async sendRequest(senderId: string, recipientId: string) {
    if (senderId === recipientId) {
      throw new Error("You cannot add yourself to your Trusted Circle");
    }

    const recipient = await this.db.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      throw new Error("User not found");
    }

    // Check existing connection in EITHER direction
    const existing = await this.db.trustedConnection.findFirst({
      where: {
        OR: [
          { ownerId: senderId, workerId: recipientId },
          { ownerId: recipientId, workerId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        throw new Error(`${recipient.name} is already in your Trusted Circle`);
      }
      if (existing.status === "PENDING") {
        throw new Error("A Trusted Circle request is already pending between you two");
      }
      // Re-open declined connection
      return this.db.trustedConnection.update({
        where: { id: existing.id },
        data: {
          ownerId: senderId,
          workerId: recipientId,
          status: "PENDING",
        },
      });
    }

    return this.db.trustedConnection.create({
      data: {
        ownerId: senderId,
        workerId: recipientId,
        status: "PENDING",
      },
    });
  }

  /**
   * Accepts or declines a pending incoming friend request.
   */
  async respondToRequest(
    userId: string,
    connectionId: string,
    status: "ACCEPTED" | "DECLINED"
  ) {
    const connection = await this.db.trustedConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error("Connection request not found");
    }

    if (connection.workerId !== userId) {
      throw new Error("Forbidden: Only the recipient can respond to this request");
    }

    if (connection.status !== "PENDING") {
      throw new Error("This request has already been processed");
    }

    return this.db.trustedConnection.update({
      where: { id: connectionId },
      data: { status },
    });
  }

  /**
   * Removes a mutual connection (either party can remove).
   */
  async removeConnection(userId: string, connectionId: string) {
    const connection = await this.db.trustedConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.ownerId !== userId && connection.workerId !== userId) {
      throw new Error("Forbidden: You are not part of this connection");
    }

    return this.db.trustedConnection.delete({
      where: { id: connectionId },
    });
  }

  /**
   * Returns mutual ACCEPTED friends for BOTH sides, plus incoming and outgoing PENDING requests.
   */
  async getTrustedCircle(userId: string) {
    const userSelect = {
      id: true,
      name: true,
      ward: true,
      userIntent: true,
      isVerified: true,
      skills: true,
    };

    const [acceptedConnections, incomingRequests, outgoingRequests] = await Promise.all([
      this.db.trustedConnection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ ownerId: userId }, { workerId: userId }],
        },
        include: {
          owner: { select: userSelect },
          worker: { select: userSelect },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.db.trustedConnection.findMany({
        where: { workerId: userId, status: "PENDING" },
        include: { owner: { select: userSelect } },
        orderBy: { createdAt: "desc" },
      }),
      this.db.trustedConnection.findMany({
        where: { ownerId: userId, status: "PENDING" },
        include: { worker: { select: userSelect } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Map the OTHER person in each accepted connection so both sides see each other
    const trustedWorkers = acceptedConnections.map((conn: any) => {
      const friend = conn.ownerId === userId ? conn.worker : conn.owner;
      const canReceiveJobs =
        friend.userIntent === "WORKER" || friend.userIntent === "BOTH";

      return {
        ...friend,
        connectionId: conn.id,
        canReceiveJobs,
      };
    });

    return {
      trustedWorkers,
      incomingRequests,
      outgoingRequests,
    };
  }

// Backward-compatible method aliases for API routes
  async getConnectionsOverview(userId: string) {
    return this.getTrustedCircle(userId);
  }

  async getTrustedCircleForUser(userId: string) {
    return this.getTrustedCircle(userId);
  }

  async sendConnectionRequest(senderId: string, recipientId: string) {
    return this.sendRequest(senderId, recipientId);
  }

  async respondToConnection(
    userId: string,
    connectionId: string,
    status: "ACCEPTED" | "DECLINED"
  ) {
    return this.respondToRequest(userId, connectionId, status);
  }


  /**
   * Checks whether two users have an ACCEPTED mutual connection in either direction.
   */
  async isTrustedWorker(userAId: string, userBId: string): Promise<boolean> {
    const connection = await this.db.trustedConnection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { ownerId: userAId, workerId: userBId },
          { ownerId: userBId, workerId: userAId },
        ],
      },
    });

    return Boolean(connection);
  }
}

export const friendsService = new FriendsService();