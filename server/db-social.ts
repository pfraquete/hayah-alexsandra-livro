import { supabaseAdmin } from "./supabase";

// Types for social module
export interface CreatorProfile {
  id: number;
  userId: number;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  followersCount: number;
  postsCount: number;
  coursesCount: number;
  isVerified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Post {
  id: number;
  creatorId: number;
  content: string;
  visibility: "public" | "followers" | "private";
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PostMedia {
  id: number;
  postId: number;
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl: string | null;
  orderIndex: number;
  createdAt: Date | null;
}

export interface PostComment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  likesCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date | null;
}

export interface InsertCreatorProfile {
  userId: number;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  status?: "pending" | "approved" | "rejected" | "suspended";
}

export interface InsertPost {
  creatorId: number;
  content?: string;
  visibility?: "public" | "followers" | "private";
  isPinned?: boolean;
}

export interface InsertPostMedia {
  postId: number;
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  orderIndex: number;
}

export interface InsertPostComment {
  postId: number;
  userId: number;
  parentId?: number | null;
  content: string;
}

export interface InsertNotification {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  linkUrl?: string | null;
}

// ============================================
// CREATOR PROFILE FUNCTIONS
// ============================================

export async function getCreatorProfileByUserId(userId: number) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('creatorProfiles')
    .select('*')
    .eq('userId', userId)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("[Database] Error fetching creator profile:", error);
    }
    return null;
  }

  return data as CreatorProfile;
}

export async function getCreatorProfileById(id: number) {
  if (!supabaseAdmin) return null;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('creatorProfiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) return null;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('id', profile.userId)
    .single();

  return {
    profile,
    user: user || { id: profile.userId, name: null, email: null },
  };
}

export async function createCreatorProfile(data: InsertCreatorProfile): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('creatorProfiles')
    .insert({
      ...data,
      status: data.status || 'pending',
      followersCount: 0,
      postsCount: 0,
      coursesCount: 0,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating creator profile:", error);
    throw error;
  }

  return result.id;
}

export async function updateCreatorProfile(
  userId: number,
  data: Partial<InsertCreatorProfile>
): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('creatorProfiles')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('userId', userId);

  if (error) {
    console.error("[Database] Error updating creator profile:", error);
  }
}

export async function getApprovedCreators(limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: profiles, error } = await supabaseAdmin
    .from('creatorProfiles')
    .select('*')
    .eq('status', 'approved')
    .order('followersCount', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !profiles) return [];

  const userIds = profiles.map(p => p.userId);
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', userIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  return profiles.map(profile => ({
    profile,
    user: usersMap.get(profile.userId) || { id: profile.userId, name: null },
  }));
}

// ============================================
// FOLLOWER FUNCTIONS
// ============================================

export async function followUser(followerId: number, followingId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: insertError } = await supabaseAdmin
    .from('followers')
    .insert({
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });

  if (insertError) {
    console.error("[Database] Error following user:", insertError);
    return;
  }

  // Increment followers count
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('followersCount')
    .eq('userId', followingId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        followersCount: (profile.followersCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', followingId);
  }
}

export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: deleteError } = await supabaseAdmin
    .from('followers')
    .delete()
    .match({ followerId, followingId });

  if (deleteError) {
    console.error("[Database] Error unfollowing user:", deleteError);
    return;
  }

  // Decrement followers count
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('followersCount')
    .eq('userId', followingId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        followersCount: Math.max((profile.followersCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', followingId);
  }
}

export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data, error } = await supabaseAdmin
    .from('followers')
    .select('id')
    .match({ followerId, followingId })
    .limit(1)
    .single();

  return !error && !!data;
}

export async function getFollowers(userId: number, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: followRecords, error } = await supabaseAdmin
    .from('followers')
    .select('followerId, createdAt')
    .eq('followingId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !followRecords) return [];

  const followerIds = followRecords.map(f => f.followerId);
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', followerIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  return followRecords.map(record => ({
    id: usersMap.get(record.followerId)?.id || record.followerId,
    name: usersMap.get(record.followerId)?.name || null,
    followedAt: record.createdAt,
  }));
}

