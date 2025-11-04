import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Utensils, Loader2, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Diet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-diet-suggestions",
        {
          body: { prompt: prompt.trim() },
        }
      );

      if (error) throw error;

      setSuggestions(data.suggestions);
      toast({
        title: "Success!",
        description: "Your personalized diet plan is ready",
      });
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate diet plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-accent">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Utensils className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold hidden sm:inline">Diet Planner</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="glass-card p-6 md:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">AI-Powered Diet Plans</h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  Get personalized meal plans tailored to your goals
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="glass-card rounded-2xl border-primary/10 p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold">Tell Us Your Goals</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Describe your dietary preferences, health goals, restrictions, and lifestyle.
              </p>
            </div>

            <div className="mb-6">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: I want to lose 10kg, I'm vegetarian, exercise 3x/week. Allergic to nuts. I prefer Mediterranean cuisine and need high-protein meals..."
                className="min-h-[200px] md:min-h-[250px] rounded-xl bg-card/50 border-primary/20 focus:border-primary text-sm md:text-base"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="w-full rounded-xl bg-primary hover:bg-primary-hover h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Diet Plan
                </>
              )}
            </Button>
          </Card>

          {/* Results Section */}
          {suggestions ? (
            <Card className="glass-card rounded-2xl border-primary/10 p-6 md:p-8 shadow-xl lg:row-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Utensils className="h-6 w-6 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h3>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {suggestions}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="glass-card rounded-2xl border-primary/10 p-8 shadow-xl flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <Utensils className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Your personalized diet plan will appear here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diet;
