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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
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
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Etapa 1: Produto */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                      {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                    </div>
                    <CardTitle>Produto</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-gradient-to-br from-pink-400 to-purple-500 rounded flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        R$ {(product.priceCents / 100).toFixed(2)}
                      </p>
                      <div className="mt-4">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                  {step === 1 && (
                    <Button onClick={() => setStep(2)} className="w-full mt-4">
                      Continuar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Etapa 2: Endereço */}
              {step >= 2 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                        {step > 2 ? <Check className="h-5 w-5" /> : '2'}
                      </div>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="recipientName">Nome Completo</Label>
                      <Input
                        id="recipientName"
                        value={address.recipientName}
                        onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                        placeholder="Seu nome completo"
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
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleCalculateShipping}
                          disabled={isCalculating}
                          variant="outline"
                          className="w-full"
                        >
                          {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular Frete'}
                        </Button>
                      </div>
                    </div>
                    
                    {shippingOptions.length > 0 && (
                      <div>
                        <Label>Opções de Frete</Label>
                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                          {shippingOptions.map((option) => (
                            <div key={option.code} className="flex items-center space-x-2 border rounded p-3">
                              <RadioGroupItem value={option.code} id={option.code} />
                              <Label htmlFor={option.code} className="flex-1 cursor-pointer">
                                <div className="flex justify-between">
                                  <span>{option.name}</span>
                                  <span className="font-semibold">R$ {(option.priceCents / 100).toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
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
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="district">Bairro</Label>
                      <Input
                        id="district"
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
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
                        />
                      </div>
                    </div>
                    {step === 2 && shippingOptions.length > 0 && (
                      <Button onClick={() => setStep(3)} className="w-full">
                        Continuar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Etapa 3: Pagamento */}
              {step >= 3 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-600 text-white">
                        3
                      </div>
                      <CardTitle>Pagamento</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 border rounded p-3">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                          Cartão de Crédito
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded p-3">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer">
                          PIX
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded p-3">
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                          Boleto Bancário
                        </Label>
                      </div>
                    </RadioGroup>
                    <Button 
                      onClick={handleCreateOrder} 
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar Pedido'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resumo */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({quantity}x)</span>
                    <span>R$ {(subtotal / 100).toFixed(2)}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between">
                      <span>Frete ({selectedShipping.name})</span>
                      <span>R$ {(shipping / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-pink-600">R$ {(total / 100).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
