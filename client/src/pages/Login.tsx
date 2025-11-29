import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Erro ao fazer login', {
        description: error.message,
      });
    } else {
      toast.success('Login realizado com sucesso!');
      setLocation('/');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-scale-in">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-center">Entrar</h1>
          <p className="text-center text-muted-foreground">
            Entre com seu e-mail e senha para acessar sua conta
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm h-auto font-normal text-muted-foreground hover:text-primary"
                onClick={() => setLocation('/recuperar-senha')}
              >
                Esqueceu sua senha?
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-4">
            <Button
              type="submit"
              className="w-full shadow-soft hover:shadow-soft-lg"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0 font-semibold text-primary hover:text-primary/80"
                onClick={() => setLocation('/cadastro')}
              >
                Cadastre-se
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
