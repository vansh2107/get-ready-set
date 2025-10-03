import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  document_type: z.enum(["license", "passport", "permit", "insurance", "certification", "other"]),
  issuing_authority: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required"),
  renewal_period_days: z.number().min(1, "Renewal period must be at least 1 day").max(365, "Renewal period cannot exceed 365 days"),
  notes: z.string().optional(),
});

export default function EditDocument() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    document_type: "",
    issuing_authority: "",
    expiry_date: "",
    renewal_period_days: 30,
    notes: "",
  });

  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Error",
          description: "Document not found",
          variant: "destructive",
        });
        navigate('/documents');
        return;
      }

      setFormData({
        name: data.name || "",
        document_type: data.document_type || "",
        issuing_authority: data.issuing_authority || "",
        expiry_date: data.expiry_date || "",
        renewal_period_days: data.renewal_period_days || 30,
        notes: data.notes || "",
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const validatedData = documentSchema.parse({
        ...formData,
        document_type: formData.document_type as any,
      });

      const { error } = await supabase
        .from('documents')
        .update({
          name: validatedData.name,
          document_type: validatedData.document_type,
          issuing_authority: validatedData.issuing_authority,
          expiry_date: validatedData.expiry_date,
          renewal_period_days: validatedData.renewal_period_days,
          notes: validatedData.notes,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Document updated",
        description: "Your document has been successfully updated.",
      });

      navigate(`/document/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Failed to update document. Please try again.");
        console.error('Error updating document:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/document/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Document</h1>
            <p className="text-muted-foreground">Update document information</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Driver's License"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(value) => handleInputChange("document_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) => handleInputChange("issuing_authority", e.target.value)}
                  placeholder="e.g., Department of Motor Vehicles"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewal_period_days">
                  Reminder Days Before Expiry *
                </Label>
                <Input
                  id="renewal_period_days"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.renewal_period_days}
                  onChange={(e) => handleInputChange("renewal_period_days", parseInt(e.target.value))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  You'll be reminded this many days before the document expires
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this document..."
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/document/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
