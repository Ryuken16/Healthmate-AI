import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Utensils, Sparkles, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: MessageSquare,
      title: "Health Chat",
      description: "Ask our AI assistant anything",
      path: "/chat",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Utensils,
      title: "Diet Plan",
      description: "Generate personalized meal plans",
      path: "/diet",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: FileText,
      title: "Health Reports",
      description: "Analyze your medical reports",
      path: "/reports",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-primary-light via-background to-accent p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="glass-card p-6 md:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Welcome back!</h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  {user?.email}
                </p>
              </div>
            </div>
            <p className="text-base md:text-lg">
              How can I help you with your health today?
            </p>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                <p className="text-3xl font-bold">85</p>
              </div>
              <Activity className="h-10 w-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Days</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="glass-card p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Consultations</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <MessageSquare className="h-10 w-10 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card
                key={action.path}
                className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300 group"
                onClick={() => navigate(action.path)}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                <p className="text-muted-foreground text-sm">{action.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
          <Card className="glass-card p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <MessageSquare className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">Health Consultation</p>
                  <p className="text-sm text-muted-foreground">Discussed symptoms and got recommendations</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">2 hours ago</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Utensils className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">Diet Plan Generated</p>
                  <p className="text-sm text-muted-foreground">Created a new meal plan for weight loss</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">1 day ago</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">Report Analyzed</p>
                  <p className="text-sm text-muted-foreground">Blood test results reviewed</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">3 days ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
