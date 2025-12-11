import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Loader2, Sparkles, Heart, History, Settings } from "lucide-react";
import { DietPlanDisplay } from "@/components/diet/DietPlanDisplay";
import { FoodPreferences } from "@/components/diet/FoodPreferences";

interface SavedPlan {
  id: string;
  content: string;
  created_at: string;
  prompt: string;
}

const Diet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    // Load preferences from localStorage
    const savedDislikes = localStorage.getItem("dislikedFoods");
    const savedAllergies = localStorage.getItem("allergies");
    if (savedDislikes) setDislikedFoods(JSON.parse(savedDislikes));
    if (savedAllergies) setAllergies(JSON.parse(savedAllergies));
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem("dislikedFoods", JSON.stringify(dislikedFoods));
    localStorage.setItem("allergies", JSON.stringify(allergies));
  }, [dislikedFoods, allergies]);

  const buildPromptWithPreferences = (basePrompt: string) => {
    let enhancedPrompt = basePrompt;
    
    if (allergies.length > 0) {
      enhancedPrompt += `\n\nIMPORTANT: I have allergies/restrictions to: ${allergies.join(", ")}. Do NOT include any of these ingredients.`;
    }
    
    if (dislikedFoods.length > 0) {
      enhancedPrompt += `\n\nI don't like these foods, please avoid them: ${dislikedFoods.join(", ")}.`;
    }
    
    return enhancedPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const enhancedPrompt = buildPromptWithPreferences(prompt.trim());
      
      const { data, error } = await supabase.functions.invoke(
        "generate-diet-suggestions",
        {
          body: { userId: user.id, prompt: enhancedPrompt },
        }
      );

      if (error) throw error;

      if (typeof data.suggestions === 'string') {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(JSON.stringify(data.suggestions, null, 2));
      }
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

  const handleRegenerate = async (section: string) => {
    if (!user || !suggestions) return;

    setLoading(true);
    try {
      const regeneratePrompt = buildPromptWithPreferences(
        `Based on my previous diet plan, please regenerate ONLY the ${section} section with different options. Keep it in the same format. Previous plan context: ${prompt}`
      );
      
      const { data, error } = await supabase.functions.invoke(
        "generate-diet-suggestions",
        {
          body: { 
            userId: user.id, 
            prompt: regeneratePrompt,
            regenerateSection: section 
          },
        }
      );

      if (error) throw error;

      const newSuggestion = typeof data.suggestions === 'string' 
        ? data.suggestions 
        : JSON.stringify(data.suggestions, null, 2);

      // Simple replacement - in production you'd want smarter parsing
      setSuggestions(prev => `${prev}\n\n--- Updated ${section} ---\n${newSuggestion}`);
    } catch (error: any) {
      console.error("Error regenerating section:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!suggestions) return;
    
    // Save to localStorage for now (could be database in production)
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      content: suggestions,
      created_at: new Date().toISOString(),
      prompt: prompt,
    };
    
    const existingPlans = JSON.parse(localStorage.getItem("savedDietPlans") || "[]");
    localStorage.setItem("savedDietPlans", JSON.stringify([newPlan, ...existingPlans.slice(0, 9)]));
    setSavedPlans([newPlan, ...savedPlans.slice(0, 9)]);
  };

  const loadSavedPlans = () => {
    const plans = JSON.parse(localStorage.getItem("savedDietPlans") || "[]");
    setSavedPlans(plans);
    setActiveTab("history");
  };

  const loadPlan = (plan: SavedPlan) => {
    setSuggestions(plan.content);
    setPrompt(plan.prompt);
    setActiveTab("generate");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-primary-light via-background to-accent p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-card/50">
            <TabsTrigger value="generate" className="rounded-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg" onClick={loadSavedPlans}>
              <History className="h-4 w-4 mr-2" />
              Saved Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
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

                {(allergies.length > 0 || dislikedFoods.length > 0) && (
                  <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground">
                      Your preferences will be applied: 
                      {allergies.length > 0 && ` ${allergies.length} allergies`}
                      {dislikedFoods.length > 0 && ` ${dislikedFoods.length} foods to avoid`}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: I want to lose 10kg, I'm vegetarian, exercise 3x/week. I prefer Mediterranean cuisine and need high-protein meals..."
                    className="min-h-[200px] md:min-h-[250px] rounded-xl bg-card/50 border-primary/20 focus:border-primary text-sm md:text-base"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 h-12 text-base"
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
                <Card className="glass-card rounded-2xl border-primary/10 p-6 md:p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Utensils className="h-6 w-6 text-primary" />
                    <h3 className="text-xl md:text-2xl font-bold">Your Personalized Plan</h3>
                  </div>
                  <DietPlanDisplay
                    suggestions={suggestions}
                    onRegenerate={handleRegenerate}
                    onSave={handleSave}
                    loading={loading}
                  />
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
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="glass-card rounded-2xl border-primary/10 p-6 md:p-8 shadow-xl max-w-2xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Food Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Set your allergies and foods to avoid. These will be automatically applied to all generated diet plans.
                </p>
              </div>
              <FoodPreferences
                dislikedFoods={dislikedFoods}
                onAddDislike={(food) => setDislikedFoods([...dislikedFoods, food])}
                onRemoveDislike={(food) => setDislikedFoods(dislikedFoods.filter(f => f !== food))}
                allergies={allergies}
                onAddAllergy={(allergy) => setAllergies([...allergies, allergy])}
                onRemoveAllergy={(allergy) => setAllergies(allergies.filter(a => a !== allergy))}
              />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {savedPlans.length === 0 ? (
                <Card className="glass-card rounded-2xl border-primary/10 p-8 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No saved diet plans yet</p>
                </Card>
              ) : (
                savedPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="glass-card rounded-2xl border-primary/10 p-6 cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => loadPlan(plan)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{plan.prompt}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg shrink-0">
                        Load
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Diet;
