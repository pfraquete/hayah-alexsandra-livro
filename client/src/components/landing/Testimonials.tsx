import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empresária',
      content: 'Este livro mudou completamente minha perspectiva sobre prosperidade. As estratégias práticas me ajudaram a triplicar minha renda em menos de um ano!',
      rating: 5,
    },
    {
      name: 'Ana Paula Costa',
      role: 'Professora',
      content: 'Finalmente encontrei um livro que fala diretamente com mulheres sobre finanças de forma clara e acessível. Recomendo para todas as minhas amigas!',
      rating: 5,
    },
    {
      name: 'Juliana Santos',
      role: 'Designer',
      content: 'A abordagem da Alexsandra é única. Ela consegue unir desenvolvimento pessoal com prosperidade financeira de uma forma que nunca vi antes.',
      rating: 5,
    },
    {
      name: 'Carla Mendes',
      role: 'Advogada',
      content: 'Os exercícios práticos do livro me ajudaram a identificar e superar bloqueios que me impediam de prosperar. Transformador!',
      rating: 5,
    },
    {
      name: 'Beatriz Oliveira',
      role: 'Psicóloga',
      content: 'Como profissional da área, posso dizer que o conteúdo é sólido e bem fundamentado. Um guia essencial para qualquer mulher.',
      rating: 5,
    },
    {
      name: 'Fernanda Lima',
      role: 'Empreendedora',
      content: 'Comprei para mim e já presenteei várias amigas. É o tipo de livro que você quer que todas as mulheres leiam!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary/5 blur-3xl -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4 text-foreground">O que as leitoras dizem</h2>
          <p className="text-xl text-muted-foreground">
            Milhares de mulheres já transformaram suas vidas com este livro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 border-t border-border/20 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-in-up delay-300">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/10 shadow-sm">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold">4.9/5.0 baseado em 500+ avaliações</span>
          </div>
        </div>
      </div>
    </section>
  );
}
