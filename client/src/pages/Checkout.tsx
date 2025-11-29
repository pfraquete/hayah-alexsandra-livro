import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Loader2, Package, CreditCard, MapPin, Check } from 'lucide-react';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);

  const [address, setAddress] = useState({
    recipientName: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
  });

  const { data: products, isLoading: loadingProducts } = trpc.products.list.useQuery();
  const calculateShipping = trpc.checkout.calculateShipping.useMutation();
  const createOrderMutation = trpc.checkout.createOrder.useMutation();

  const product = products?.[0];
  const selectedShipping = shippingOptions.find(opt => opt.code === shippingMethod);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Faça login para continuar</CardTitle>
            <CardDescription>
              Você precisa estar logado para finalizar a compra
            </CardDescription>
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

  if (loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Produto não encontrado</p>
      </div>
    );
  }

  const handleCalculateShipping = async () => {
    if (!address.cep || address.cep.length < 8) {
      toast.error('Digite um CEP válido');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculateShipping.mutateAsync({
        cep: address.cep,
        productId: product.id,
        quantity,
      });

      setShippingOptions(result.options);
      if (result.options.length > 0) {
        setShippingMethod(result.options[0].code);
      }
      toast.success('Frete calculado com sucesso!');
    } catch (error) {
      toast.error('Erro ao calcular frete');
    }
    setIsCalculating(false);
  };

  const handleCreateOrder = async () => {
    if (!selectedShipping) {
      toast.error('Selecione uma opção de frete');
      return;
    }

    if (!address.recipientName || !address.street || !address.number || !address.district || !address.city || !address.state) {
      toast.error('Preencha todos os campos obrigatórios do endereço');
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        productId: product.id,
        quantity,
        shippingMethod: selectedShipping.code,
        shippingPriceCents: selectedShipping.priceCents,
        address,
        paymentMethod: paymentMethod as any,
      });

      toast.success('Pedido criado com sucesso!');
      setLocation(`/minha-conta/pedidos/${result.orderId}`);
    } catch (error) {
      toast.error('Erro ao criar pedido');
    }
  };

  const subtotal = product.priceCents * quantity;
  const shipping = selectedShipping?.priceCents || 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in-up">Finalizar Compra</h1>

          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up delay-100">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Etapa 1: Produto */}
              <div className={`glass-card p-6 rounded-2xl transition-all duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                    {step > 1 ? <Check className="h-6 w-6" /> : '1'}
                  </div>
                  <h2 className="text-xl font-semibold">Produto</h2>
                </div>

                <div className="flex gap-6">
                  <div className="w-24 h-32 bg-gradient-to-br from-primary to-purple-500 rounded-lg shadow-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-primary font-semibold text-xl">
                      R$ {(product.priceCents / 100).toFixed(2)}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Label htmlFor="quantity" className="text-muted-foreground">Quantidade:</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20 bg-white/50 border-primary/20 focus:border-primary/50 text-center font-semibold rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                {step === 1 && (
                  <Button onClick={() => setStep(2)} className="w-full mt-6 shadow-soft hover:shadow-soft-lg">
                    Continuar
                  </Button>
                )}
              </div>

              {/* Etapa 2: Endereço */}
              {step >= 2 && (
                <div className={`glass-card p-6 rounded-2xl transition-all duration-300 animate-fade-in-up ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                      {step > 2 ? <Check className="h-6 w-6" /> : '2'}
                    </div>
                    <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipientName">Nome Completo</Label>
                      <Input
                        id="recipientName"
                        value={address.recipientName}
                        onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                        placeholder="Seu nome completo"
                        className="bg-white/50 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={address.cep}
                          onChange={(e) => setAddress({ ...address, cep: e.target.value.replace(/\D/g, '') })}
                          placeholder="00000-000"
                          maxLength={8}
                          className="bg-white/50 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleCalculateShipping}
                          disabled={isCalculating}
                          variant="outline"
                          className="w-full border-primary/20 hover:bg-primary/5"
                        >
                          {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular Frete'}
                        </Button>
                      </div>
                    </div>

                    {shippingOptions.length > 0 && (
                      <div className="bg-white/30 p-4 rounded-xl border border-white/40">
                        <Label className="mb-3 block font-semibold">Opções de Frete</Label>
                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="gap-3">
                          {shippingOptions.map((option) => (
                            <div key={option.code} className={`flex items-center space-x-3 border rounded-xl p-4 transition-all cursor-pointer ${shippingMethod === option.code ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-white/40 hover:bg-white/60'}`}>
                              <RadioGroupItem value={option.code} id={option.code} />
                              <Label htmlFor={option.code} className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{option.name}</span>
                                  <span className="font-bold text-primary">R$ {(option.priceCents / 100).toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Entrega em até {option.deliveryDays} dias úteis
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="street">Endereço</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="Rua, Avenida, etc"
                        className="bg-white/50 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          className="bg-white/50 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Opcional"
                          className="bg-white/50 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="district">Bairro</Label>
                      <Input
                        id="district"
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        className="bg-white/50 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="bg-white/50 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                          maxLength={2}
                          placeholder="SP"
                          className="bg-white/50 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                    </div>
                    {step === 2 && shippingOptions.length > 0 && (
                      <Button onClick={() => setStep(3)} className="w-full mt-4 shadow-soft hover:shadow-soft-lg">
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Etapa 3: Pagamento */}
              {step >= 3 && (
                <div className="glass-card p-6 rounded-2xl animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-lg shadow-primary/30 font-bold text-lg">
                      3
                    </div>
                    <h2 className="text-xl font-semibold">Pagamento</h2>
                  </div>
                  <div className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-white/40 hover:bg-white/60'}`}>
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex-1 cursor-pointer font-medium">
                          Cartão de Crédito
                        </Label>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-white/40 hover:bg-white/60'}`}>
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer font-medium">
                          PIX
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-white/40 hover:bg-white/60'}`}>
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto" className="flex-1 cursor-pointer font-medium">
                          Boleto Bancário
                        </Label>
                      </div>
                    </RadioGroup>
                    <Button
                      onClick={handleCreateOrder}
                      className="w-full py-6 text-lg shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar Pedido'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo */}
            <div>
              <div className="glass-card p-6 rounded-2xl sticky top-4">
                <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({quantity}x)</span>
                    <span>R$ {(subtotal / 100).toFixed(2)}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frete ({selectedShipping.name})</span>
                      <span>R$ {(shipping / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-primary">R$ {(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
