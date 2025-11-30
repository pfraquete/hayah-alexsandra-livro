import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Globe, Users, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Visibility = "public" | "followers" | "private";
type MediaItem = {
  file: File;
  preview: string;
  type: "image" | "video";
};

export default function NovoPost() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: creatorProfile } = trpc.social.creator.myProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const createPostMutation = trpc.social.posts.create.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;

    const newItems: MediaItem[] = [];
    const maxFiles = 10 - mediaItems.length;

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newItems.push({ file, preview, type });
    }

    setMediaItems([...mediaItems, ...newItems]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    const item = mediaItems[index];
    URL.revokeObjectURL(item.preview);
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      toast.error("Adicione algum conteudo ao post");
      return;
    }

    try {
      setIsUploading(true);

      // For now, we'll just use placeholder URLs
      // In production, you would upload to S3 first
      const mediaUrls = mediaItems.map((item, index) => ({
        mediaUrl: item.preview, // Replace with actual upload URL
        mediaType: item.type,
        thumbnailUrl: item.type === "video" ? item.preview : undefined,
      }));

      await createPostMutation.mutateAsync({
        content: content.trim() || undefined,
        visibility,
        media: mediaUrls,
      });

      toast.success("Post publicado!");
      navigate("/comunidade");
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar post");
    } finally {
      setIsUploading(false);
    }
  };

  if (!creatorProfile || creatorProfile.status !== "approved") {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
            <p className="text-muted-foreground">
              Voce precisa ser uma criadora aprovada para publicar posts
            </p>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  const visibilityOptions = [
    { value: "public", label: "Publico", icon: Globe, description: "Todos podem ver" },
    { value: "followers", label: "Seguidoras", icon: Users, description: "Apenas quem te segue" },
    { value: "private", label: "Privado", icon: Lock, description: "Apenas voce" },
  ];

  return (
    <CommunityLayout>
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Criar Post</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={creatorProfile.avatarUrl || undefined} />
                <AvatarFallback>{creatorProfile.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{creatorProfile.displayName}</p>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
                  <SelectTrigger className="h-7 w-auto gap-2 border-0 bg-muted px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            <Textarea
              placeholder="O que voce quer compartilhar hoje?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 text-base resize-none border-0 focus-visible:ring-0 p-0"
            />

            {/* Media Preview */}
            {mediaItems.length > 0 && (
              <div
                className={`grid gap-2 ${
                  mediaItems.length === 1
                    ? "grid-cols-1"
                    : mediaItems.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={item.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Media Buttons */}
            <div className="flex items-center gap-2 border-t pt-4">
              <Label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "image")}
                  disabled={mediaItems.length >= 10}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  asChild
                  disabled={mediaItems.length >= 10}
                >
                  <span>
                    <Image className="h-4 w-4 text-green-500" />
                    Foto
                  </span>
                </Button>
              </Label>

              <Label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "video")}
                  disabled={mediaItems.length >= 10}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  asChild
                  disabled={mediaItems.length >= 10}
                >
                  <span>
                    <Video className="h-4 w-4 text-blue-500" />
                    Video
                  </span>
                </Button>
              </Label>

              {mediaItems.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {mediaItems.length}/10 arquivos
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t">
            <div className="flex justify-end gap-3 w-full pt-4">
              <Button variant="ghost" onClick={() => navigate("/comunidade")}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || createPostMutation.isPending}
              >
                {(isUploading || createPostMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Publicar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </CommunityLayout>
  );
}
