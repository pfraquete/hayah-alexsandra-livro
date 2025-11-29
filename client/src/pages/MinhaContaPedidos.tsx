import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { Loader2, Package, ArrowLeft } from 'lucide-react';

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

export default function MinhaContaPedidos() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
        <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-scale-in">
          <div className="space-y-4 text-center mb-6">
            <h1 className="text-2xl font-bold">Faça login para continuar</h1>
            <p className="text-muted-foreground">
              Você precisa estar logado para ver seus pedidos
            </p>
          </div>
          <Button onClick={() => setLocation('/login')} className="w-full shadow-soft hover:shadow-soft-lg">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in-up">
            <Button variant="ghost" onClick={() => setLocation('/')} className="hover:bg-primary/5 hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <h1 className="text-4xl font-bold mb-8 animate-fade-in-up delay-100">Meus Pedidos</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4 animate-fade-in-up delay-200">
              {orders.map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, variant: 'outline' };
                return (
                  <div key={order.id} className="glass-card p-6 rounded-2xl hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Pedido #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge variant={statusInfo.variant} className="rounded-full px-3 py-1">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {(order.totalCents / 100).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setLocation(`/minha-conta/pedidos/${order.id}`)}
                        className="border-primary/20 hover:bg-primary/5 hover:text-primary"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl text-center animate-fade-in-up delay-200">
              <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-8">
                Você ainda não fez nenhum pedido. Que tal começar agora?
              </p>
              <Button onClick={() => setLocation('/checkout')} className="shadow-soft hover:shadow-soft-lg">
                Fazer Primeiro Pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
