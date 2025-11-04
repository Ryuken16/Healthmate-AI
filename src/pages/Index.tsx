import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquare, FileText, Utensils, Shield, Sparkles, Zap, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-accent">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">HealthMate</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="hidden md:inline-flex"
              >
                Log In
              </Button>
              <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary-hover">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Health Assistant
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your Personal
              <span className="block text-primary mt-2">Health Companion</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto lg:mx-0">
              Get instant health insights, personalized diet plans, and 24/7 AI support. 
              Your journey to better health starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary-hover text-lg px-8 py-6"
              >
                Start Free Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="glass-button text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <Card className="glass-card p-8 relative">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Health Monitoring</p>
                    <p className="text-sm text-muted-foreground">Track your vitals daily</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">AI Chat Support</p>
                    <p className="text-sm text-muted-foreground">Ask anything, anytime</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl">
                  <Utensils className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Smart Diet Plans</p>
                    <p className="text-sm text-muted-foreground">Personalized nutrition</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold md:text-5xl mb-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you live healthier, every single day.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Health Chat</h3>
            <p className="text-muted-foreground">
              Chat with our AI assistant for instant health advice and symptom analysis.
            </p>
          </Card>

          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Health Reports</h3>
            <p className="text-muted-foreground">
              Upload and analyze your medical reports with AI-powered insights.
            </p>
          </Card>

          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <Utensils className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Diet Planning</h3>
            <p className="text-muted-foreground">
              Get personalized meal plans based on your health goals and preferences.
            </p>
          </Card>

          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your health data is encrypted and protected with enterprise-grade security.
            </p>
          </Card>

          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Access</h3>
            <p className="text-muted-foreground">
              Access your health companion anytime, anywhere, from any device.
            </p>
          </Card>

          <Card className="glass-card p-6 hover:scale-105 transition-transform">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Trusted by Thousands</h3>
            <p className="text-muted-foreground">
              Join our community of health-conscious individuals on their wellness journey.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold md:text-5xl mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust HealthMate for their daily health management.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary-hover text-lg px-12 py-6"
          >
            Start Your Journey
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass-header mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">HealthMate</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 HealthMate. Your trusted AI health companion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
