import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="w-full max-w-lg mx-4 glass-card rounded-2xl p-8 text-center animate-scale-in">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100/50 rounded-full animate-pulse blur-xl" />
            <AlertCircle className="relative h-20 w-20 text-red-500 drop-shadow-md" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>

        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
          Página não encontrada
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Desculpe, a página que você está procurando não existe.
          <br />
          Ela pode ter sido movida ou excluída.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleGoHome}
            className="shadow-soft hover:shadow-soft-lg px-8 py-6 rounded-full text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
