import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  Package,
  Clock,
  ShoppingCart,
  Loader2,
  MapPin,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Produto() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/produto/:slug');
  const slug = params?.slug || 'mulher-sabia-vida-prospera'; // Fallback para compatibilidade

  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // Buscar produto do banco
  const { data: product, isLoading: loadingProduct } = trpc.products.getBySlug.useQuery({ slug });

  // Calcular frete
  const calculateShippingMutation = trpc.checkout.calculateShipping.useMutation();

  const shippingOptions = calculateShippingMutation.data;
  const loadingShipping = calculateShippingMutation.isPending;

  const handleCepChange = (value: string) => {
    // Formatar CEP: 00000-000
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      const formatted = numbers.length > 5
        ? `${numbers.slice(0, 5)}-${numbers.slice(5)}`
        : numbers;
      setCep(formatted);
    }
  };

  const handleCalculateShipping = () => {
    if (!product) return;

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('Por favor, insira um CEP válido');
      return;
    }
    calculateShippingMutation.mutate({
      productId: product.id,
      quantity,
      cep: cleanCep,
    });
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    const maxStock = product.stockQuantity ?? 999;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
      setSelectedShipping(null); // Reset shipping quando mudar quantidade
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Para produtos físicos, exigir frete
    if (product.productType === 'physical' && !selectedShipping) {
      toast.error('Por favor, calcule o frete antes de continuar');
      return;
    }

    // Salvar no localStorage para usar no checkout
    localStorage.setItem('checkoutData', JSON.stringify({
      productId: product.id,
      productType: product.productType,
      quantity,
      shipping: selectedShipping,
      cep,
    }));

    setLocation('/checkout');
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8">
        <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8">
        <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Produto não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => setLocation('/loja')}>
              Voltar para a Loja
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const subtotal = (product.priceCents * quantity) / 100;
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
  const total = subtotal + shippingCost;
  const isPhysical = product.productType === 'physical';
  const isDigital = product.productType === 'digital';

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/loja')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Loja
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg shadow-xl flex items-center justify-center">
                {isPhysical ? (
                  <Package className="h-24 w-24 text-pink-300" />
                ) : (
                  <FileText className="h-24 w-24 text-purple-300" />
                )}
              </div>
            )}

            {/* Product Type Badge */}
            <div className="flex gap-2">
              {isPhysical && (
                <Badge variant="outline" className="text-base py-1">
                  <Truck className="h-4 w-4 mr-2" />
                  Produto Físico
                </Badge>
              )}
              {isDigital && (
                <Badge variant="outline" className="text-base py-1">
                  <Download className="h-4 w-4 mr-2" />
                  Produto Digital
                </Badge>
              )}
              {isPhysical && product.stockQuantity !== null && product.stockQuantity > 0 && (
                <Badge variant="outline" className="text-green-600">
                  {product.stockQuantity} em estoque
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-3 mb-2">
                  {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {(product.compareAtPriceCents / 100).toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-[var(--rosa-principal)]">
                    R$ {(product.priceCents / 100).toFixed(2)}
                  </span>
                </div>
                {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                  <Badge variant="destructive">
                    Economize R$ {((product.compareAtPriceCents - product.priceCents) / 100).toFixed(2)}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Quantidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isPhysical && product.stockQuantity !== null && quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Calculator - Only for Physical Products */}
            {isPhysical && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Calcular Frete
                  </CardTitle>
                  <CardDescription>
                    Informe seu CEP para calcular o valor e prazo de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="pl-10"
                        maxLength={9}
                      />
                    </div>
                    <Button
                      onClick={handleCalculateShipping}
                      disabled={loadingShipping || cep.replace(/\D/g, '').length !== 8}
                    >
                      {loadingShipping ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        'Calcular'
                      )}
                    </Button>
                  </div>

                  {/* Shipping Options */}
                  {shippingOptions && shippingOptions.options && shippingOptions.options.length > 0 && (
                    <div className="space-y-2">
                      {shippingOptions.options.map((option: any) => (
                        <Card
                          key={option.id}
                          className={`cursor-pointer transition-all ${selectedShipping?.id === option.id
                            ? 'border-[var(--rosa-principal)] bg-pink-50/50'
                            : 'hover:border-pink-200'
                            }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{option.deliveryDays} dias úteis</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">R$ {option.price}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {shippingOptions && 'message' in shippingOptions && shippingOptions.message && (
                    <p className="text-sm text-muted-foreground">{shippingOptions.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Digital Product Info */}
            {isDigital && (
              <Card className="glass-card border-purple-200 bg-purple-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">Produto Digital</p>
                      <p className="text-sm text-purple-700">
                        Após a compra, você poderá fazer o download imediatamente.
                        {product.fileType && ` Formato: ${product.fileType.toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="glass-card border-[var(--rosa-principal)]">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({quantity} {quantity === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
                {isPhysical && selectedShipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete ({selectedShipping.name})</span>
                    <span className="font-semibold">R$ {shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[var(--rosa-principal)]">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Buy Button */}
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={handleBuyNow}
              disabled={
                (isPhysical && product.stockQuantity !== null && product.stockQuantity === 0) ||
                (isPhysical && !selectedShipping)
              }
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isPhysical && product.stockQuantity === 0
                ? 'Produto Esgotado'
                : isDigital
                  ? 'Comprar e Baixar'
                  : 'Finalizar Compra'}
            </Button>

            {isPhysical && !selectedShipping && (
              <p className="text-sm text-center text-muted-foreground">
                Calcule o frete para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
