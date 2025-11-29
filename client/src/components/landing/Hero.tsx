import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { useLocation } from 'wouter';

export function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              Best Seller em Desenvolvimento Pessoal
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Mulher Sábia,
              </span>
              <br />
              <span className="text-gray-900">Vida Próspera</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Descubra os segredos para transformar sua vida financeira e pessoal. 
              Um guia completo para mulheres que desejam prosperar em todas as áreas da vida.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-pink-600 hover:bg-pink-700 text-lg px-8 py-6"
                onClick={() => setLocation('/checkout')}
              >
                Comprar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => {
                  document.getElementById('sobre-livro')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Saiba Mais
              </Button>
            </div>
            
            {/* Estatísticas */}
            <div className="flex gap-8 pt-8 border-t">
              <div>
                <div className="text-3xl font-bold text-pink-600">10k+</div>
                <div className="text-sm text-gray-600">Leitoras Transformadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">4.9</div>
                <div className="text-sm text-gray-600">Avaliação Média</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">500+</div>
                <div className="text-sm text-gray-600">Avaliações 5 Estrelas</div>
              </div>
            </div>
          </div>
          
          {/* Imagem do Livro */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="aspect-[3/4] bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <div className="text-6xl font-bold mb-4">MS</div>
                  <div className="text-2xl font-semibold">Mulher Sábia</div>
                  <div className="text-xl mt-2">Vida Próspera</div>
                  <div className="mt-8 text-sm opacity-90">Alexsandra Sardinha</div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
