import { Button } from '@/components/ui/button';
import { ArrowRight, Star, BookOpen, ShoppingBag, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[var(--rosa-pastel)] via-white to-[var(--rosa-claro)]/30 min-h-[90vh] flex items-center">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--rosa-claro)]/50 to-transparent -z-10" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[var(--rosa-principal)]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-[var(--rosa-profundo)]/5 rounded-full blur-2xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[var(--rosa-principal)]/20 shadow-sm mx-auto lg:mx-0">
              <Star className="w-4 h-4 text-[var(--rosa-principal)] fill-current" />
              <span className="text-sm font-medium text-[var(--rosa-profundo)] tracking-wide uppercase">Hayah Essence</span>
            </div>

            <div className="relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[var(--preto-suave)] leading-[1.1]">
                Transforme sua vida <br />
                <span className="text-[var(--rosa-principal)]">com propósito</span>
              </h1>
              <span className="font-['Great_Vibes'] text-5xl text-[var(--rosa-profundo)] absolute -top-10 -right-4 md:-right-12 rotate-[-10deg] opacity-80">
                Bem-vinda
              </span>
            </div>

            <p className="text-xl text-[var(--texto-suave)] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Livros, cursos e uma comunidade de mulheres empreendedoras do Reino. Descubra conteúdos que transformam.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Button
                onClick={() => setLocation('/loja')}
                variant="outline"
                className="h-20 flex-col gap-2 bg-white hover:bg-[var(--rosa-pastel)] border-2 border-[var(--rosa-claro)] hover:border-[var(--rosa-principal)] transition-all"
              >
                <ShoppingBag className="w-6 h-6 text-[var(--rosa-principal)]" />
                <span className="font-semibold">Loja de Livros</span>
              </Button>

              <Button
                onClick={() => setLocation('/marketplace')}
                variant="outline"
                className="h-20 flex-col gap-2 bg-white hover:bg-[var(--rosa-pastel)] border-2 border-[var(--rosa-claro)] hover:border-[var(--rosa-principal)] transition-all"
              >
                <BookOpen className="w-6 h-6 text-[var(--rosa-principal)]" />
                <span className="font-semibold">Cursos Online</span>
              </Button>

              <Button
                onClick={() => setLocation('/comunidade')}
                variant="outline"
                className="h-20 flex-col gap-2 bg-white hover:bg-[var(--rosa-pastel)] border-2 border-[var(--rosa-claro)] hover:border-[var(--rosa-principal)] transition-all"
              >
                <Users className="w-6 h-6 text-[var(--rosa-principal)]" />
                <span className="font-semibold">Comunidade</span>
              </Button>
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
              <Button
                onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-[var(--rosa-principal)] to-[var(--rosa-profundo)] hover:from-[var(--rosa-profundo)] hover:to-[var(--rosa-principal)] shadow-lg shadow-[var(--rosa-principal)]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Explorar Produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-[var(--texto-suave)] pt-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Compra Segura</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[var(--texto-suave)]/30" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Entrega Garantida</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[var(--texto-suave)]/30" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Comunidade Ativa</span>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative animate-fade-in-up delay-200 lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5]">
              {/* Decorative Elements behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--rosa-principal)]/10 to-[var(--rosa-profundo)]/10 rounded-[2rem] rotate-3 scale-105 -z-10" />
              <div className="absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white">
                <img
                  src="/assets/images/hero-promo.jpg"
                  alt="Hayah Essence - Empreendedoras do Reino"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-[var(--rosa-claro)] animate-bounce-slow hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[var(--rosa-pastel)] to-[var(--rosa-claro)] p-2 rounded-full">
                    <Star className="w-6 h-6 text-[var(--rosa-principal)] fill-current" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--texto-suave)] uppercase tracking-wider font-semibold">Plataforma Completa</p>
                    <p className="text-sm font-bold text-[var(--rosa-profundo)]">Livros + Cursos + Comunidade</p>
                  </div>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="absolute -top-6 -left-6 bg-white p-3 rounded-xl shadow-lg border border-[var(--rosa-claro)] hidden lg:block">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--rosa-principal)]">1000+</p>
                  <p className="text-xs text-[var(--texto-suave)] font-medium">Mulheres Conectadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
