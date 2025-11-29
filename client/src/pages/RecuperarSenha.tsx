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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">E-mail Enviado!</CardTitle>
            <CardDescription className="text-center">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => setLocation('/login')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
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
              className="w-full"
              onClick={() => setLocation('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
