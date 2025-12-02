import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Link } from "wouter";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import {
  Loader2,
  Package,
  Users,
  ArrowLeft,
  Truck,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Eye,
  Send,
  Search,
  Filter,
  Plus,
  Minus,
  ExternalLink,
  BookOpen,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { CourseDialog } from '@/components/admin/CourseDialog';
import { DigitalProductDialog } from '@/components/admin/DigitalProductDialog';
import { CommunityModeration } from '@/components/admin/CommunityModeration';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', variant: 'outline' },
  PAGO: { label: 'Pago', variant: 'default' },
  EM_SEPARACAO: { label: 'Em Separação', variant: 'secondary' },
  POSTADO: { label: 'Postado', variant: 'secondary' },
  EM_TRANSITO: { label: 'Em Trânsito', variant: 'secondary' },
  ENTREGUE: { label: 'Entregue', variant: 'default' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
  REEMBOLSADO: { label: 'Reembolsado', variant: 'destructive' },
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [trackingModal, setTrackingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingCode, setTrackingCode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [stockModal, setStockModal] = useState<{ open: boolean; productId: number | null; currentStock: number }>({ open: false, productId: null, currentStock: 0 });
  const [newStock, setNewStock] = useState(0);
  const [productModal, setProductModal] = useState<{ open: boolean; product?: any }>({ open: false, product: undefined });
  const [courseModal, setCourseModal] = useState<{ open: boolean; course?: any }>({ open: false, course: undefined });
  const [digitalProductModal, setDigitalProductModal] = useState<{ open: boolean; product?: any }>({ open: false, product: undefined });

  // Buscar dados do usuário do banco de dados via TRPC
  const { data: dbUser, isLoading: loadingUser } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  // Verifica se o usuário tem role de admin no banco de dados
  const isAdmin = isAuthenticated && dbUser?.role === 'admin';

  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = trpc.admin.orders.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admin.users.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const updateUserMutation = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso");
      refetchUsers();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleUpdateUser = (userId: number, data: { role?: "user" | "admin"; active?: boolean }) => {
    if (confirm("Tem certeza que deseja atualizar este usuário?")) {
      updateUserMutation.mutate({ userId, ...data });
    }
  };

  const deleteProductMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído com sucesso");
      refetchProducts();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCourseMutation = trpc.marketplace.courses.delete.useMutation({
    onSuccess: () => {
      toast.success("Curso excluído com sucesso");
      refetchCourses();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteDigitalProductMutation = trpc.marketplace.digitalProducts.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto digital excluído com sucesso");
      refetchDigitalProducts();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate({ productId });
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm("Tem certeza que deseja excluir este curso?")) {
      deleteCourseMutation.mutate({ courseId });
    }
  };

  const handleDeleteDigitalProduct = (productId: number) => {
    if (confirm("Tem certeza que deseja excluir este produto digital?")) {
      deleteDigitalProductMutation.mutate({ productId });
    }
  };

  const { data: courses, isLoading: loadingCourses, refetch: refetchCourses } = trpc.admin.courses.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: digitalProducts, isLoading: loadingDigitalProducts, refetch: refetchDigitalProducts } = trpc.admin.digitalProducts.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = trpc.admin.products.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: orderDetails } = trpc.admin.orders.getById.useQuery(
    { id: selectedOrder! },
    { enabled: !!selectedOrder }
  );

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });

  const addTrackingMutation = trpc.admin.shipments.addTracking.useMutation({
    onSuccess: (data) => {
      toast.success('Código de rastreamento adicionado!');
      setTrackingModal({ open: false, orderId: null });
      setTrackingCode('');
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao adicionar rastreamento');
    },
  });

  const updateStockMutation = trpc.admin.products.updateStock.useMutation({
    onSuccess: () => {
      toast.success('Estoque atualizado!');
      setStockModal({ open: false, productId: null, currentStock: 0 });
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar estoque');
    },
  });

  if (authLoading || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateStatusMutation.mutateAsync({
      orderId,
      status: newStatus as any,
    });
  };

  const handleAddTracking = async () => {
    if (!trackingModal.orderId || !trackingCode.trim()) return;
    await addTrackingMutation.mutateAsync({
      orderId: trackingModal.orderId,
      trackingCode: trackingCode.trim(),
    });
  };

  const handleUpdateStock = async () => {
    if (!stockModal.productId) return;
    await updateStockMutation.mutateAsync({
      productId: stockModal.productId,
      quantity: newStock,
    });
  };

  // Calculate stats
  const totalRevenue = orders?.reduce((sum, o) => o.status !== 'CANCELADO' && o.status !== 'REEMBOLSADO' ? sum + o.totalCents : sum, 0) || 0;
  const paidOrders = orders?.filter(o => o.status !== 'AGUARDANDO_PAGAMENTO' && o.status !== 'CANCELADO').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'AGUARDANDO_PAGAMENTO').length || 0;
  const totalStock = products?.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0) || 0;

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card border-l-4 border-l-[var(--rosa-principal)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Receita Total</p>
                    <p className="text-2xl font-bold text-[var(--rosa-principal)]">
                      R$ {(totalRevenue / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-pink-100/50 rounded-full">
                    <DollarSign className="h-6 w-6 text-[var(--rosa-principal)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-l-4 border-l-blue-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Pedidos Pagos</p>
                    <p className="text-2xl font-bold text-blue-600">{paidOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-l-4 border-l-orange-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Aguardando Pagamento</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full">
                    <Package className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-l-4 border-l-slate-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Estoque Total</p>
                    <p className="text-2xl font-bold text-slate-700">{totalStock} un.</p>
                  </div>
                  <div className="p-3 bg-slate-100/50 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="digital-products" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Produtos Digitais
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comunidade
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Gerenciar Pedidos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todos os pedidos do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => {
                            const statusInfo = statusLabels[order.status] || { label: order.status, variant: 'outline' as const };
                            return (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">ID: {order.userId}</div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  R$ {(order.totalCents / 100).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {order.paymentMethod === 'pix' ? 'PIX' :
                                      order.paymentMethod === 'credit_card' ? 'Cartão' :
                                        order.paymentMethod === 'boleto' ? 'Boleto' : '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusInfo.variant}>
                                    {statusInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Select
                                      value={order.status}
                                      onValueChange={(value) => handleStatusChange(order.id, value)}
                                    >
                                      <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando</SelectItem>
                                        <SelectItem value="PAGO">Pago</SelectItem>
                                        <SelectItem value="EM_SEPARACAO">Em Separação</SelectItem>
                                        <SelectItem value="POSTADO">Postado</SelectItem>
                                        <SelectItem value="EM_TRANSITO">Em Trânsito</SelectItem>
                                        <SelectItem value="ENTREGUE">Entregue</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => setSelectedOrder(order.id)}
                                      title="Ver detalhes"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {(order.status === 'PAGO' || order.status === 'EM_SEPARACAO') && (
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          setTrackingModal({ open: true, orderId: order.id });
                                          setTrackingCode('');
                                        }}
                                        title="Adicionar rastreamento"
                                      >
                                        <Truck className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum pedido encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Produtos</CardTitle>
                    <CardDescription>
                      Controle o estoque e informações dos produtos
                    </CardDescription>
                  </div>
                  <Button onClick={() => setProductModal({ open: true, product: undefined })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">#{product.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {product.imageUrl && (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground">{product.slug}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">
                                  R$ {(product.priceCents / 100).toFixed(2)}
                                </div>
                                {product.compareAtPriceCents && (
                                  <div className="text-sm text-muted-foreground line-through">
                                    R$ {(Number(product.compareAtPriceCents) / 100).toFixed(2)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={(product.stockQuantity ?? 0) > 10 ? 'default' : (product.stockQuantity ?? 0) > 0 ? 'secondary' : 'destructive'}>
                                  {product.stockQuantity ?? 0} un.
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.active ? 'default' : 'outline'}>
                                  {product.active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setProductModal({ open: true, product })}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setStockModal({
                                        open: true,
                                        productId: product.id,
                                        currentStock: product.stockQuantity ?? 0,
                                      });
                                      setNewStock(product.stockQuantity ?? 0);
                                    }}
                                  >
                                    Estoque
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={deleteProductMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum produto encontrado</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setProductModal({ open: true, product: undefined })}
                      >
                        Criar Primeiro Produto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Usuários Cadastrados</CardTitle>
                  <CardDescription>
                    Visualize todos os usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">#{u.id}</TableCell>
                              <TableCell>{u.name || '-'}</TableCell>
                              <TableCell>{u.email || '-'}</TableCell>
                              <TableCell>{u.phone || '-'}</TableCell>
                              <TableCell>{u.cpf || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                  {u.role === 'admin' ? 'Admin' : 'Usuário'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={u.active ? 'outline' : 'destructive'}>
                                  {u.active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}
                                    >
                                      Tornar {u.role === 'admin' ? 'Usuário' : 'Admin'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className={u.active ? "text-destructive" : "text-green-600"}
                                      onClick={() => handleUpdateUser(u.id, { active: !u.active })}
                                    >
                                      {u.active ? 'Desativar Usuário' : 'Ativar Usuário'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Cursos</CardTitle>
                    <CardDescription>
                      Crie e gerencie seus cursos e conteúdos
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCourseModal({ open: true, course: undefined })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Curso
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingCourses ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : courses && courses.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.map((item) => {
                            const course = item.course;
                            return (
                              <TableRow key={course.id}>
                                <TableCell className="font-medium">#{course.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {course.thumbnailUrl && (
                                      <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{course.title}</div>
                                      <div className="text-sm text-muted-foreground">{course.slug}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">
                                    R$ {(course.priceCents / 100).toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                    {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setCourseModal({ open: true, course })}
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      asChild
                                    >
                                      <Link to={`/admin/courses/${course.id}`}>
                                        Gerenciar Conteúdo
                                      </Link>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteCourse(course.id)}
                                      disabled={deleteCourseMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum curso encontrado</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setCourseModal({ open: true, course: undefined })}
                      >
                        Criar Primeiro Curso
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Digital Products Tab */}
            <TabsContent value="digital-products">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Produtos Digitais</CardTitle>
                    <CardDescription>
                      eBooks, arquivos e outros conteúdos digitais
                    </CardDescription>
                  </div>
                  <Button onClick={() => setDigitalProductModal({ open: true, product: undefined })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto Digital
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingDigitalProducts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : digitalProducts && digitalProducts.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {digitalProducts.map((item) => {
                            const product = item.product;
                            return (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">#{product.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {product.thumbnailUrl && (
                                      <img
                                        src={product.thumbnailUrl}
                                        alt={product.title}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{product.title}</div>
                                      <div className="text-sm text-muted-foreground">{product.slug}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">
                                    R$ {(product.priceCents / 100).toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                                    {product.status === 'published' ? 'Publicado' : product.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setDigitalProductModal({ open: true, product })}
                                    >
                                      Editar
                                    </Button>
                                    {product.fileUrl && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                      >
                                        <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteDigitalProduct(product.id)}
                                      disabled={deleteDigitalProductMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum produto digital encontrado</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setDigitalProductModal({ open: true, product: undefined })}
                      >
                        Criar Primeiro Produto Digital
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community">
              <CommunityModeration />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Tracking Modal */}
      <Dialog open={trackingModal.open} onOpenChange={(open) => setTrackingModal({ open, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Rastreamento</DialogTitle>
            <DialogDescription>
              Insira o código de rastreamento para o pedido #{trackingModal.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tracking">Código de Rastreamento</Label>
            <Input
              id="tracking"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Ex: BR123456789BR"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              O cliente receberá um e-mail com o código de rastreamento.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingModal({ open: false, orderId: null })}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddTracking}
              disabled={!trackingCode.trim() || addTrackingMutation.isPending}
            >
              {addTrackingMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Modal */}
      <Dialog open={stockModal.open} onOpenChange={(open) => setStockModal({ open, productId: null, currentStock: 0 })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
            <DialogDescription>
              Estoque atual: {stockModal.currentStock} unidades
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="stock">Nova Quantidade</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewStock(Math.max(0, newStock - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="stock"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center w-24"
                min={0}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewStock(newStock + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModal({ open: false, productId: null, currentStock: 0 })}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending}
            >
              {updateStockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder}</DialogTitle>
          </DialogHeader>
          {orderDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{orderDetails.user?.name || 'N/A'}</p>
                  <p className="text-sm">{orderDetails.user?.email}</p>
                  {orderDetails.user?.phone && <p className="text-sm">{orderDetails.user?.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusLabels[orderDetails.status]?.variant || 'outline'}>
                    {statusLabels[orderDetails.status]?.label || orderDetails.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Endereço de Entrega</p>
                {(() => {
                  const addr = orderDetails.shippingAddress as Record<string, string> | null;
                  if (!addr) return null;
                  return (
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      {addr.street}, {addr.number}
                      {addr.complement && ` - ${addr.complement}`}<br />
                      {addr.district}<br />
                      {addr.city} - {addr.state}<br />
                      CEP: {addr.cep}
                    </div>
                  );
                })()}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Itens do Pedido</p>
                <div className="border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            R$ {(item.totalPriceCents / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <div>
                  <span className="text-muted-foreground">Subtotal:</span> R$ {(orderDetails.subtotalCents / 100).toFixed(2)}<br />
                  <span className="text-muted-foreground">Frete:</span> R$ {(orderDetails.shippingPriceCents / 100).toFixed(2)}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    Total: R$ {(orderDetails.totalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {orderDetails.customerNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações do Cliente</p>
                  <p className="text-sm bg-yellow-50 p-2 rounded">{orderDetails.customerNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ProductDialog
        open={productModal.open}
        onOpenChange={(open) => setProductModal(prev => ({ ...prev, open }))}
        product={productModal.product}
        onSuccess={() => refetchProducts()}
      />

      <CourseDialog
        open={courseModal.open}
        onOpenChange={(open) => setCourseModal(prev => ({ ...prev, open }))}
        course={courseModal.course}
        onSuccess={() => refetchCourses()}
      />

      <DigitalProductDialog
        open={digitalProductModal.open}
        onOpenChange={(open) => setDigitalProductModal(prev => ({ ...prev, open }))}
        product={digitalProductModal.product}
        onSuccess={() => refetchDigitalProducts()}
      />
    </div >
  );
}
