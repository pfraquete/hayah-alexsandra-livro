import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RecuperarSenha() {
  const [, setLocation] = useLocation();
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast.error('Erro ao enviar e-mail', {
        description: error.message,
      });
    } else {
      setEmailSent(true);
      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    }

    setIsSubmitting(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
        <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-scale-in">
          <div className="space-y-4 text-center mb-6">
            <h1 className="text-2xl font-bold">E-mail Enviado!</h1>
            <p className="text-muted-foreground">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
          <Button
            onClick={() => setLocation('/login')}
            className="w-full shadow-soft hover:shadow-soft-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-scale-in">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-center">Recuperar Senha</h1>
          <p className="text-center text-muted-foreground">
            Digite seu e-mail para receber instruções de recuperação
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || loading}
              className="bg-white/50 border-primary/10 focus:border-primary/30"
            />
          </div>
          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full shadow-soft hover:shadow-soft-lg"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar E-mail de Recuperação'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full hover:bg-primary/5 hover:text-primary"
              onClick={() => setLocation('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
