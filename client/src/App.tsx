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
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";

// Community Pages
import Feed from "./pages/comunidade/Feed";
import CreatorProfile from "./pages/comunidade/CreatorProfile";
import TornarCriadora from "./pages/comunidade/TornarCriadora";

// Marketplace Pages
import Marketplace from "./pages/Marketplace";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import CoursePlayer from "./pages/CoursePlayer";

// Creator Pages
import NovoPost from "./pages/criadora/NovoPost";
import MeusProdutos from "./pages/criadora/MeusProdutos";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/produto"} component={Produto} />
      <Route path={"/404"} component={NotFound} />

      {/* Auth routes - redirect to dashboard if already logged in */}
      <Route path={"/login"}>
        <ProtectedRoute redirectIfAuthenticated authenticatedRedirectTo="/dashboard">
          <Login />
        </ProtectedRoute>
      </Route>
      <Route path={"/cadastro"}>
        <ProtectedRoute redirectIfAuthenticated authenticatedRedirectTo="/dashboard">
          <Cadastro />
        </ProtectedRoute>
      </Route>
      <Route path={"/recuperar-senha"}>
        <ProtectedRoute redirectIfAuthenticated authenticatedRedirectTo="/dashboard">
          <RecuperarSenha />
        </ProtectedRoute>
      </Route>

      {/* Protected routes - require authentication */}
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path={"/checkout"}>
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path={"/minha-conta/pedidos"}>
        <ProtectedRoute>
          <DashboardLayout>
            <MinhaContaPedidos />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/minha-conta/pedidos/:id"}>
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <DetalhesPedido />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Admin route - has its own internal role check */}
      <Route path={"/admin"}>
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      </Route>

      {/* Community routes */}
      <Route path={"/comunidade"}>
        <ProtectedRoute>
          <DashboardLayout>
            <Feed />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/comunidade/explorar"}>
        <ProtectedRoute>
          <DashboardLayout>
            <Feed />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/comunidade/criadora/:id"}>
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <CreatorProfile />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/comunidade/tornar-criadora"}>
        <ProtectedRoute>
          <DashboardLayout>
            <TornarCriadora />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      {/* Marketplace routes */}
      <Route path={"/marketplace"}>
        <ProtectedRoute>
          <DashboardLayout>
            <Marketplace />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/curso/:slug"}>
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <CourseDetails />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/curso/:slug/assistir"}>
        <ProtectedRoute>
          <CoursePlayer />
        </ProtectedRoute>
      </Route>
      <Route path={"/meus-cursos"}>
        <ProtectedRoute>
          <DashboardLayout>
            <MyCourses />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      {/* Creator routes */}
      <Route path={"/criadora/novo-post"}>
        <ProtectedRoute>
          <DashboardLayout>
            <NovoPost />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/criadora/cursos"}>
        <ProtectedRoute>
          <DashboardLayout>
            <MeusProdutos />
          </DashboardLayout>
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
