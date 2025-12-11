import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShoppingCart, Save, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DietPlanDisplayProps {
  suggestions: string;
  onRegenerate: (section: string) => Promise<void>;
  onSave: () => Promise<void>;
  loading: boolean;
}

export function DietPlanDisplay({ suggestions, onRegenerate, onSave, loading }: DietPlanDisplayProps) {
  const { toast } = useToast();
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRegenerate = async (section: string) => {
    setRegeneratingSection(section);
    try {
      await onRegenerate(section);
      toast({
        title: "Regenerated!",
        description: `${section} has been updated with new suggestions.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate section",
        variant: "destructive",
      });
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      toast({
        title: "Saved!",
        description: "Your diet plan has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save diet plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateGroceryList = () => {
    toast({
      title: "Grocery List",
      description: "Check your diet plan for ingredient details. Feature coming soon!",
    });
  };

  const mealSections = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-xl"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Plan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={generateGroceryList}
          className="rounded-xl"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Grocery List
        </Button>
      </div>

      {/* Diet Plan Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {suggestions}
        </div>
      </div>

      {/* Quick Regenerate Options */}
      <div className="border-t border-border/50 pt-4">
        <p className="text-sm text-muted-foreground mb-3">Regenerate specific meals:</p>
        <div className="flex flex-wrap gap-2">
          {mealSections.map((section) => (
            <Button
              key={section}
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate(section)}
              disabled={regeneratingSection !== null || loading}
              className="rounded-xl"
            >
              {regeneratingSection === section ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-2" />
              )}
              {section}
            </Button>
          ))}
        </div>
      </div>

      {/* Meal Prep Tips */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Meal Prep Tip</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prepare ingredients on Sunday for easier weekday cooking. Store prepped veggies in airtight containers.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
