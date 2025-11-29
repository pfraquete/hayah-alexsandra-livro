import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocation, useRoute } from 'wouter';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

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

const paymentMethodLabels: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  boleto: 'Boleto Bancário',
};

export default function DetalhesPedido() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/minha-conta/pedidos/:id');
  const { isAuthenticated, loading: authLoading } = useAuth();

  const orderId = params?.id ? parseInt(params.id) : 0;

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { id: orderId },
    { enabled: isAuthenticated && orderId > 0 }
  );

  if (authLoading || isLoading) {
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
          </div>
          <Button onClick={() => setLocation('/login')} className="w-full shadow-soft hover:shadow-soft-lg">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pedido não encontrado</p>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status] || { label: order.status, variant: 'outline' };
  const shippingAddress = order.shippingAddress as any;

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in-up">
            <Button variant="ghost" onClick={() => setLocation('/minha-conta/pedidos')} className="hover:bg-primary/5 hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Meus Pedidos
            </Button>
          </div>

          <div className="flex justify-between items-start mb-8 animate-fade-in-up delay-100">
            <div>
              <h1 className="text-4xl font-bold">Pedido #{order.id}</h1>
              <p className="text-muted-foreground mt-1">
                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Badge variant={statusInfo.variant} className="text-sm px-4 py-2 rounded-full">
              {statusInfo.label}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
            {/* Itens do Pedido */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Itens do Pedido</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors">
                    <div className="w-16 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-lg shadow-sm flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        R$ {(item.totalPriceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
              </div>
              <div>
                {shippingAddress && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-bold text-foreground text-base">{shippingAddress.recipientName}</p>
                    <p>{shippingAddress.street}, {shippingAddress.number}</p>
                    {shippingAddress.complement && <p>{shippingAddress.complement}</p>}
                    <p>{shippingAddress.district}</p>
                    <p>{shippingAddress.city} - {shippingAddress.state}</p>
                    <p>CEP: {shippingAddress.cep}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Pagamento</h2>
              </div>
              <div>
                <p className="text-sm mb-2">
                  <span className="font-semibold text-foreground">Método:</span>{' '}
                  <span className="text-muted-foreground">{paymentMethodLabels[order.paymentMethod || ''] || order.paymentMethod}</span>
                </p>
                {order.paidAt && (
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">Pago em:</span>{' '}
                    <span className="text-muted-foreground">{new Date(order.paidAt).toLocaleDateString('pt-BR')}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-6">Resumo Financeiro</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {(order.subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Frete</span>
                  <span>R$ {(order.shippingPriceCents / 100).toFixed(2)}</span>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Desconto</span>
                    <span>-R$ {(order.discountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-primary/10 my-2" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-primary">
                    R$ {(order.totalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.customerNotes && (
            <div className="glass-card p-6 rounded-2xl mt-6 animate-fade-in-up delay-300">
              <h2 className="text-xl font-semibold mb-4">Observações</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
