import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

export function CTA() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Comece Sua Transformação Hoje
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-pink-100">
            Junte-se a milhares de mulheres que já transformaram suas vidas
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="text-5xl lg:text-6xl font-bold mb-2">
              R$ 67,90
            </div>
            <div className="text-xl text-pink-100 mb-6">
              ou 12x de R$ 6,53 no cartão
            </div>
            <Button 
              size="lg"
              className="bg-white text-pink-600 hover:bg-pink-50 text-lg px-12 py-6"
              onClick={() => setLocation('/checkout')}
            >
              Comprar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1">Frete Grátis</div>
                <div className="text-sm text-pink-100">
                  Para compras acima de R$ 100
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1">Garantia de 30 dias</div>
                <div className="text-sm text-pink-100">
                  Devolução sem complicações
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1">Pagamento Seguro</div>
                <div className="text-sm text-pink-100">
                  Ambiente 100% protegido
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
