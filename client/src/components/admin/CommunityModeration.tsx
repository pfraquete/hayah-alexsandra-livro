import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CommunityModeration() {
    const [activeTab, setActiveTab] = useState("posts");

    const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = trpc.admin.social.listPosts.useQuery();
    const { data: comments, isLoading: loadingComments, refetch: refetchComments } = trpc.admin.social.listComments.useQuery();

    const deletePostMutation = trpc.admin.social.deletePost.useMutation({
        onSuccess: () => {
            toast.success("Post excluído com sucesso");
            refetchPosts();
        },
        onError: (error) => toast.error(error.message),
    });

    const deleteCommentMutation = trpc.admin.social.deleteComment.useMutation({
        onSuccess: () => {
            toast.success("Comentário excluído com sucesso");
            refetchComments();
        },
        onError: (error) => toast.error(error.message),
    });

    const handleDeletePost = (postId: number) => {
        if (confirm("Tem certeza que deseja excluir este post?")) {
            deletePostMutation.mutate({ postId });
        }
    };

    const handleDeleteComment = (commentId: number) => {
        if (confirm("Tem certeza que deseja excluir este comentário?")) {
            deleteCommentMutation.mutate({ commentId });
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Moderação da Comunidade</CardTitle>
                <CardDescription>Gerencie posts e comentários da comunidade</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="posts" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Posts
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comentários
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts">
                        {loadingPosts ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : posts && posts.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Autor</TableHead>
                                            <TableHead>Conteúdo</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {posts.map((post) => (
                                            <TableRow key={post.id}>
                                                <TableCell>#{post.id}</TableCell>
                                                <TableCell>{post.creatorName || "Desconhecido"}</TableCell>
                                                <TableCell className="max-w-md truncate" title={post.content || ""}>
                                                    {post.content || "(Sem texto)"}
                                                </TableCell>
                                                <TableCell>
                                                    {post.createdAt && format(new Date(post.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        disabled={deletePostMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum post encontrado.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="comments">
                        {loadingComments ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : comments && comments.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Autor</TableHead>
                                            <TableHead>Conteúdo</TableHead>
                                            <TableHead>Post ID</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comments.map((comment) => (
                                            <TableRow key={comment.id}>
                                                <TableCell>#{comment.id}</TableCell>
                                                <TableCell>{comment.userName || "Desconhecido"}</TableCell>
                                                <TableCell className="max-w-md truncate" title={comment.content}>
                                                    {comment.content}
                                                </TableCell>
                                                <TableCell>#{comment.postId}</TableCell>
                                                <TableCell>
                                                    {comment.createdAt && format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        disabled={deleteCommentMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum comentário encontrado.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
