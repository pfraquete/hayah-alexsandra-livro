import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type FeedType = "all" | "following";

interface PostCardProps {
  post: {
    post: {
      id: number;
      content: string | null;
      likesCount: number;
      commentsCount: number;
      createdAt: Date;
    };
    creator: {
      id: number;
      displayName: string;
      avatarUrl: string | null;
      userId: number;
    };
    media: Array<{
      id: number;
      mediaUrl: string;
      mediaType: string;
      thumbnailUrl: string | null;
    }>;
    isLiked: boolean;
  };
  onLikeToggle: (postId: number, isLiked: boolean) => void;
}

function PostCard({ post, onLikeToggle }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.post.likesCount);

  const likeMutation = trpc.social.likes.like.useMutation();
  const unlikeMutation = trpc.social.likes.unlike.useMutation();

  const handleLike = async () => {
    if (!user) {
      toast.error("Voce precisa estar logada para curtir");
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await unlikeMutation.mutateAsync({ postId: post.post.id });
      } else {
        await likeMutation.mutateAsync({ postId: post.post.id });
      }
      onLikeToggle(post.post.id, !wasLiked);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error("Erro ao processar curtida");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link href={`/comunidade/criadora/${post.creator.id}`}>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
              <Avatar>
                <AvatarImage src={post.creator.avatarUrl || undefined} />
                <AvatarFallback>{post.creator.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.creator.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.post.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Denunciar</DropdownMenuItem>
              <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {post.post.content && (
          <p className="text-sm whitespace-pre-wrap mb-3">{post.post.content}</p>
        )}

        {/* Media Grid */}
        {post.media.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.media.length === 1
                ? "grid-cols-1"
                : post.media.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {post.media.slice(0, 4).map((media, index) => (
              <div
                key={media.id}
                className={`relative aspect-square rounded-lg overflow-hidden bg-muted ${
                  post.media.length === 3 && index === 0 ? "row-span-2" : ""
                }`}
              >
                {media.mediaType === "video" ? (
                  <video
                    src={media.mediaUrl}
                    poster={media.thumbnailUrl || undefined}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={media.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {index === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{post.media.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 border-t">
        <div className="flex items-center gap-4 w-full pt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Link href={`/comunidade/post/${post.post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {post.post.commentsCount}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 ml-auto">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<FeedType>("all");

  const { data: posts, isLoading, refetch } = trpc.social.posts.feed.useQuery(
    { type: feedType, limit: 20, offset: 0 },
    { enabled: !!user }
  );

  const { data: creatorProfile } = trpc.social.creator.myProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const handleLikeToggle = () => {
    // Optionally refetch or update cache
  };

  if (!user) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Bem-vinda a Comunidade</h2>
            <p className="text-muted-foreground mb-4">
              Faca login para ver o feed e interagir com outras mulheres
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="outline">Cadastrar</Button>
              </Link>
            </div>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Create Post Card */}
        {creatorProfile && creatorProfile.status === "approved" && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <Link href="/criadora/novo-post">
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar>
                    <AvatarImage src={creatorProfile.avatarUrl || undefined} />
                    <AvatarFallback>{creatorProfile.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground text-sm">
                    O que voce quer compartilhar hoje?
                  </div>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Feed Tabs */}
        <Tabs value={feedType} onValueChange={(v) => setFeedType(v as FeedType)} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Para Voce
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Seguindo
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.post.id} post={post} onLikeToggle={handleLikeToggle} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {feedType === "following"
                  ? "Siga algumas criadoras para ver posts aqui"
                  : "Nenhum post encontrado"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </CommunityLayout>
  );
}
