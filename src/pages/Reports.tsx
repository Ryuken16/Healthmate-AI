import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Report {
  id: string;
  title: string;
  summary: string | null;
  report_date: string | null;
  created_at: string;
}

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("health_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // In a real app, you'd upload to storage here
      // For now, we'll just create a report with the filename

      // Call edge function to analyze the report
      const { data, error } = await supabase.functions.invoke(
        "analyze-report",
        {
          body: { fileName: file.name },
        }
      );

      if (error) throw error;

      // Save report to database
      const { error: dbError } = await supabase.from("health_reports").insert({
        user_id: user.id,
        title: file.name,
        summary: data.summary,
        report_date: new Date().toISOString().split("T")[0],
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Report uploaded and analyzed successfully",
      });

      fetchReports();
    } catch (error: any) {
      console.error("Error uploading report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload report",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
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
              <h1 className="text-xl font-semibold">Medical Reports</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Upload Section */}
        <Card className="mb-8 rounded-2xl border-0 p-8 text-center shadow-lg">
          <Upload className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-2 text-xl font-semibold">Upload Medical Report</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload your medical reports and get AI-powered summaries
          </p>
          <label htmlFor="file-upload">
            <Button
              disabled={uploading}
              className="rounded-xl bg-primary hover:bg-primary-hover"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Supports PDF, JPG, PNG
          </p>
        </Card>

        {/* Reports List */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Your Reports</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <Card className="rounded-2xl border-0 bg-white p-8 text-center shadow-sm">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No reports yet. Upload your first report!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="cursor-pointer rounded-2xl border-0 p-6 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">{report.title}</h3>
                      {report.summary && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          {report.summary}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Uploaded on {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
