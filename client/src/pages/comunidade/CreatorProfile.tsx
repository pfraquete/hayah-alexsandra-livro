import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Instagram,
  Youtube,
  Globe,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CreatorProfile() {
  const { user } = useAuth();
  const [, params] = useRoute("/comunidade/criadora/:id");
  const creatorId = params?.id ? parseInt(params.id) : 0;

  const { data: creator, isLoading: loadingCreator } = trpc.social.creator.getById.useQuery(
    { id: creatorId },
    { enabled: creatorId > 0 }
  );

  const { data: isFollowing, refetch: refetchFollowing } = trpc.social.followers.isFollowing.useQuery(
    { userId: creator?.profile?.userId || 0 },
    { enabled: !!user && !!creator?.profile?.userId }
  );

  const { data: posts, isLoading: loadingPosts } = trpc.social.posts.byCreator.useQuery(
    { creatorId, limit: 20, offset: 0 },
    { enabled: creatorId > 0 }
  );

  const { data: courses } = trpc.marketplace.courses.list.useQuery({ limit: 10 });

  const followMutation = trpc.social.followers.follow.useMutation();
  const unfollowMutation = trpc.social.followers.unfollow.useMutation();

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Voce precisa estar logada para seguir");
      return;
    }

    if (!creator?.profile) return;

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync({ userId: creator.profile.userId });
        toast.success("Voce deixou de seguir");
      } else {
        await followMutation.mutateAsync({ userId: creator.profile.userId });
        toast.success("Voce agora esta seguindo!");
      }
      refetchFollowing();
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar");
    }
  };

  if (loadingCreator) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-48 w-full" />
          <div className="px-4 -mt-16 relative">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </CommunityLayout>
    );
  }

  if (!creator) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Criadora nao encontrada</h2>
            <Link href="/comunidade">
              <Button>Voltar ao Feed</Button>
            </Link>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  const { profile } = creator;

  // Filter creator's courses
  const creatorCourses = courses?.filter((c) => c.creator.id === creatorId) || [];

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative"
          style={
            profile?.coverUrl
              ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: "cover" }
              : undefined
          }
        />

        {/* Profile Header */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile?.avatarUrl || undefined} />
              <AvatarFallback className="text-4xl">
                {profile?.displayName?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile?.displayName}</h1>
                  <p className="text-muted-foreground">{creator.user?.name}</p>
                </div>

                {user && profile?.userId !== user.id && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Seguindo
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="font-bold">{profile?.postsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile?.followersCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Seguidoras</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile?.coursesCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Cursos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="mt-4 text-sm whitespace-pre-wrap">{profile.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex gap-3 mt-4">
            {profile?.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
              </a>
            )}
            {profile?.youtube && (
              <a
                href={`https://youtube.com/${profile.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </Button>
              </a>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Site
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">
              Posts
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex-1">
              Cursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="space-y-4">
              {loadingPosts ? (
                <Skeleton className="h-48 w-full" />
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.post.id}>
                    <CardContent className="pt-4">
                      {post.post.content && (
                        <p className="text-sm whitespace-pre-wrap mb-3">{post.post.content}</p>
                      )}
                      {post.media.length > 0 && (
                        <div className="grid gap-2 grid-cols-2">
                          {post.media.slice(0, 4).map((media) => (
                            <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                              <img
                                src={media.mediaUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Heart className="h-4 w-4" />
                          {post.post.likesCount}
                        </Button>
                        <Link href={`/comunidade/post/${post.post.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {post.post.commentsCount}
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum post ainda</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {creatorCourses.length > 0 ? (
                creatorCourses.map((item) => (
                  <Link key={item.course.id} href={`/curso/${item.course.slug}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                      {item.course.thumbnailUrl && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={item.course.thumbnailUrl}
                            alt={item.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="pt-4">
                        <h3 className="font-semibold line-clamp-2">{item.course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.course.shortDescription}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <p className="font-bold text-primary">
                            R$ {(item.course.priceCents / 100).toFixed(2)}
                          </p>
                          <Badge variant="secondary">
                            {item.course.studentsCount} alunas
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="p-8 text-center col-span-2">
                  <p className="text-muted-foreground">Nenhum curso disponivel</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CommunityLayout>
  );
}