export async function getFollowing(userId: number, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: followRecords, error } = await supabaseAdmin
    .from('followers')
    .select('followingId, createdAt')
    .eq('followerId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !followRecords) return [];

  const followingIds = followRecords.map(f => f.followingId);

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', followingIds);

  const { data: profiles } = await supabaseAdmin
    .from('creatorProfiles')
    .select('*')
    .in('userId', followingIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));
  const profilesMap = new Map((profiles || []).map(p => [p.userId, p]));

  return followRecords.map(record => ({
    profile: profilesMap.get(record.followingId) || null,
    user: usersMap.get(record.followingId) || { id: record.followingId, name: null },
    followedAt: record.createdAt,
  }));
}

// ============================================
// POST FUNCTIONS
// ============================================

export async function createPost(data: InsertPost): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('posts')
    .insert({
      ...data,
      visibility: data.visibility || 'public',
      isPinned: data.isPinned || false,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating post:", error);
    throw error;
  }

  // Increment posts count for creator
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('postsCount')
    .eq('id', data.creatorId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        postsCount: (profile.postsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', data.creatorId);
  }

  return result.id;
}

export async function addPostMedia(data: InsertPostMedia[]): Promise<void> {
  if (data.length === 0) return;
  if (!supabaseAdmin) return;

  const mediaWithTimestamp = data.map(item => ({
    ...item,
    createdAt: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from('postMedia')
    .insert(mediaWithTimestamp);

  if (error) {
    console.error("[Database] Error adding post media:", error);
  }
}

export async function getPostById(postId: number): Promise<Post | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) return null;
  return data as Post;
}

export async function getPostWithDetails(postId: number, currentUserId?: number) {
  if (!supabaseAdmin) return null;

  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (postError || !post) return null;

  // Get creator info
  const { data: creator } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl, userId')
    .eq('id', post.creatorId)
    .single();

  // Get media
  const { data: media } = await supabaseAdmin
    .from('postMedia')
    .select('*')
    .eq('postId', postId)
    .order('orderIndex', { ascending: true });

  // Check if current user liked
  let isLiked = false;
  if (currentUserId) {
    const { data: like } = await supabaseAdmin
      .from('postLikes')
      .select('id')
      .match({ postId, userId: currentUserId })
      .single();
    isLiked = !!like;
  }

  return {
    post,
    creator: creator || { id: post.creatorId, displayName: 'Unknown', avatarUrl: null, userId: 0 },
    media: media || [],
    isLiked,
  };
}

export async function getFeedPosts(
  currentUserId: number,
  limit = 20,
  offset = 0,
  feedType: "all" | "following" = "all"
) {
  if (!supabaseAdmin) return [];

  let creatorIds: number[] = [];

  if (feedType === "following") {
    // Get followed user IDs
    const { data: following } = await supabaseAdmin
      .from('followers')
      .select('followingId')
      .eq('followerId', currentUserId);

    if (!following || following.length === 0) return [];

    const followedUserIds = following.map(f => f.followingId);

    // Get creator profiles for followed users
    const { data: profiles } = await supabaseAdmin
      .from('creatorProfiles')
      .select('id')
      .in('userId', followedUserIds);

    if (!profiles || profiles.length === 0) return [];
    creatorIds = profiles.map(p => p.id);
  }

  // Build query
  let query = supabaseAdmin
    .from('posts')
    .select('*')
    .eq('visibility', 'public')
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (feedType === "following" && creatorIds.length > 0) {
    query = query.in('creatorId', creatorIds);
  }

  const { data: posts, error } = await query;

  if (error || !posts) return [];

  // Get all creator IDs from posts
  const postCreatorIds = [...new Set(posts.map(p => p.creatorId))];

  // Get creators
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl, userId')
    .in('id', postCreatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  // Get all post IDs
  const postIds = posts.map(p => p.id);

  // Get media for all posts
  const { data: allMedia } = await supabaseAdmin
    .from('postMedia')
    .select('*')
    .in('postId', postIds)
    .order('orderIndex', { ascending: true });

  const mediaByPost = new Map<number, typeof allMedia>();
  (allMedia || []).forEach(m => {
    const existing = mediaByPost.get(m.postId) || [];
    existing.push(m);
    mediaByPost.set(m.postId, existing);
  });

  // Check which posts current user liked
  const { data: likes } = await supabaseAdmin
    .from('postLikes')
    .select('postId')
    .eq('userId', currentUserId)
    .in('postId', postIds);

  const likedPostIds = new Set((likes || []).map(l => l.postId));

  return posts.map(post => ({
    post,
    creator: creatorsMap.get(post.creatorId) || { id: post.creatorId, displayName: 'Unknown', avatarUrl: null, userId: 0 },
    media: mediaByPost.get(post.id) || [],
    isLiked: likedPostIds.has(post.id),
  }));
}

export async function getCreatorPosts(
  creatorId: number,
  currentUserId?: number,
  limit = 20,
  offset = 0
) {
  if (!supabaseAdmin) return [];

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('creatorId', creatorId)
    .order('isPinned', { ascending: false })
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !posts) return [];

  // Get creator info
  const { data: creator } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl, userId')
    .eq('id', creatorId)
    .single();

  // Get all post IDs
  const postIds = posts.map(p => p.id);

  // Get media for all posts
  const { data: allMedia } = await supabaseAdmin
    .from('postMedia')
    .select('*')
    .in('postId', postIds)
    .order('orderIndex', { ascending: true });

  const mediaByPost = new Map<number, typeof allMedia>();
  (allMedia || []).forEach(m => {
    const existing = mediaByPost.get(m.postId) || [];
    existing.push(m);
    mediaByPost.set(m.postId, existing);
  });

  // Check which posts current user liked
  let likedPostIds = new Set<number>();
  if (currentUserId) {
    const { data: likes } = await supabaseAdmin
      .from('postLikes')
      .select('postId')
      .eq('userId', currentUserId)
      .in('postId', postIds);
    likedPostIds = new Set((likes || []).map(l => l.postId));
  }

  return posts.map(post => ({
    post,
    creator: creator || { id: creatorId, displayName: 'Unknown', avatarUrl: null, userId: 0 },
    media: mediaByPost.get(post.id) || [],
    isLiked: likedPostIds.has(post.id),
  }));
}

export async function deletePost(postId: number, creatorId: number): Promise<void> {
  if (!supabaseAdmin) return;

  // Delete media
  await supabaseAdmin.from('postMedia').delete().eq('postId', postId);

  // Delete likes
  await supabaseAdmin.from('postLikes').delete().eq('postId', postId);

  // Get comments
  const { data: comments } = await supabaseAdmin
    .from('postComments')
    .select('id')
    .eq('postId', postId);

  if (comments && comments.length > 0) {
    const commentIds = comments.map(c => c.id);
    // Delete comment likes
    await supabaseAdmin.from('commentLikes').delete().in('commentId', commentIds);
    // Delete comments
    await supabaseAdmin.from('postComments').delete().eq('postId', postId);
  }

  // Delete post
  await supabaseAdmin.from('posts').delete().eq('id', postId);

  // Decrement posts count
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('postsCount')
    .eq('id', creatorId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        postsCount: Math.max((profile.postsCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', creatorId);
  }
}

export async function updatePost(
  postId: number,
  data: { content?: string; visibility?: "public" | "followers" | "private"; isPinned?: boolean }
): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('posts')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) {
    console.error("[Database] Error updating post:", error);
  }
}

// ============================================
// LIKE FUNCTIONS
// ============================================

export async function likePost(postId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: insertError } = await supabaseAdmin
    .from('postLikes')
    .insert({
      postId,
      userId,
      createdAt: new Date().toISOString(),
    });

  if (insertError) {
    console.error("[Database] Error liking post:", insertError);
    return;
  }

  // Increment likes count
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('likesCount')
    .eq('id', postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from('posts')
      .update({
        likesCount: (post.likesCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', postId);
  }
}

export async function unlikePost(postId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: deleteError } = await supabaseAdmin
    .from('postLikes')
    .delete()
    .match({ postId, userId });

  if (deleteError) {
    console.error("[Database] Error unliking post:", deleteError);
    return;
  }

  // Decrement likes count
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('likesCount')
    .eq('id', postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from('posts')
      .update({
        likesCount: Math.max((post.likesCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', postId);
  }
}

export async function hasLikedPost(postId: number, userId: number): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data, error } = await supabaseAdmin
    .from('postLikes')
    .select('id')
    .match({ postId, userId })
    .single();

  return !error && !!data;
}

// ============================================
// COMMENT FUNCTIONS
// ============================================

export async function createComment(data: InsertPostComment): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('postComments')
    .insert({
      ...data,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating comment:", error);
    throw error;
  }

  // Increment comments count on post
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('commentsCount')
    .eq('id', data.postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from('posts')
      .update({
        commentsCount: (post.commentsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', data.postId);
  }

  return result.id;
}

export async function getPostComments(
  postId: number,
  currentUserId?: number,
  limit = 50,
  offset = 0
) {
  if (!supabaseAdmin) return [];

  const { data: comments, error } = await supabaseAdmin
    .from('postComments')
    .select('*')
    .eq('postId', postId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !comments) return [];

  // Get user info for comments
  const userIds = [...new Set(comments.map(c => c.userId))];
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', userIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  // Check which comments current user liked
  let likedCommentIds = new Set<number>();
  if (currentUserId) {
    const commentIds = comments.map(c => c.id);
    const { data: likes } = await supabaseAdmin
      .from('commentLikes')
      .select('commentId')
      .eq('userId', currentUserId)
      .in('commentId', commentIds);
    likedCommentIds = new Set((likes || []).map(l => l.commentId));
  }

  return comments.map(comment => ({
    comment,
    user: usersMap.get(comment.userId) || { id: comment.userId, name: null },
    isLiked: likedCommentIds.has(comment.id),
  }));
}

export async function deleteComment(commentId: number, postId: number): Promise<void> {
  if (!supabaseAdmin) return;

  // Delete comment likes
  await supabaseAdmin.from('commentLikes').delete().eq('commentId', commentId);

  // Delete comment
  await supabaseAdmin.from('postComments').delete().eq('id', commentId);

  // Decrement comments count on post
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('commentsCount')
    .eq('id', postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from('posts')
      .update({
        commentsCount: Math.max((post.commentsCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', postId);
  }
}

export async function likeComment(commentId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: insertError } = await supabaseAdmin
    .from('commentLikes')
    .insert({
      commentId,
      userId,
      createdAt: new Date().toISOString(),
    });

  if (insertError) {
    console.error("[Database] Error liking comment:", insertError);
    return;
  }

  // Increment likes count
  const { data: comment } = await supabaseAdmin
    .from('postComments')
    .select('likesCount')
    .eq('id', commentId)
    .single();

  if (comment) {
    await supabaseAdmin
      .from('postComments')
      .update({
        likesCount: (comment.likesCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', commentId);
  }
}

export async function unlikeComment(commentId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error: deleteError } = await supabaseAdmin
    .from('commentLikes')
    .delete()
    .match({ commentId, userId });

  if (deleteError) {
    console.error("[Database] Error unliking comment:", deleteError);
    return;
  }

  // Decrement likes count
  const { data: comment } = await supabaseAdmin
    .from('postComments')
    .select('likesCount')
    .eq('id', commentId)
    .single();

  if (comment) {
    await supabaseAdmin
      .from('postComments')
      .update({
        likesCount: Math.max((comment.likesCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', commentId);
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

export async function createNotification(data: InsertNotification): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

  if (error) {
    console.error("[Database] Error creating notification:", error);
  }
}

export async function getUserNotifications(
  userId: number,
  limit = 20,
  offset = 0
): Promise<Notification[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[Database] Error fetching notifications:", error);
    return [];
  }

  return (data || []) as Notification[];
}

export async function markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ isRead: true })
    .match({ id: notificationId, userId });

  if (error) {
    console.error("[Database] Error marking notification as read:", error);
  }
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ isRead: true })
    .eq('userId', userId);

  if (error) {
    console.error("[Database] Error marking all notifications as read:", error);
  }
}

export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  if (!supabaseAdmin) return 0;

  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('isRead', false);

  if (error) {
    console.error("[Database] Error counting unread notifications:", error);
    return 0;
  }

  return count || 0;
}
