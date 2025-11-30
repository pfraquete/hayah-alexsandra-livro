import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getCreatorProfileByUserId,
  getCreatorProfileById,
  createCreatorProfile,
  updateCreatorProfile,
  getApprovedCreators,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  createPost,
  addPostMedia,
  getPostWithDetails,
  getFeedPosts,
  getCreatorPosts,
  deletePost,
  updatePost,
  likePost,
  unlikePost,
  hasLikedPost,
  createComment,
  getPostComments,
  deleteComment,
  likeComment,
  unlikeComment,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  getPostById,
} from "./db-social";

// Creator Profile Router
export const creatorRouter = router({
  // Get current user's creator profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getCreatorProfileByUserId(ctx.user.id);
  }),

  // Get creator profile by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCreatorProfileById(input.id);
    }),

  // Create creator profile
  create: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(2).max(100),
        bio: z.string().max(500).optional(),
        instagram: z.string().max(100).optional(),
        youtube: z.string().max(100).optional(),
        website: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if already has a profile
      const existing = await getCreatorProfileByUserId(ctx.user.id);
      if (existing) {
        throw new Error("Você já possui um perfil de criadora");
      }

      const profileId = await createCreatorProfile({
        userId: ctx.user.id,
        ...input,
        status: "approved", // Auto-approve for now
      });

      return { success: true, profileId };
    }),

  // Update creator profile
  update: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(2).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().max(500).optional(),
        coverUrl: z.string().max(500).optional(),
        instagram: z.string().max(100).optional(),
        youtube: z.string().max(100).optional(),
        website: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateCreatorProfile(ctx.user.id, input);
      return { success: true };
    }),

  // List approved creators
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getApprovedCreators(input.limit, input.offset);
    }),
});

// Followers Router
export const followersRouter = router({
  // Follow a creator
  follow: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new Error("Você não pode seguir a si mesma");
      }

      const alreadyFollowing = await isFollowing(ctx.user.id, input.userId);
      if (alreadyFollowing) {
        throw new Error("Você já segue esta criadora");
      }

      await followUser(ctx.user.id, input.userId);

      // Create notification for the followed user
      await createNotification({
        userId: input.userId,
        type: "follow",
        title: "Nova seguidora",
        message: `${ctx.user.name || "Alguém"} começou a seguir você`,
        linkUrl: `/comunidade/perfil/${ctx.user.id}`,
      });

      return { success: true };
    }),

  // Unfollow a creator
  unfollow: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await unfollowUser(ctx.user.id, input.userId);
      return { success: true };
    }),

  // Check if following
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await isFollowing(ctx.user.id, input.userId);
    }),

  // Get followers list
  followers: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getFollowers(input.userId, input.limit, input.offset);
    }),

  // Get following list
  following: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getFollowing(input.userId, input.limit, input.offset);
    }),
});

// Posts Router
export const postsRouter = router({
  // Create a new post
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().max(5000).optional(),
        visibility: z.enum(["public", "followers", "private"]).default("public"),
        media: z
          .array(
            z.object({
              mediaUrl: z.string(),
              mediaType: z.enum(["image", "video"]),
              thumbnailUrl: z.string().optional(),
            })
          )
          .max(10)
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has a creator profile
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Você precisa criar um perfil de criadora primeiro");
      }

      if (profile.status !== "approved") {
        throw new Error("Seu perfil ainda não foi aprovado");
      }

      const postId = await createPost({
        creatorId: profile.id,
        content: input.content,
        visibility: input.visibility,
      });

      // Add media if provided
      if (input.media && input.media.length > 0) {
        await addPostMedia(
          input.media.map((m, index) => ({
            postId,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            thumbnailUrl: m.thumbnailUrl,
            orderIndex: index,
          }))
        );
      }

      return { success: true, postId };
    }),

  // Get post by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getPostWithDetails(input.id, ctx.user?.id);
    }),

  // Get feed posts
  feed: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "following"]).default("all"),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getFeedPosts(ctx.user.id, input.limit, input.offset, input.type);
    }),

  // Get creator's posts
  byCreator: publicProcedure
    .input(
      z.object({
        creatorId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getCreatorPosts(input.creatorId, ctx.user?.id, input.limit, input.offset);
    }),

  // Update post
  update: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().max(5000).optional(),
        visibility: z.enum(["public", "followers", "private"]).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const post = await getPostById(input.postId);
      if (!post || post.creatorId !== profile.id) {
        throw new Error("Post não encontrado ou você não tem permissão");
      }

      const { postId, ...data } = input;
      await updatePost(postId, data);
      return { success: true };
    }),

  // Delete post
  delete: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const post = await getPostById(input.postId);
      if (!post || post.creatorId !== profile.id) {
        throw new Error("Post não encontrado ou você não tem permissão");
      }

      await deletePost(input.postId, profile.id);
      return { success: true };
    }),
});

// Likes Router
export const likesRouter = router({
  // Like a post
  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const alreadyLiked = await hasLikedPost(input.postId, ctx.user.id);
      if (alreadyLiked) {
        throw new Error("Você já curtiu este post");
      }

      await likePost(input.postId, ctx.user.id);

      // Get post to create notification
      const post = await getPostWithDetails(input.postId);
      if (post && post.creator.userId !== ctx.user.id) {
        await createNotification({
          userId: post.creator.userId,
          type: "like",
          title: "Nova curtida",
          message: `${ctx.user.name || "Alguém"} curtiu seu post`,
          linkUrl: `/comunidade/post/${input.postId}`,
        });
      }

      return { success: true };
    }),

  // Unlike a post
  unlike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await unlikePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  // Like a comment
  likeComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await likeComment(input.commentId, ctx.user.id);
      return { success: true };
    }),

  // Unlike a comment
  unlikeComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await unlikeComment(input.commentId, ctx.user.id);
      return { success: true };
    }),
});

// Comments Router
export const commentsRouter = router({
  // Create comment
  create: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(2000),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commentId = await createComment({
        postId: input.postId,
        userId: ctx.user.id,
        content: input.content,
        parentId: input.parentId,
      });

      // Create notification for post owner
      const post = await getPostWithDetails(input.postId);
      if (post && post.creator.userId !== ctx.user.id) {
        await createNotification({
          userId: post.creator.userId,
          type: "comment",
          title: "Novo comentário",
          message: `${ctx.user.name || "Alguém"} comentou no seu post`,
          linkUrl: `/comunidade/post/${input.postId}`,
        });
      }

      return { success: true, commentId };
    }),

  // Get comments for a post
  list: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getPostComments(input.postId, ctx.user?.id, input.limit, input.offset);
    }),

  // Delete comment
  delete: protectedProcedure
    .input(z.object({ commentId: z.number(), postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Add proper permission check (comment owner or post owner can delete)
      await deleteComment(input.commentId, input.postId);
      return { success: true };
    }),
});

// Notifications Router
export const notificationsRouter = router({
  // Get user notifications
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getUserNotifications(ctx.user.id, input.limit, input.offset);
    }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await getUnreadNotificationsCount(ctx.user.id);
  }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await markNotificationAsRead(input.notificationId, ctx.user.id);
      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),
});

// Combined Social Router
export const socialRouter = router({
  creator: creatorRouter,
  followers: followersRouter,
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
});
