import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { Loader2, Package, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = trpc.admin.orders.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.user_metadata?.role === 'admin',
  });
  
  const { data: users, isLoading: loadingUsers } = trpc.admin.users.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.user_metadata?.role === 'admin',
  });
  
  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.user_metadata?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">
                <Package className="mr-2 h-4 w-4" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Usuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Pedidos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todos os pedidos do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => {
                            const statusInfo = statusLabels[order.status] || { label: order.status, variant: 'outline' };
                            return (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>ID: {order.userId}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  R$ {(order.totalCents / 100).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusInfo.variant}>
                                    {statusInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={order.status}
                                    onValueChange={(value) => handleStatusChange(order.id, value)}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                                      <SelectItem value="PAGO">Pago</SelectItem>
                                      <SelectItem value="EM_SEPARACAO">Em Separação</SelectItem>
                                      <SelectItem value="POSTADO">Postado</SelectItem>
                                      <SelectItem value="EM_TRANSITO">Em Trânsito</SelectItem>
                                      <SelectItem value="ENTREGUE">Entregue</SelectItem>
                                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                      <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                                    </SelectContent>
                                  </Select>
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

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Cadastrados</CardTitle>
                  <CardDescription>
                    Visualize todos os usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
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
                            <TableHead>Função</TableHead>
                            <TableHead>Cadastro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">#{user.id}</TableCell>
                              <TableCell>{user.name || '-'}</TableCell>
                              <TableCell>{user.email || '-'}</TableCell>
                              <TableCell>{user.phone || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
