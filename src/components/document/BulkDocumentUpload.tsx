import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BulkDocument = {
  name: string;
  document_type: 'license' | 'passport' | 'permit' | 'insurance' | 'certification' | 'other';
  expiry_date: string;
  issuing_authority?: string;
  notes?: string;
};

export function BulkDocumentUpload({ 
  userId, 
  organizationId,
  onComplete 
}: { 
  userId: string;
  organizationId?: string | null;
  onComplete?: () => void;
}) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<BulkDocument[]>([
    { name: '', document_type: 'license', expiry_date: '' }
  ]);
  const [uploading, setUploading] = useState(false);

  const addDocument = () => {
    setDocuments([...documents, { name: '', document_type: 'license', expiry_date: '' }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof BulkDocument, value: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  const handleBulkUpload = async () => {
    // Validate all documents
    const invalid = documents.some(doc => !doc.name || !doc.expiry_date);
    if (invalid) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and expiry date for all documents",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // Prepare documents for insertion
    const docsToInsert = documents.map(doc => ({
      user_id: userId,
      organization_id: organizationId,
      name: doc.name,
      document_type: doc.document_type,
      expiry_date: doc.expiry_date,
      issuing_authority: doc.issuing_authority || null,
      notes: doc.notes || null,
      renewal_period_days: 30,
    }));

    const { error } = await supabase
      .from('documents')
      .insert(docsToInsert);

    if (error) {
      console.error("Bulk upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Successfully uploaded ${documents.length} document(s)`,
      });
      setDocuments([{ name: '', document_type: 'license', expiry_date: '' }]);
      onComplete?.();
    }

    setUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Document Upload
        </CardTitle>
        <CardDescription>
          Add multiple documents at once for faster processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 relative">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">Document {index + 1}</Badge>
              {documents.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Document Name *</Label>
                <Input
                  placeholder="e.g., Driver's License"
                  value={doc.name}
                  onChange={(e) => updateDocument(index, 'name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select
                  value={doc.document_type}
                  onValueChange={(value: any) => updateDocument(index, 'document_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={doc.expiry_date}
                  onChange={(e) => updateDocument(index, 'expiry_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                <Input
                  placeholder="e.g., DMV"
                  value={doc.issuing_authority || ''}
                  onChange={(e) => updateDocument(index, 'issuing_authority', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Additional notes"
                  value={doc.notes || ''}
                  onChange={(e) => updateDocument(index, 'notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addDocument} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Add Another Document
          </Button>
          <Button onClick={handleBulkUpload} disabled={uploading} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : `Upload ${documents.length} Document(s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
