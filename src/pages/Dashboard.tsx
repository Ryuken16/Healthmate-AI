import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  Salad,
  LogOut,
  Heart,
  Clock,
} from "lucide-react";

interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

interface Report {
  id: string;
  title: string;
  created_at: string;
  summary: string | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch recent chats
      const { data: chatsData } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch recent reports
      const { data: reportsData } = await supabase
        .from("health_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setChats(chatsData || []);
      setReports(reportsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white dark:from-primary-light/10 dark:to-background">
      {/* Header */}
      <header className="glass-header">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                HealthMate AI
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={signOut}
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back! 👋
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here's what's happening with your health today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card
            className="glass-card cursor-pointer rounded-2xl border-0 p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate("/chat")}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Chat with AI</h3>
            <p className="text-sm text-muted-foreground">
              Get instant health insights and advice
            </p>
          </Card>

          <Card
            className="glass-card cursor-pointer rounded-2xl border-0 p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate("/reports")}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Upload Reports</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered report summaries
            </p>
          </Card>

          <Card
            className="glass-card cursor-pointer rounded-2xl border-0 p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate("/diet")}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Salad className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Diet Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Personalized nutrition advice
            </p>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Chats */}
          <Card className="glass-card rounded-2xl border-0 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold">Recent Chats</h3>
            {chats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chats yet. Start a conversation!
              </p>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{chat.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(chat.updated_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Reports */}
          <Card className="glass-card rounded-2xl border-0 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold">Recent Reports</h3>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reports yet. Upload your first report!
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-accent"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <span className="block text-sm font-medium">
                          {report.title}
                        </span>
                        {report.summary && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {report.summary}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
