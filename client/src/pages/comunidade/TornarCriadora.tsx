import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, BookOpen, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function TornarCriadora() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  const { data: existingProfile, isLoading: loadingProfile } =
    trpc.social.creator.myProfile.useQuery(undefined, {
      enabled: !!user,
    });

  const createMutation = trpc.social.creator.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Digite um nome de exibicao");
      return;
    }

    try {
      await createMutation.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        website: website.trim() || undefined,
      });

      toast.success("Perfil de criadora criado com sucesso!");
      navigate("/comunidade");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar perfil");
    }
  };

  if (!user) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Faca login para continuar</h2>
            <p className="text-muted-foreground mb-4">
              Voce precisa estar logada para se tornar uma criadora
            </p>
            <Button onClick={() => navigate("/login")}>Entrar</Button>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  if (loadingProfile) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  if (existingProfile) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Voce ja e uma criadora!</h2>
            <p className="text-muted-foreground mb-4">
              Seu perfil de criadora ja existe. Comece a criar conteudo!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/criadora/novo-post")}>
                Criar Post
              </Button>
              <Button variant="outline" onClick={() => navigate("/criadora/cursos")}>
                Gerenciar Produtos
              </Button>
            </div>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Benefits */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Torne-se uma Criadora</h1>
          <p className="text-muted-foreground mb-6">
            Compartilhe seu conhecimento, construa sua comunidade e monetize seu conteudo
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Construa sua Comunidade</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Conecte-se com outras mulheres e construa sua audiencia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Crie Cursos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Compartilhe seu conhecimento atraves de cursos online
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Monetize</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ganhe dinheiro vendendo seus cursos e produtos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Criar Perfil de Criadora</CardTitle>
              <CardDescription>
                Preencha as informacoes do seu perfil publico
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de Exibicao *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Como voce quer ser conhecida"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre voce e o que voce faz..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seuusuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="@seucanal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://seusite.com"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Criar Perfil de Criadora
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </CommunityLayout>
  );
}
