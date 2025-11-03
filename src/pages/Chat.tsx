import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, Heart, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Chat = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadChatMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    }
  };

  const createNewChat = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Health Chat",
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Create chat if it doesn't exist
      let chatIdToUse = currentChatId;
      if (!chatIdToUse) {
        chatIdToUse = await createNewChat();
        if (!chatIdToUse) throw new Error("Failed to create chat");
        setCurrentChatId(chatIdToUse);
      }

      // Add user message to UI
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Save user message to DB
      await supabase.from("chat_messages").insert({
        chat_id: chatIdToUse,
        role: "user",
        content: userMessage,
      });

      // Call AI
      const { data, error } = await supabase.functions.invoke("health-chat", {
        body: { message: userMessage, chatId: chatIdToUse },
      });

      if (error) throw error;

      // Add AI response to UI
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save AI response to DB
      await supabase.from("chat_messages").insert({
        chat_id: chatIdToUse,
        role: "assistant",
        content: data.response,
      });

      // Update chat title if it's the first message
      if (messages.length === 0) {
        await supabase
          .from("chats")
          .update({ title: userMessage.slice(0, 50) })
          .eq("id", chatIdToUse);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-primary-light to-white dark:from-primary-light/10 dark:to-background">
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
                <h1 className="text-xl font-semibold">Health Chat</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <Card className="glass rounded-2xl border-0 p-8 text-center shadow-lg">
              <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">
                How can I help you today?
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask me about symptoms, medications, or general health questions.
              </p>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] rounded-2xl border-0 p-4 shadow-lg ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "glass-card"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="glass-card rounded-2xl border-0 p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t bg-amber-50 px-4 py-2">
        <div className="mx-auto flex max-w-4xl items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>
            This AI provides general health information only. Always consult a
            healthcare professional for medical advice.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="glass-header px-4 py-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms or ask a health question..."
            className="rounded-xl"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-primary px-6 hover:bg-primary-hover"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
