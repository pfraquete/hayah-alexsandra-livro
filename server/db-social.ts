import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  creatorProfiles,
  followers,
  posts,
  postMedia,
  postLikes,
  postComments,
  commentLikes,
  notifications,
  users,
  type InsertCreatorProfile,
  type InsertPost,
  type InsertPostMedia,
  type InsertPostComment,
  type InsertNotification,
} from "../drizzle/schema";

// ============================================
// CREATOR PROFILE FUNCTIONS
// ============================================

export async function getCreatorProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function getCreatorProfileById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      profile: creatorProfiles,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(creatorProfiles)
    .leftJoin(users, eq(creatorProfiles.userId, users.id))
    .where(eq(creatorProfiles.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createCreatorProfile(data: InsertCreatorProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creatorProfiles).values(data).returning({ id: creatorProfiles.id });
  return result[0].id;
}

export async function updateCreatorProfile(
  userId: number,
  data: Partial<InsertCreatorProfile>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(creatorProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(creatorProfiles.userId, userId));
}

export async function getApprovedCreators(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      profile: creatorProfiles,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(creatorProfiles)
    .leftJoin(users, eq(creatorProfiles.userId, users.id))
    .where(eq(creatorProfiles.status, "approved"))
    .orderBy(desc(creatorProfiles.followersCount))
    .limit(limit)
    .offset(offset);
}

// ============================================
// FOLLOWER FUNCTIONS
// ============================================

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(followers).values({ followerId, followingId });
  await db
    .update(creatorProfiles)
    .set({
      followersCount: sql`${creatorProfiles.followersCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.userId, followingId));
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(followers)
    .where(
      and(
        eq(followers.followerId, followerId),
        eq(followers.followingId, followingId)
      )
    );
  await db
    .update(creatorProfiles)
    .set({
      followersCount: sql`GREATEST(${creatorProfiles.followersCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.userId, followingId));
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(followers)
    .where(
      and(
        eq(followers.followerId, followerId),
        eq(followers.followingId, followingId)
      )
    )
    .limit(1);
  return result.length > 0;
}

export async function getFollowers(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: users.id,
      name: users.name,
      followedAt: followers.createdAt,
    })
    .from(followers)
    .innerJoin(users, eq(followers.followerId, users.id))
    .where(eq(followers.followingId, userId))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getFollowing(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      profile: creatorProfiles,
      user: {
        id: users.id,
        name: users.name,
      },
      followedAt: followers.createdAt,
    })
    .from(followers)
    .innerJoin(users, eq(followers.followingId, users.id))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(eq(followers.followerId, userId))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============================================
// POST FUNCTIONS
// ============================================

