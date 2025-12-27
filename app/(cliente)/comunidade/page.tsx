import { PostCard, PostProps } from "@/components/community/PostCard";
import { createClient } from "@/lib/supabase/server";

async function getCommunityPosts(): Promise<PostProps[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("community_posts")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      ),
      community_likes (user_id)
    `
    )
    .order("created_at", { ascending: false });

  const currentUserId = user?.id;

  return (
    data?.map((post) => ({
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      is_liked: Array.isArray(post.community_likes)
        ? post.community_likes.some((like) => like.user_id === currentUserId)
        : false,
      likes_count: post.likes_count ?? 0,
      comments_count: post.comments_count ?? 0,
    })) || []
  );
}

export default async function CommunityPage() {
  const posts = await getCommunityPosts();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
