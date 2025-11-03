import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Salad, Heart, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DietSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

const Diet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<DietSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("diet_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-diet-suggestions",
        {
          body: { userId: user.id },
        }
      );

      if (error) throw error;

      toast({
        title: "Success!",
        description: "New diet suggestions generated",
      });

      fetchSuggestions();
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate suggestions",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-orange-100 text-orange-800",
      lunch: "bg-blue-100 text-blue-800",
      dinner: "bg-purple-100 text-purple-800",
      snack: "bg-green-100 text-green-800",
      lifestyle: "bg-pink-100 text-pink-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white dark:from-primary-light/10 dark:to-background">
      {/* Header */}
      <header className="glass-header">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Diet Suggestions</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Generate Section */}
        <Card className="glass-card mb-8 rounded-2xl border-0 p-8 text-center shadow-xl">
          <Salad className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-2 text-xl font-semibold">
            Personalized Diet Plan
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Get AI-powered nutrition advice based on your health profile
          </p>
          <Button
            onClick={generateSuggestions}
            disabled={generating}
            className="rounded-xl bg-primary hover:bg-primary-hover"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Suggestions
              </>
            )}
          </Button>
        </Card>

        {/* Suggestions List */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Your Suggestions</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <Card className="glass rounded-2xl border-0 p-8 text-center shadow-lg">
              <Salad className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No suggestions yet. Generate your first plan!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="glass-card rounded-2xl border-0 p-6 shadow-xl"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(
                        suggestion.category
                      )}`}
                    >
                      {suggestion.category}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Diet;
