"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toggleLikeAction, addCommentAction } from "@/app/(cliente)/comunidade/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export interface PostProps {
    id: string;
    content: string;
    image_url?: string | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    };
    is_liked: boolean;
}

export function PostCard({ post }: { post: PostProps }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [liked, setLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const timeAgo = formatDistanceToNow(new Date(post.created_at), {
        addSuffix: true,
        locale: ptBR
    });

    const initials = post.profiles.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "AN";

    async function handleLike() {
        const previousLiked = liked;
        const previousCount = likesCount;

        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);

        const result = await toggleLikeAction(post.id, previousLiked);

        if (result?.error) {
            setLiked(previousLiked);
            setLikesCount(previousCount);
            toast({
                title: "Erro",
                description: "Não foi possível curtir o post.",
                variant: "destructive"
            });
        }
    }

    async function handleCommentSubmit() {
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        const result = await addCommentAction(post.id, commentText);
        setIsSubmittingComment(false);

        if (result?.success) {
            setCommentText("");
            toast({ title: "Comentário enviado!" });
        } else {
            toast({
                title: "Erro",
                description: "Não foi possível enviar o comentário.",
                variant: "destructive"
            });
        }
    }

    return (
        <Card className="mb-6 border-pink-light/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
                <Avatar className="h-10 w-10 border border-pink-light/50">
                    <AvatarImage src={post.profiles.avatar_url || ""} />
                    <AvatarFallback className="bg-pink-light/20 text-pink-dark">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-800">
                        {post.profiles.full_name || "Membro da Comunidade"}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{timeAgo}</span>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>
                
                {post.image_url && (
                    <div className="rounded-lg overflow-hidden border border-gray-100 max-h-[400px]">
                        <img 
                            src={post.image_url} 
                            alt="Imagem do post" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col p-0">
                <div className="flex items-center justify-between w-full px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={cn(
                                "gap-2 hover:bg-pink-50 transition-colors",
                                liked ? "text-pink-600" : "text-gray-500"
                            )}
                        >
                            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className="gap-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">{post.comments_count}</span>
                        </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full p-4 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="flex gap-2 items-start">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-pink-200 text-pink-800 text-xs">
                                    EU
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 relative">
                                <Textarea 
                                    placeholder="Escreva um comentário carinhoso..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-[80px] pr-10 border-pink-light/30 focus-visible:ring-pink-medium bg-white"
                                />
                                <Button 
                                    size="icon" 
                                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-pink-medium hover:bg-pink-dark"
                                    onClick={handleCommentSubmit}
                                    disabled={isSubmittingComment || !commentText.trim()}
                                >
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </div>
                        </div>
                        
                        <p className="text-xs text-center text-gray-400 mt-4">
                            Mostrando comentários recentes...
                        </p>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
