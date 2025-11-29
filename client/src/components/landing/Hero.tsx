import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-[var(--rosa-claro)] to-[var(--branco-rosado)] rounded-[32px] p-8 lg:p-12 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center shadow-[0_18px_40px_rgba(232,115,165,0.18)] overflow-hidden relative">
          
          {/* Left Content */}
          <div className="order-2 lg:order-1 relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full text-xs tracking-wider uppercase bg-[rgba(232,115,165,0.08)] text-[var(--rosa-principal)] mb-4 font-semibold">
              Lançamento exclusivo
            </div>
            
            <div className="text-sm uppercase tracking-[0.16em] text-[var(--texto-suave)] mb-2">
              Livro de <span className="italic text-[var(--rosa-principal)]">Alexsandra Sardinha</span>
            </div>
            
            <h1 className="font-serif text-4xl lg:text-[3.3rem] leading-[1.1] mb-4 text-[var(--texto-escuro)]">
              Descubra a mulher que você sempre foi.
            </h1>
            
            <p className="text-lg text-[var(--texto-suave)] mb-6 max-w-lg leading-relaxed">
              Uma jornada real, intensa e cheia de fé para mulheres que desejam cura, identidade e coragem para viver sua melhor versão.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={() => setLocation('/produto')}
                className="rounded-full px-6 py-6 text-base font-semibold bg-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/90 text-white shadow-[0_18px_40px_rgba(232,115,165,0.18)] hover:shadow-[0_20px_40px_rgba(232,115,165,0.3)] hover:-translate-y-px transition-all cursor-pointer"
              >
                Quero garantir meu exemplar
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('previa')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full px-6 py-6 text-base font-semibold border-[rgba(232,115,165,0.6)] text-[var(--rosa-principal)] hover:bg-[rgba(232,115,165,0.06)] bg-transparent cursor-pointer"
              >
                Ler um trecho grátis
              </Button>
            </div>
            
            <div className="text-sm text-[var(--texto-suave)]">
              📦 Frete com código de rastreio + bônus exclusivos no lançamento.
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2 relative flex justify-center items-center">
            {/* Pill Background */}
            <div className="absolute w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(232,115,165,0.18),transparent_70%)] -top-4 -right-4 z-0"></div>
            
            {/* Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)] w-full max-w-[320px] relative z-10">
              {/* Book Mockup */}
              <div className="w-full h-[210px] rounded-[18px] bg-gradient-to-br from-[#fef1f6] to-[#f9d0e0] relative overflow-hidden mb-4 border border-white/80">
                <div className="absolute w-[130%] h-[70%] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_60%)] -top-[20%] -left-[10%] opacity-90"></div>
                <div className="absolute left-[6%] top-[10%] bottom-[10%] width-[7px] bg-gradient-to-r from-[#f3b4cd] to-[#fef1f6] rounded-full w-[7px]"></div>
                <div className="absolute top-[54%] left-[13%] right-[10%] font-serif text-base text-[var(--texto-escuro)]">
                  <strong>“Descubra a Mulher que Você Sempre Foi”</strong><br />
                  por Alexsandra Sardinha
                </div>
                <div className="absolute right-2 top-2 bg-white px-2.5 py-1 rounded-full text-[11px] font-semibold text-[var(--rosa-principal)] shadow-sm">
                  Edição especial
                </div>
              </div>
              
              <h3 className="font-serif text-lg mb-1.5 text-[var(--texto-escuro)]">Um livro que abraça e desperta.</h3>
              <p className="text-sm text-[var(--texto-suave)] mb-4">
                Histórias reais, fé e reflexões que parecem ter sido escritas exatamente para você.
              </p>
              
              <Button 
                className="w-full rounded-full bg-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/90 text-white font-semibold cursor-pointer"
                onClick={() => setLocation('/produto')}
              >
                Comprar agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
