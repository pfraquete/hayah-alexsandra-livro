import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

export function CTA() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-20 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 -z-20" />
      <div className="absolute inset-0 mesh-gradient opacity-50 mix-blend-overlay -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 animate-fade-in-up">
            Comece Sua Transformação Hoje
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-white/90 animate-fade-in-up delay-100">
            Junte-se a milhares de mulheres que já transformaram suas vidas
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl animate-scale-in delay-200">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="text-3xl lg:text-4xl font-semibold line-through text-white/60 drop-shadow-sm">
                R$ 99,90
              </div>
              <div className="text-5xl lg:text-6xl font-bold text-white drop-shadow-sm">
                R$ 79,90
              </div>
            </div>
            <div className="text-xl text-white/90 mb-8">
              ou 12x de R$ 7,66 no cartão
            </div>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold"
              onClick={() => setLocation('/produto')}
            >
              Comprar Agora
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left animate-fade-in-up delay-300">
            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-white/20 rounded-full p-2.5">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-lg">Frete Grátis</div>
                <div className="text-sm text-white/80">
                  Para compras acima de R$ 100
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-white/20 rounded-full p-2.5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-lg">Garantia de 30 dias</div>
                <div className="text-sm text-white/80">
                  Devolução sem complicações
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-white/20 rounded-full p-2.5">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-lg">Pagamento Seguro</div>
                <div className="text-sm text-white/80">
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
