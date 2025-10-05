import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RenewalAdvisorProps {
  documentType?: string;
  documentName?: string;
  expiryDate?: string;
}

export function RenewalAdvisor({ documentType, documentName, expiryDate }: RenewalAdvisorProps) {
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAdvice = async (customQuestion?: string) => {
    setLoading(true);
    setAdvice("");

    try {
      const { data, error } = await supabase.functions.invoke('document-renewal-advisor', {
        body: {
          documentType,
          documentName,
          expiryDate,
          question: customQuestion || question
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            title: "Credits needed",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setAdvice(data.advice);
    } catch (error) {
      console.error('Error getting renewal advice:', error);
      toast({
        title: "Error",
        description: "Failed to get renewal advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What documents do I need for renewal?",
    "How long does the renewal process take?",
    "What are the common renewal mistakes to avoid?",
    "Can I renew online?",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Renewal Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!advice ? (
          <>
            <p className="text-sm text-muted-foreground">
              Ask me anything about document renewal requirements
            </p>

            {/* Quick Questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => getAdvice(q)}
                    disabled={loading}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Question */}
            <div className="space-y-2">
              <Textarea
                placeholder="Or type your own question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={() => getAdvice()} 
                disabled={!question.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {advice}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setAdvice("");
                setQuestion("");
              }}
              className="w-full"
            >
              Ask Another Question
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
