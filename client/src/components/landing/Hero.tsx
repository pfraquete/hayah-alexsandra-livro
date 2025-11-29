import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { useLocation } from 'wouter';

export function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 mesh-gradient opacity-30 -z-10" />
      <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-[2px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/10 backdrop-blur-md text-primary px-4 py-2 rounded-full text-sm font-medium border border-white/20 shadow-sm">
              <Star className="h-4 w-4 fill-current" />
              Best Seller em Desenvolvimento Pessoal
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-gradient block">
                Mulher Sábia,
              </span>
              <span className="text-foreground">Vida Próspera</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Descubra os segredos para transformar sua vida financeira e pessoal.
              Um guia completo para mulheres que desejam prosperar em todas as áreas da vida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-soft-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
                onClick={() => setLocation('/checkout')}
              >
                Comprar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-primary/20 hover:bg-white/50 backdrop-blur-sm"
                onClick={() => {
                  document.getElementById('sobre-livro')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Saiba Mais
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="flex gap-8 pt-8 border-t border-border/50">
              <div>
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Leitoras Transformadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Avaliações 5 Estrelas</div>
              </div>
            </div>
          </div>

          {/* Imagem do Livro */}
          <div className="relative flex justify-center lg:justify-end animate-scale-in delay-200">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-700 ease-out">
              <div className="relative rounded-lg shadow-soft-lg">
                <img
                  src="/assets/images/book-cover.jpg"
                  alt="Capa do livro Mulher Sábia, Vida Próspera"
                  className="rounded-lg max-w-[300px] lg:max-w-[400px] w-full h-auto object-cover"
                />
                {/* Reflexo/Brilho */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-black/5 to-white/30 pointer-events-none mix-blend-overlay" />
              </div>
            </div>

            {/* Elementos decorativos de fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