export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(posts).values(data).returning({ id: posts.id });
  await db
    .update(creatorProfiles)
    .set({
      postsCount: sql`${creatorProfiles.postsCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, data.creatorId));
  return result[0].id;
}

export async function addPostMedia(data: InsertPostMedia[]) {
  if (data.length === 0) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(postMedia).values(data);
}

export async function getPostById(postId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  return result[0] || null;
}

export async function getPostWithDetails(postId: number, currentUserId?: number) {
  const db = await getDb();
  if (!db) return null;
  const post = await db
    .select({
      post: posts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
        userId: creatorProfiles.userId,
      },
    })
    .from(posts)
    .innerJoin(creatorProfiles, eq(posts.creatorId, creatorProfiles.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post[0]) return null;

  const media = await db
    .select()
    .from(postMedia)
    .where(eq(postMedia.postId, postId))
    .orderBy(postMedia.orderIndex);

  let isLiked = false;
  if (currentUserId) {
    const like = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, currentUserId)))
      .limit(1);
    isLiked = like.length > 0;
  }

  return {
    ...post[0],
    media,
    isLiked,
  };
}

export async function getFeedPosts(
  currentUserId: number,
  limit = 20,
  offset = 0,
  feedType: "all" | "following" = "all"
) {
  const db = await getDb();
  if (!db) return [];

  let postsResult;

  if (feedType === "following") {
    const followedUserIds = db
      .select({ id: followers.followingId })
      .from(followers)
      .where(eq(followers.followerId, currentUserId));

    postsResult = await db
      .select({
        post: posts,
        creator: {
          id: creatorProfiles.id,
          displayName: creatorProfiles.displayName,
          avatarUrl: creatorProfiles.avatarUrl,
          userId: creatorProfiles.userId,
        },
      })
      .from(posts)
      .innerJoin(creatorProfiles, eq(posts.creatorId, creatorProfiles.id))
      .where(
        and(
          eq(posts.visibility, "public"),
          inArray(creatorProfiles.userId, followedUserIds)
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    postsResult = await db
      .select({
        post: posts,
        creator: {
          id: creatorProfiles.id,
          displayName: creatorProfiles.displayName,
          avatarUrl: creatorProfiles.avatarUrl,
          userId: creatorProfiles.userId,
        },
      })
      .from(posts)
      .innerJoin(creatorProfiles, eq(posts.creatorId, creatorProfiles.id))
      .where(eq(posts.visibility, "public"))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  const postsWithDetails = await Promise.all(
    postsResult.map(async (item: typeof postsResult[0]) => {
      const media = await db
        .select()
        .from(postMedia)
        .where(eq(postMedia.postId, item.post.id))
        .orderBy(postMedia.orderIndex);

      const like = await db
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.postId, item.post.id),
            eq(postLikes.userId, currentUserId)
          )
        )
        .limit(1);

      return {
        ...item,
        media,
        isLiked: like.length > 0,
      };
    })
  );

  return postsWithDetails;
}

export async function getCreatorPosts(
  creatorId: number,
  currentUserId?: number,
  limit = 20,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  const postsResult = await db
    .select({
      post: posts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
        userId: creatorProfiles.userId,
      },
    })
    .from(posts)
    .innerJoin(creatorProfiles, eq(posts.creatorId, creatorProfiles.id))
    .where(eq(posts.creatorId, creatorId))
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const postsWithDetails = await Promise.all(
    postsResult.map(async (item: typeof postsResult[0]) => {
      const media = await db
        .select()
        .from(postMedia)
        .where(eq(postMedia.postId, item.post.id))
        .orderBy(postMedia.orderIndex);

      let isLiked = false;
      if (currentUserId) {
        const like = await db
          .select()
          .from(postLikes)
          .where(
            and(
              eq(postLikes.postId, item.post.id),
              eq(postLikes.userId, currentUserId)
            )
          )
          .limit(1);
        isLiked = like.length > 0;
      }

      return {
        ...item,
        media,
        isLiked,
      };
    })
  );

  return postsWithDetails;
}

export async function deletePost(postId: number, creatorId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(postMedia).where(eq(postMedia.postId, postId));
  await db.delete(postLikes).where(eq(postLikes.postId, postId));

  const comments = await db
    .select({ id: postComments.id })
    .from(postComments)
    .where(eq(postComments.postId, postId));

  if (comments.length > 0) {
    await db
      .delete(commentLikes)
      .where(inArray(commentLikes.commentId, comments.map((c: { id: number }) => c.id)));
    await db.delete(postComments).where(eq(postComments.postId, postId));
  }

  await db.delete(posts).where(eq(posts.id, postId));

  await db
    .update(creatorProfiles)
    .set({
      postsCount: sql`GREATEST(${creatorProfiles.postsCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, creatorId));
}

export async function updatePost(
  postId: number,
  data: { content?: string; visibility?: "public" | "followers" | "private"; isPinned?: boolean }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, postId));
}

// ============================================
// LIKE FUNCTIONS
// ============================================

export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postLikes).values({ postId, userId });
  await db
    .update(posts)
    .set({
      likesCount: sql`${posts.likesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  await db
    .update(posts)
    .set({
      likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

export async function hasLikedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  return result.length > 0;
}

// ============================================
// COMMENT FUNCTIONS
// ============================================

export async function createComment(data: InsertPostComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .insert(postComments)
    .values(data)
    .returning({ id: postComments.id });

  await db
    .update(posts)
    .set({
      commentsCount: sql`${posts.commentsCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, data.postId));

  return result[0].id;
}

export async function getPostComments(
  postId: number,
  currentUserId?: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  const commentsResult = await db
    .select({
      comment: postComments,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(desc(postComments.createdAt))
    .limit(limit)
    .offset(offset);

  const commentsWithLikes = await Promise.all(
    commentsResult.map(async (item: typeof commentsResult[0]) => {
      let isLiked = false;
      if (currentUserId) {
        const like = await db
          .select()
          .from(commentLikes)
          .where(
            and(
              eq(commentLikes.commentId, item.comment.id),
              eq(commentLikes.userId, currentUserId)
            )
          )
          .limit(1);
        isLiked = like.length > 0;
      }
      return { ...item, isLiked };
    })
  );

  return commentsWithLikes;
}

export async function deleteComment(commentId: number, postId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(commentLikes).where(eq(commentLikes.commentId, commentId));
  await db.delete(postComments).where(eq(postComments.id, commentId));
  await db
    .update(posts)
    .set({
      commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

export async function likeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(commentLikes).values({ commentId, userId });
  await db
    .update(postComments)
    .set({
      likesCount: sql`${postComments.likesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(postComments.id, commentId));
}

export async function unlikeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(commentLikes)
    .where(
      and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      )
    );
  await db
    .update(postComments)
    .set({
      likesCount: sql`GREATEST(${postComments.likesCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(postComments.id, commentId));
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getUserNotifications(
  userId: number,
  limit = 20,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  return result[0]?.count || 0;
}
