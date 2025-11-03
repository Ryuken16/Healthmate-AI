import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const systemPrompt = `You are a nutrition and wellness advisor for HealthMate AI. Generate personalized diet and lifestyle suggestions that are:

1. Practical and easy to follow
2. Nutritionally balanced
3. Culturally sensitive
4. Based on general health principles

Generate exactly 5 suggestions with these categories:
- breakfast: Morning meal ideas
- lunch: Midday meal ideas
- dinner: Evening meal ideas
- snack: Healthy snacking options
- lifestyle: General wellness and lifestyle tips

For each suggestion, provide:
- A catchy, friendly title
- A detailed description (2-3 sentences)
- Practical tips or specific food recommendations

Format your response as a JSON array with objects containing: title, description, category`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Generate 5 personalized diet and lifestyle suggestions for a health-conscious individual.",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response and save to database
    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback suggestions
      suggestions = [
        {
          title: "Start Your Day Right",
          description:
            "Begin with a protein-rich breakfast like Greek yogurt with berries and nuts. This helps maintain stable blood sugar levels throughout the morning.",
          category: "breakfast",
        },
        {
          title: "Power Lunch Bowl",
          description:
            "Create a colorful bowl with quinoa, grilled chicken, mixed vegetables, and avocado. Include leafy greens for extra nutrients.",
          category: "lunch",
        },
        {
          title: "Light Evening Meal",
          description:
            "Opt for grilled fish with steamed vegetables and brown rice. Keep dinner lighter to improve sleep quality and digestion.",
          category: "dinner",
        },
        {
          title: "Smart Snacking",
          description:
            "Choose nuts, fruits, or veggie sticks with hummus between meals. These provide sustained energy without blood sugar spikes.",
          category: "snack",
        },
        {
          title: "Stay Hydrated",
          description:
            "Drink at least 8 glasses of water daily. Add lemon or cucumber for flavor. Proper hydration supports all bodily functions.",
          category: "lifestyle",
        },
      ];
    }

    // Save suggestions to database
    const suggestionsToInsert = suggestions.map((s: any) => ({
      user_id: userId,
      title: s.title,
      description: s.description,
      category: s.category,
    }));

    const { error: dbError } = await supabase
      .from("diet_suggestions")
      .insert(suggestionsToInsert);

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-diet-suggestions function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
