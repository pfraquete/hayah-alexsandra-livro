import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { toast } from 'sonner';

// Dados do produto hardcoded
const PRODUCT = {
  id: 1,
  name: 'Mulher Sábia, Vida Próspera',
  description: 'Um ano inteiro aprendendo com Provérbios a viver com equilíbrio, abundância e graça.',
  priceCents: 7990,
  compareAtPriceCents: 9990,
  imageUrl: '/assets/images/book-cover-official.jpg',
  stockQuantity: 100,
  weightGrams: 300,
  widthCm: 14,
  heightCm: 21,
  lengthCm: 2,
};

export default function Produto() {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

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
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('Por favor, insira um CEP válido');
      return;
    }
    calculateShippingMutation.mutate({
      productId: PRODUCT.id,
      quantity,
      cep: cleanCep,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= PRODUCT.stockQuantity) {
      setQuantity(newQuantity);
      setSelectedShipping(null); // Reset shipping quando mudar quantidade
    }
  };

  const handleBuyNow = () => {
    if (!selectedShipping) {
      toast.error('Por favor, calcule o frete antes de continuar');
      return;
    }

    // Salvar no localStorage para usar no checkout
    localStorage.setItem('checkoutData', JSON.stringify({
      productId: PRODUCT.id,
      quantity,
      shipping: selectedShipping,
      cep,
    }));

    setLocation('/checkout');
  };

  const subtotal = (PRODUCT.priceCents * quantity) / 100;
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
  const total = subtotal + shippingCost;
  const discount = PRODUCT.compareAtPriceCents
    ? ((PRODUCT.compareAtPriceCents - PRODUCT.priceCents) / PRODUCT.compareAtPriceCents * 100).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna da Imagem */}
            <div className="space-y-4">
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={PRODUCT.imageUrl}
                    alt={PRODUCT.name}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Coluna de Informações */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{PRODUCT.name}</h1>
                <p className="text-muted-foreground text-lg">{PRODUCT.description}</p>
              </div>

              {/* Preço */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-muted-foreground line-through">
                        R$ {(PRODUCT.compareAtPriceCents / 100).toFixed(2)}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        -{discount}%
                      </Badge>
                    </div>
                    <div className="text-5xl font-bold text-primary">
                      R$ {(PRODUCT.priceCents / 100).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ou 12x de R$ {((PRODUCT.priceCents / 100) / 12).toFixed(2)} no cartão
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quantidade */}
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
                      disabled={quantity >= PRODUCT.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      ({PRODUCT.stockQuantity} disponíveis)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cálculo de Frete */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Calcular Frete
                  </CardTitle>
                  <CardDescription>
                    Informe seu CEP para calcular o prazo e valor da entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        maxLength={9}
                      />
                    </div>
                    <Button onClick={handleCalculateShipping} disabled={loadingShipping}>
                      {loadingShipping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Calcular'
                      )}
                    </Button>
                  </div>

                  {shippingOptions && shippingOptions.options.length > 0 && (
                    <div className="space-y-2">
                      {shippingOptions.options.map((option: any) => (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedShipping?.id === option.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Truck className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-semibold">{option.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {option.delivery_time} dias úteis
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                R$ {parseFloat(option.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumo e Comprar */}
              <Card className="glass-card border-primary">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal ({quantity}x)</span>
                      <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {selectedShipping && (
                      <div className="flex justify-between text-lg">
                        <span>Frete</span>
                        <span className="font-semibold">R$ {shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={handleBuyNow}
                    disabled={!selectedShipping}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Finalizar Compra
                  </Button>

                  {!selectedShipping && (
                    <p className="text-sm text-center text-muted-foreground">
                      Calcule o frete para continuar
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground">Peso</div>
                    <div className="font-semibold">{PRODUCT.weightGrams}g</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground">Envio</div>
                    <div className="font-semibold">Todo Brasil</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground">Entrega</div>
                    <div className="font-semibold">Rápida</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
