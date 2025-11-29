import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Constants for brute force protection
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'login_attempts';

interface LoginAttempts {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

// Helper functions for brute force protection
function getLoginAttempts(): LoginAttempts {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { count: 0, lastAttempt: 0, lockedUntil: null };
}

function setLoginAttempts(attempts: LoginAttempts): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

function clearLoginAttempts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Customized error messages (don't reveal if email exists)
function getErrorMessage(errorMessage: string): string {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('invalid login credentials') ||
      lowerMessage.includes('invalid email or password')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.';
  }

  if (lowerMessage.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  return 'Erro ao fazer login. Tente novamente.';
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function Login() {
  const [location, setLocation] = useLocation();
  const { signIn, loading, isAuthenticated, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Check for lockout on mount and update countdown
  useEffect(() => {
    const checkLockout = () => {
      const attempts = getLoginAttempts();
      if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
        setIsLocked(true);
        setLockoutRemaining(Math.ceil((attempts.lockedUntil - Date.now()) / 1000));
      } else if (attempts.lockedUntil && attempts.lockedUntil <= Date.now()) {
        // Lockout expired, clear it
        clearLoginAttempts();
        setIsLocked(false);
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear auth errors when component unmounts or inputs change
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if locked out
    if (isLocked) {
      toast.error('Conta temporariamente bloqueada', {
        description: `Aguarde ${Math.ceil(lockoutRemaining / 60)} minutos para tentar novamente.`,
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Track failed attempt
      const attempts = getLoginAttempts();
      const newAttempts: LoginAttempts = {
        count: attempts.count + 1,
        lastAttempt: Date.now(),
        lockedUntil: null,
      };

      // Check if should lock out
      if (newAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        newAttempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        setIsLocked(true);
        setLockoutRemaining(LOCKOUT_DURATION_MS / 1000);
        toast.error('Conta bloqueada temporariamente', {
          description: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        });
      } else {
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts.count;
        toast.error('Erro ao fazer login', {
          description: `${getErrorMessage(error.message)} (${remainingAttempts} tentativa${remainingAttempts !== 1 ? 's' : ''} restante${remainingAttempts !== 1 ? 's' : ''})`,
        });
      }

      setLoginAttempts(newAttempts);
    } else {
      // Clear attempts on successful login
      clearLoginAttempts();
      toast.success('Login realizado com sucesso!');
      setLocation('/');
    }

    setIsSubmitting(false);
  };

  // Format remaining lockout time
  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

        {/* Lockout Warning */}
        {isLocked && (
          <div
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Conta bloqueada temporariamente</p>
              <p className="text-sm text-muted-foreground">
                Tente novamente em {formatLockoutTime(lockoutRemaining)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                required
                disabled={isSubmitting || loading || isLocked}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`bg-white/50 border-primary/10 focus:border-primary/30 ${
                  errors.email ? 'border-destructive' : ''
                }`}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                  disabled={isSubmitting || loading || isLocked}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`bg-white/50 border-primary/10 focus:border-primary/30 pr-10 ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || loading || isLocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
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

          {/* Submit Button */}
          <div className="flex flex-col space-y-4 pt-4">
            <Button
              type="submit"
              className="w-full shadow-soft hover:shadow-soft-lg"
              disabled={isSubmitting || loading || isLocked}
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

            {/* Register Link */}
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
