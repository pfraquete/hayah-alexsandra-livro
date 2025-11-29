import { BookOpen, Heart, TrendingUp, Users } from 'lucide-react';

export function AboutBook() {
  const features = [
    {
      icon: Heart,
      title: 'Desenvolvimento Pessoal',
      description: 'Aprenda a cultivar uma mentalidade de abundância e autoconfiança para alcançar seus objetivos.',
    },
    {
      icon: TrendingUp,
      title: 'Prosperidade Financeira',
      description: 'Descubra estratégias práticas para gerenciar suas finanças e construir riqueza sustentável.',
    },
    {
      icon: Users,
      title: 'Relacionamentos Saudáveis',
      description: 'Construa conexões significativas e aprenda a estabelecer limites saudáveis em sua vida.',
    },
    {
      icon: BookOpen,
      title: 'Sabedoria Prática',
      description: 'Exercícios e reflexões guiadas para aplicar os ensinamentos no seu dia a dia.',
    },
  ];

  return (
    <section id="sobre-livro" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Sobre o Livro</h2>
          <p className="text-xl text-muted-foreground">
            Um guia transformador que combina sabedoria ancestral com estratégias modernas
            para ajudar mulheres a prosperarem em todas as áreas da vida.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary/10 text-primary w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 lg:p-12 text-primary-foreground shadow-soft-lg animate-fade-in-up">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">O que você vai aprender</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span>Como desenvolver uma mentalidade de prosperidade</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span>Estratégias práticas para gestão financeira pessoal</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span>Técnicas para equilibrar vida pessoal e profissional</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span>Como construir relacionamentos mais saudáveis e significativos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span>Exercícios práticos para transformação pessoal</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <div className="text-5xl font-bold mb-2">280</div>
              <div className="text-xl mb-4 opacity-90">Páginas de Conteúdo Transformador</div>
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="text-3xl font-bold mb-2">12</div>
                <div className="text-lg opacity-90">Capítulos Práticos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
