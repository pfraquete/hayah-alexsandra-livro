import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import Checkout from "./pages/Checkout";
import MinhaContaPedidos from "./pages/MinhaContaPedidos";
import DetalhesPedido from "./pages/DetalhesPedido";
import Admin from "./pages/Admin";
import Produto from "./pages/Produto";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/produto"} component={Produto} />
      <Route path={"/404"} component={NotFound} />

      {/* Auth routes - redirect to home if already logged in */}
      <Route path={"/login"}>
        <ProtectedRoute redirectIfAuthenticated>
          <Login />
        </ProtectedRoute>
      </Route>
      <Route path={"/cadastro"}>
        <ProtectedRoute redirectIfAuthenticated>
          <Cadastro />
        </ProtectedRoute>
      </Route>
      <Route path={"/recuperar-senha"}>
        <ProtectedRoute redirectIfAuthenticated>
          <RecuperarSenha />
        </ProtectedRoute>
      </Route>

      {/* Protected routes - require authentication */}
      <Route path={"/checkout"}>
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path={"/minha-conta/pedidos"}>
        <ProtectedRoute>
          <MinhaContaPedidos />
        </ProtectedRoute>
      </Route>
      <Route path={"/minha-conta/pedidos/:id"}>
        {(params) => (
          <ProtectedRoute>
            <DetalhesPedido />
          </ProtectedRoute>
        )}
      </Route>

      {/* Admin route - has its own internal role check */}
      <Route path={"/admin"}>
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      </Route>

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
