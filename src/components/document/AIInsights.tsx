import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";

type Document = {
  id: string;
  name: string;
  document_type: string;
  expiry_date: string;
  issuing_authority: string | null;
  notes: string | null;
  renewal_period_days: number | null;
};

export function AIInsights({ document }: { document: Document }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const analyzeDocument = async (type: 'classify' | 'renewal_prediction' | 'priority_scoring') => {
    setLoading(true);
    try {
      const daysUntilExpiry = Math.ceil(
        (new Date(document.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const { data, error } = await supabase.functions.invoke('ai-document-analysis', {
        body: {
          documentData: {
            ...document,
            daysUntilExpiry
          },
          analysisType: type
        }
      });

      if (error) throw error;

      setInsights({ type, data: data.analysis });
      toast({
        title: "Analysis Complete",
        description: "AI insights generated successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Get smart recommendations and predictions for this document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            variant="outline"
            onClick={() => analyzeDocument('classify')}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            Smart Classification
          </Button>
          <Button
            variant="outline"
            onClick={() => analyzeDocument('renewal_prediction')}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            Renewal Prediction
          </Button>
          <Button
            variant="outline"
            onClick={() => analyzeDocument('priority_scoring')}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
            Priority Score
          </Button>
        </div>

        {insights && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {insights.type === 'classify' && 'Classification Analysis'}
                {insights.type === 'renewal_prediction' && 'Renewal Prediction'}
                {insights.type === 'priority_scoring' && 'Priority Assessment'}
              </h4>
              {insights.data.urgencyLevel && (
                <Badge variant={
                  insights.data.urgencyLevel === 'critical' ? 'destructive' :
                  insights.data.urgencyLevel === 'high' ? 'destructive' :
                  insights.data.urgencyLevel === 'medium' ? 'default' : 'secondary'
                }>
                  {insights.data.urgencyLevel}
                </Badge>
              )}
            </div>

            {insights.type === 'classify' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Suggested Type:</span>
                  <Badge>{insights.data.suggestedType}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({Math.round(insights.data.confidence * 100)}% confident)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{insights.data.reasoning}</p>
              </div>
            )}

            {insights.type === 'renewal_prediction' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Suggested Reminder:</span>
                  <Badge>{insights.data.suggestedReminderDays} days before expiry</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insights.data.reasoning}</p>
              </div>
            )}

            {insights.type === 'priority_scoring' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Priority Score:</span>
                  <Badge variant={insights.data.priorityScore > 75 ? 'destructive' : 'default'}>
                    {insights.data.priorityScore}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Action:</strong> {insights.data.actionRecommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
