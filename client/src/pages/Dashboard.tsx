import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BookOpen, ShoppingBag, Users, Star } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Visitante';

    const quickActions = [
        {
            title: "Comunidade",
            description: "Conecte-se com outras mulheres e compartilhe experiências.",
            icon: Users,
            action: () => setLocation("/comunidade"),
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            title: "Meus Cursos",
            description: "Continue seus estudos de onde parou.",
            icon: BookOpen,
            action: () => setLocation("/meus-cursos"),
            color: "text-purple-500",
            bgColor: "bg-purple-50",
        },
        {
            title: "Marketplace",
            description: "Descubra novos conteúdos e produtos digitais.",
            icon: ShoppingBag,
            action: () => setLocation("/marketplace"),
            color: "text-pink-500",
            bgColor: "bg-pink-50",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Olá, <span className="text-primary">{userName}</span>! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bem-vinda de volta ao seu espaço de crescimento e conexão.
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((item) => (
                    <Card
                        key={item.title}
                        className="glass-card hover:shadow-lg transition-all cursor-pointer border-none"
                        onClick={item.action}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {item.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${item.bgColor}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mt-2">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity or Featured Content could go here */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle>Novidades da Comunidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            Nenhuma atividade recente para mostrar. Comece a interagir na comunidade!
                        </p>
                        <Button
                            variant="link"
                            className="px-0 mt-4 text-primary"
                            onClick={() => setLocation("/comunidade")}
                        >
                            Ir para a Comunidade &rarr;
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle>Cursos em Destaque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            Explore novos cursos para impulsionar sua jornada.
                        </p>
                        <Button
                            variant="link"
                            className="px-0 mt-4 text-primary"
                            onClick={() => setLocation("/marketplace")}
                        >
                            Ver Marketplace &rarr;
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
