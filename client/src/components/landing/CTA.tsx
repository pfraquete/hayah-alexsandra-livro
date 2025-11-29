import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function CTA() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-[var(--rosa-claro)] to-[var(--branco-rosado)] rounded-[26px] p-8 lg:p-12 text-center shadow-[0_18px_40px_rgba(232,115,165,0.18)] max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
            Transforme a forma como você enxerga a si mesma.
          </h2>
          <p className="text-[var(--texto-suave)] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Se algo dentro de você acendeu enquanto lia esta página, talvez este seja o sinal que você estava esperando.
            Dê esse passo por você.
          </p>

          <Button
            className="rounded-full px-8 py-6 text-base font-semibold bg-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/90 text-white shadow-lg hover:shadow-xl hover:-translate-y-px transition-all cursor-pointer"
            onClick={() => setLocation('/produto')}
          >
            Quero meu exemplar agora
          </Button>

          <div className="text-sm text-[var(--texto-suave)] mt-4">
            📦 Envio para todo o Brasil • Pagamento seguro • Bônus exclusivos na pré-venda
          </div>
        </div>
      </div>
    </section>
  );
}
