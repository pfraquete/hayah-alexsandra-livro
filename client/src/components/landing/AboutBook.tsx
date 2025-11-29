import { Check, Star, Heart, BookOpen } from 'lucide-react';

export function AboutBook() {
  const pillars = [
    {
      icon: Heart,
      title: "Vida Equilibrada",
      description: "Aprenda a harmonizar todas as áreas da sua vida com sabedoria divina."
    },
    {
      icon: BookOpen,
      title: "Caminho de Sabedoria",
      description: "Princípios práticos de Provérbios aplicados ao dia a dia da mulher moderna."
    },
    {
      icon: Star,
      title: "Abundância com Propósito",
      description: "Descubra como prosperar financeiramente mantendo seus valores cristãos."
    },
    {
      icon: Check,
      title: "Crescimento Espiritual",
      description: "Devocionais diários para fortalecer sua fé e intimidade com Deus."
    }
  ];

  return (
    <section id="sobre-livro" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-[400px] aspect-[3/4] perspective-1000 group">
              <div className="absolute inset-0 bg-[var(--rosa-principal)]/20 blur-3xl rounded-full -z-10 transform group-hover:scale-110 transition-transform duration-700" />

              {/* 3D Book Effect */}
              <div className="relative w-full h-full transform transition-transform duration-500 group-hover:rotate-y-6 preserve-3d shadow-2xl rounded-r-xl">
                <div className="absolute top-0 left-0 w-12 h-full bg-[#d66294] origin-left rotate-y-90 rounded-l-sm transform -translate-x-12" />
                <img
                  src="/assets/images/book-cover-official.jpg"
                  alt="Capa do Livro Mulher Sábia, Vida Próspera"
                  className="w-full h-full object-cover rounded-r-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none rounded-r-xl" />
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[var(--preto-suave)]">
                Uma jornada de <span className="text-[var(--rosa-principal)]">transformação</span>
              </h2>
              <p className="text-lg text-[var(--texto-suave)] leading-relaxed">
                "Mulher Sábia, Vida Próspera" não é apenas um livro, é um convite para reescrever sua história.
                Através de uma leitura envolvente e prática, Alexsandra Sardinha guia você por um caminho de autodescoberta,
                fé e realização pessoal.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map((pilar, index) => (
                <div key={index} className="bg-[var(--rosa-pastel)]/50 p-6 rounded-2xl hover:bg-[var(--rosa-pastel)] transition-colors duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-[var(--rosa-principal)]">
                    <pilar.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[var(--rosa-profundo)] mb-2">{pilar.title}</h3>
                  <p className="text-sm text-[var(--texto-suave)]">{pilar.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-[var(--rosa-principal)]/5 border-l-4 border-[var(--rosa-principal)] p-6 rounded-r-xl">
              <p className="italic text-[var(--texto-suave)] font-medium">
                "A sabedoria é a chave que destranca as portas da prosperidade em todas as áreas da sua vida."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
