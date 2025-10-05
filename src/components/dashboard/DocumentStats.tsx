import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocumentStatsProps {
  total: number;
  expiringSoon: number;
  expired: number;
  valid: number;
}

export function DocumentStats({ total, expiringSoon, expired, valid }: DocumentStatsProps) {
  const navigate = useNavigate();

  const handleCardClick = (status: string) => {
    navigate(`/documents?status=${status}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card 
        className="cursor-pointer hover:shadow-lg hover:scale-105 smooth"
        onClick={() => handleCardClick('all')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Total Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg hover:scale-105 smooth"
        onClick={() => handleCardClick('valid')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            Valid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{valid}</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg hover:scale-105 smooth"
        onClick={() => handleCardClick('expiring')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{expiringSoon}</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg hover:scale-105 smooth"
        onClick={() => handleCardClick('expired')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Expired
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{expired}</div>
        </CardContent>
      </Card>
    </div>
  );
}
