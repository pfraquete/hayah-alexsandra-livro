export function Preview() {
    const excerpts = [
        {
            title: "Trecho 1",
            text: "“Talvez você tenha passado anos tentando ser tudo para todos — e, no processo, esqueceu de ser quem Deus te chamou para ser. Este livro é um convite para se lembrar de você.”"
        },
        {
            title: "Trecho 2",
            text: "“A cura não começa quando tudo faz sentido, mas quando você decide não caminhar mais sozinha.”"
        },
        {
            title: "Trecho 3",
            text: "“Você não é o que fizeram com você, nem o que disseram sobre você. Você é quem Deus disse que você é.”"
        },
        {
            title: "Trecho 4",
            text: "“Talvez a sua maior coragem hoje seja admitir que precisa de ajuda. E está tudo bem. Deus não se assusta com a sua verdade.”"
        }
    ];

    return (
        <section id="previa" className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mb-12">
                    <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
                        Um gostinho do que você vai encontrar nas páginas.
                    </h2>
                    <p className="text-[var(--texto-suave)] text-lg">
                        Alguns trechos que já começam a conversar com o seu coração antes mesmo do livro chegar na sua casa.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                    {excerpts.map((item, i) => (
                        <div key={i} className="bg-white rounded-[12px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
                            <h3 className="font-serif text-lg mb-3 text-[var(--texto-escuro)]">{item.title}</h3>
                            <p className="text-[var(--texto-suave)] italic leading-relaxed">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
