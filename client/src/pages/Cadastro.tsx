import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    const { error } = await signUp(formData.email, formData.password, {
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
    });

    if (error) {
      toast.error('Erro ao criar conta', {
        description: error.message,
      });
    } else {
      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu e-mail para confirmar o cadastro.',
      });
      setLocation('/login');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-scale-in">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-center">Criar Conta</h1>
          <p className="text-center text-muted-foreground">
            Preencha seus dados para criar uma conta
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isSubmitting || loading}
                className="bg-white/50 border-primary/10 focus:border-primary/30"
              />
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
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0 font-semibold text-primary hover:text-primary/80"
                onClick={() => setLocation('/login')}
              >
                Entrar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
