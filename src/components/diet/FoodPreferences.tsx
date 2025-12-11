import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, AlertCircle } from "lucide-react";

interface FoodPreferencesProps {
  dislikedFoods: string[];
  onAddDislike: (food: string) => void;
  onRemoveDislike: (food: string) => void;
  allergies: string[];
  onAddAllergy: (allergy: string) => void;
  onRemoveAllergy: (allergy: string) => void;
}

export function FoodPreferences({
  dislikedFoods,
  onAddDislike,
  onRemoveDislike,
  allergies,
  onAddAllergy,
  onRemoveAllergy,
}: FoodPreferencesProps) {
  const [newDislike, setNewDislike] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikedFoods.includes(newDislike.trim().toLowerCase())) {
      onAddDislike(newDislike.trim().toLowerCase());
      setNewDislike("");
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim().toLowerCase())) {
      onAddAllergy(newAllergy.trim().toLowerCase());
      setNewAllergy("");
    }
  };

  return (
    <Card className="p-4 space-y-4 glass-card border-primary/10">
      {/* Allergies */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium">Allergies & Restrictions</p>
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddAllergy()}
            placeholder="e.g., peanuts, gluten"
            className="h-9 text-sm rounded-lg"
          />
          <Button size="sm" onClick={handleAddAllergy} className="rounded-lg">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {allergies.map((allergy) => (
            <Badge
              key={allergy}
              variant="destructive"
              className="cursor-pointer hover:bg-destructive/80"
              onClick={() => onRemoveAllergy(allergy)}
            >
              {allergy}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {allergies.length === 0 && (
            <span className="text-xs text-muted-foreground">No allergies added</span>
          )}
        </div>
      </div>

      {/* Disliked Foods */}
      <div>
        <p className="text-sm font-medium mb-2">Foods to Avoid</p>
        <div className="flex gap-2 mb-2">
          <Input
            value={newDislike}
            onChange={(e) => setNewDislike(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddDislike()}
            placeholder="e.g., broccoli, tofu"
            className="h-9 text-sm rounded-lg"
          />
          <Button size="sm" onClick={handleAddDislike} className="rounded-lg">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {dislikedFoods.map((food) => (
            <Badge
              key={food}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onRemoveDislike(food)}
            >
              {food}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {dislikedFoods.length === 0 && (
            <span className="text-xs text-muted-foreground">No foods excluded</span>
          )}
        </div>
      </div>
    </Card>
  );
}
