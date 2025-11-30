import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  BookOpen,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function CreateCourseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const createMutation = trpc.marketplace.courses.create.useMutation();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Digite um titulo para o curso");
      return;
    }

    const priceCents = Math.round(parseFloat(price || "0") * 100);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priceCents,
      });

      toast.success("Curso criado! Agora adicione os modulos e aulas.");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPrice("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar curso");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Curso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
          <DialogDescription>
            Preencha as informacoes basicas. Voce podera editar depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo do Curso</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Empreendedorismo Feminino"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu curso..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preco (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateDigitalProductDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("pdf");

  const createMutation = trpc.marketplace.digitalProducts.create.useMutation();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Digite um titulo");
      return;
    }
    if (!fileUrl.trim()) {
      toast.error("Adicione a URL do arquivo");
      return;
    }

    const priceCents = Math.round(parseFloat(price || "0") * 100);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priceCents,
        fileUrl,
        fileType,
      });

      toast.success("Produto criado!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setFileUrl("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar produto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo E-book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo E-book</DialogTitle>
          <DialogDescription>
            Preencha as informacoes do seu produto digital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Guia do Empreendedorismo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu e-book..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preco (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileType">Tipo de Arquivo</Label>
              <Input
                id="fileType"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="pdf, epub, etc"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">URL do Arquivo</Label>
            <Input
              id="fileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseCard({
  course,
  onDelete,
}: {
  course: {
    id: number;
    title: string;
    slug: string;
    status: string;
    priceCents: number;
    studentsCount: number;
    lessonsCount: number;
    thumbnailUrl: string | null;
  };
  onDelete: () => void;
}) {
  const deleteMutation = trpc.marketplace.courses.delete.useMutation();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
      await deleteMutation.mutateAsync({ courseId: course.id });
      toast.success("Curso excluido");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-700",
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-32 md:w-48 aspect-video bg-muted shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold line-clamp-1">{course.title}</h3>
              <Badge
                variant="secondary"
                className={statusColors[course.status as keyof typeof statusColors]}
              >
                {course.status === "draft"
                  ? "Rascunho"
                  : course.status === "published"
                    ? "Publicado"
                    : "Arquivado"}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/criadora/curso/${course.id}`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </Link>
                <Link href={`/curso/${course.slug}`}>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              R$ {(course.priceCents / 100).toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.studentsCount} alunas
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.lessonsCount} aulas
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProductCard({
  product,
  onDelete,
}: {
  product: {
    id: number;
    title: string;
    slug: string;
    status: string;
    priceCents: number;
    salesCount: number;
    fileType: string;
    thumbnailUrl: string | null;
  };
  onDelete: () => void;
}) {
  const statusColors = {
    draft: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-700",
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-24 aspect-[3/4] bg-muted shrink-0">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold line-clamp-1">{product.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="uppercase text-xs">
                  {product.fileType}
                </Badge>
                <Badge
                  variant="secondary"
                  className={statusColors[product.status as keyof typeof statusColors]}
                >
                  {product.status === "draft"
                    ? "Rascunho"
                    : product.status === "published"
                      ? "Publicado"
                      : "Arquivado"}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <Link href={`/ebook/${product.slug}`}>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              R$ {(product.priceCents / 100).toFixed(2)}
            </span>
            <span>{product.salesCount} vendas</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MeusProdutos() {
  const { user } = useAuth();

  const { data: creatorProfile } = trpc.social.creator.myProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const {
    data: courses,
    isLoading: loadingCourses,
    refetch: refetchCourses,
  } = trpc.marketplace.courses.myCourses.useQuery(undefined, {
    enabled: !!creatorProfile,
  });

  const {
    data: products,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = trpc.marketplace.digitalProducts.myProducts.useQuery(undefined, {
    enabled: !!creatorProfile,
  });

  if (!creatorProfile || creatorProfile.status !== "approved") {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
            <p className="text-muted-foreground mb-4">
              Voce precisa ser uma criadora aprovada para gerenciar produtos
            </p>
            <Link href="/comunidade/tornar-criadora">
              <Button>Tornar-se Criadora</Button>
            </Link>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus cursos e e-books</p>
        </div>

        <Tabs defaultValue="courses">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="gap-2">
                <FileText className="h-4 w-4" />
                E-books
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <CreateCourseDialog onSuccess={refetchCourses} />
            </div>
          </div>

          <TabsContent value="courses">
            {loadingCourses ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={refetchCourses}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Nenhum curso criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro curso e comece a vender
                </p>
                <CreateCourseDialog onSuccess={refetchCourses} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ebooks">
            <div className="flex justify-end mb-4">
              <CreateDigitalProductDialog onSuccess={refetchProducts} />
            </div>

            {loadingProducts ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={refetchProducts}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Nenhum e-book criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro e-book e comece a vender
                </p>
                <CreateDigitalProductDialog onSuccess={refetchProducts} />
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CommunityLayout>
  );
}
