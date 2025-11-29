export function Testimonials() {
  const testimonials = [
    {
      text: "“Eu me vi em cada página. Chorei, respirei fundo e senti Deus me lembrando de quem eu sou.”",
      author: "Ana, 34 anos"
    },
    {
      text: "“Não é só um livro, é um processo de cura. Leio e releio alguns trechos como se fossem orações.”",
      author: "Juliana, 29 anos"
    },
    {
      text: "“Alexsandra escreve como se estivesse sentada na sala da minha casa, conversando comigo.”",
      author: "Camila, 38 anos"
    }
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
            Como este livro já tem tocado outras mulheres.
          </h2>
          <p className="text-[var(--texto-suave)] text-lg">
            Alguns dos relatos de quem já teve acesso antecipado aos capítulos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-white rounded-[12px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-[0.9rem]">
              <p className="text-[var(--texto-escuro)] mb-4 leading-relaxed">
                {item.text}
              </p>
              <strong className="block text-xs uppercase tracking-[0.16em] text-[#a17c8e]">
                {item.author}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
