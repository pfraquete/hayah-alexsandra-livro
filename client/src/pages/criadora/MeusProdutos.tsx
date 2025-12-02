import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Download,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  Upload,
  Loader2,
} from "lucide-react";

type ProductType = "physical" | "digital";

interface ProductForm {
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number;
  productType: ProductType;
  imageUrl: string;
  
  // Physical product fields
  stockQuantity?: number;
  weightGrams?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  
  // Digital product fields
  fileUrl?: string;
  fileType?: string;
}

export default function MeusLivros() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    priceCents: 0,
    compareAtPriceCents: 0,
    productType: "physical",
    imageUrl: "",
  });

  // Queries
  const { data: products, isLoading, refetch } = trpc.products.myProducts.useQuery();

  // Mutations
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      setEditingProduct(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir produto: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.products.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      priceCents: 0,
      compareAtPriceCents: 0,
      productType: "physical",
      imageUrl: "",
    });
  };

  const handleCreate = () => {
    if (!productForm.name || !productForm.priceCents) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate(productForm);
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    updateMutation.mutate({
      productId: editingProduct.id,
      ...productForm,
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      priceCents: product.priceCents,
      compareAtPriceCents: product.compareAtPriceCents || 0,
      productType: product.productType,
      imageUrl: product.imageUrl || "",
      stockQuantity: product.stockQuantity,
      weightGrams: product.weightGrams,
      widthCm: product.widthCm ? parseFloat(product.widthCm) : undefined,
      heightCm: product.heightCm ? parseFloat(product.heightCm) : undefined,
      depthCm: product.depthCm ? parseFloat(product.depthCm) : undefined,
      fileUrl: product.fileUrl,
      fileType: product.fileType,
    });
  };

  const handleDelete = (productId: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate({ productId });
    }
  };

  const physicalProducts = products?.filter((p: any) => p.productType === "physical") || [];
  const digitalProducts = products?.filter((p: any) => p.productType === "digital") || [];

  return (
    <CommunityLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Meus Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seus livros físicos e produtos digitais
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Stats */}
        {products && products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {physicalProducts.length} físicos, {digitalProducts.length} digitais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.filter((p: any) => p.active).length}
                </div>
                <p className="text-xs text-muted-foreground">Visíveis na loja</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${" "}
                  {(
                    products.reduce((sum: number, p: any) => sum + p.priceCents, 0) /
                    products.length /
                    100
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Preço médio dos produtos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos ({products?.length || 0})</TabsTrigger>
            <TabsTrigger value="physical">
              Físicos ({physicalProducts.length})
            </TabsTrigger>
            <TabsTrigger value="digital">
              Digitais ({digitalProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ProductsList
              products={products || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={(id) => toggleActiveMutation.mutate({ productId: id })}
            />
          </TabsContent>

          <TabsContent value="physical" className="mt-6">
            <ProductsList
              products={physicalProducts}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={(id) => toggleActiveMutation.mutate({ productId: id })}
            />
          </TabsContent>

          <TabsContent value="digital" className="mt-6">
            <ProductsList
              products={digitalProducts}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={(id) => toggleActiveMutation.mutate({ productId: id })}
            />
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateDialogOpen || !!editingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingProduct(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do produto
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Product Type */}
              <div>
                <Label>Tipo de Produto *</Label>
                <Select
                  value={productForm.productType}
                  onValueChange={(value: ProductType) =>
                    setProductForm({ ...productForm, productType: value })
                  }
                  disabled={!!editingProduct}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">
                      📦 Físico (com frete)
                    </SelectItem>
                    <SelectItem value="digital">
                      💾 Digital (download)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editingProduct && (
                  <p className="text-xs text-muted-foreground mt-1">
                    O tipo não pode ser alterado após a criação
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <Label>Nome do Produto *</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="Ex: Mulher Sábia, Vida Próspera"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Descreva seu produto..."
                  rows={4}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.priceCents / 100}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        priceCents: Math.round(parseFloat(e.target.value) * 100),
                      })
                    }
                    placeholder="79.90"
                  />
                </div>
                <div>
                  <Label>Preço "De" (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPriceCents / 100}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        compareAtPriceCents: Math.round(
                          parseFloat(e.target.value) * 100
                        ),
                      })
                    }
                    placeholder="99.90"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm({ ...productForm, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              {/* Physical Product Fields */}
              {productForm.productType === "physical" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Informações de Envio</h3>

                  <div>
                    <Label>Estoque Disponível</Label>
                    <Input
                      type="number"
                      value={productForm.stockQuantity || 0}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stockQuantity: parseInt(e.target.value),
                        })
                      }
                      placeholder="100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Peso (gramas)</Label>
                      <Input
                        type="number"
                        value={productForm.weightGrams || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            weightGrams: parseInt(e.target.value),
                          })
                        }
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <Label>Largura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={productForm.widthCm || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            widthCm: parseFloat(e.target.value),
                          })
                        }
                        placeholder="14"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Altura (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={productForm.heightCm || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            heightCm: parseFloat(e.target.value),
                          })
                        }
                        placeholder="21"
                      />
                    </div>
                    <div>
                      <Label>Profundidade (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={productForm.depthCm || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            depthCm: parseFloat(e.target.value),
                          })
                        }
                        placeholder="2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Product Fields */}
              {productForm.productType === "digital" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Arquivo Digital</h3>

                  <div>
                    <Label>URL do Arquivo</Label>
                    <Input
                      value={productForm.fileUrl || ""}
                      onChange={(e) =>
                        setProductForm({ ...productForm, fileUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload o arquivo no Supabase Storage e cole a URL aqui
                    </p>
                  </div>

                  <div>
                    <Label>Tipo de Arquivo</Label>
                    <Select
                      value={productForm.fileType || ""}
                      onValueChange={(value) =>
                        setProductForm({ ...productForm, fileType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="epub">ePub</SelectItem>
                        <SelectItem value="mobi">Mobi</SelectItem>
                        <SelectItem value="zip">ZIP</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingProduct ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingProduct ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CommunityLayout>
  );
}

function ProductsList({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  products: any[];
  isLoading: boolean;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">
          Crie seu primeiro produto para começar a vender
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {product.productType === "physical" ? (
                    <Badge variant="outline">📦 Físico</Badge>
                  ) : (
                    <Badge variant="outline">💾 Digital</Badge>
                  )}
                  {product.active ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço:</span>
                <span className="font-semibold">
                  R$ {(product.priceCents / 100).toFixed(2)}
                </span>
              </div>
              {product.productType === "physical" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estoque:</span>
                  <span>{product.stockQuantity || 0} unidades</span>
                </div>
              )}
              {product.productType === "digital" && product.fileType && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Formato:</span>
                  <span className="uppercase">{product.fileType}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(product.id)}
            >
              {product.active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
