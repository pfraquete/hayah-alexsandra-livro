import { Award, BookOpen, Users } from 'lucide-react';

export function AboutAuthor() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Foto da Autora */}
            <div className="relative animate-scale-in">
              <div className="aspect-square rounded-[2rem] shadow-soft-lg overflow-hidden border-4 border-white/30">
                <img
                  src="/assets/images/author-promo.jpg"
                  alt="Alexsandra Sardinha"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-6 max-w-xs animate-fade-in-up delay-300">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Autora Best-Seller</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reconhecida internacionalmente por seu trabalho em desenvolvimento pessoal
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-6 animate-fade-in-up delay-100">
              <div>
                <h2 className="text-4xl font-bold mb-4 text-foreground">Sobre a Autora</h2>
                <h3 className="text-2xl text-gradient font-bold mb-4">Alexsandra Sardinha</h3>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Alexsandra Sardinha é coach de vida, palestrante motivacional e autora best-seller
                com mais de 15 anos de experiência ajudando mulheres a transformarem suas vidas.
                Sua abordagem única combina sabedoria prática com estratégias comprovadas de
                desenvolvimento pessoal e prosperidade financeira.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Formada em Psicologia e com certificações internacionais em coaching, Alexsandra
                já impactou a vida de milhares de mulheres através de seus livros, palestras e
                programas de mentoria.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">5+</div>
                    <div className="text-sm text-muted-foreground">Livros Publicados</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">50k+</div>
                    <div className="text-sm text-muted-foreground">Vidas Impactadas</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
                    <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">15+</div>
                    <div className="text-sm text-muted-foreground">Anos de Experiência</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
