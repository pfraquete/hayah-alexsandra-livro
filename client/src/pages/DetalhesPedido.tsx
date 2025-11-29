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
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Faça login para continuar</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/login')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setLocation('/minha-conta/pedidos')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Meus Pedidos
            </Button>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
              <p className="text-gray-600 mt-1">
                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Badge variant={statusInfo.variant} className="text-sm px-4 py-2">
              {statusInfo.label}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Itens do Pedido */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-pink-600" />
                  <CardTitle>Itens do Pedido</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        R$ {(item.totalPriceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <CardTitle>Endereço de Entrega</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {shippingAddress && (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{shippingAddress.recipientName}</p>
                    <p>{shippingAddress.street}, {shippingAddress.number}</p>
                    {shippingAddress.complement && <p>{shippingAddress.complement}</p>}
                    <p>{shippingAddress.district}</p>
                    <p>{shippingAddress.city} - {shippingAddress.state}</p>
                    <p>CEP: {shippingAddress.cep}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                  <CardTitle>Pagamento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-semibold">Método:</span>{' '}
                  {paymentMethodLabels[order.paymentMethod || ''] || order.paymentMethod}
                </p>
                {order.paidAt && (
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Pago em:</span>{' '}
                    {new Date(order.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {(order.subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>R$ {(order.shippingPriceCents / 100).toFixed(2)}</span>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {(order.discountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-pink-600">
                    R$ {(order.totalCents / 100).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {order.customerNotes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{order.customerNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
