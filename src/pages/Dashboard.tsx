import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DocumentStats } from "@/components/dashboard/DocumentStats";
import { DocumentTypeChart } from "@/components/dashboard/DocumentTypeChart";
import { ExpiryTimeline } from "@/components/dashboard/ExpiryTimeline";

interface Document {
  id: string;
  name: string;
  document_type: string;
  expiry_date: string;
  created_at: string;
}

interface DashboardStats {
  total: number;
  expiringSoon: number;
  expired: number;
  valid: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, expiringSoon: 0, expired: 0, valid: 0 });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [typeData, setTypeData] = useState<Array<{ name: string; value: number }>>([]);
  const [timelineData, setTimelineData] = useState<Array<{ month: string; expiring: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all documents for stats
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const total = documents?.length || 0;
      const expired = documents?.filter(doc => new Date(doc.expiry_date) < today).length || 0;
      const expiringSoon = documents?.filter(doc => {
        const expiryDate = new Date(doc.expiry_date);
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      }).length || 0;
      const valid = total - expired - expiringSoon;

      setStats({ total, expiringSoon, expired, valid });
      setRecentDocuments(documents?.slice(0, 3) || []);

      // Calculate document type distribution
      const typeCounts: Record<string, number> = {};
      documents?.forEach(doc => {
        const type = doc.document_type.replace('_', ' ');
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      setTypeData(
        Object.entries(typeCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
      );

      // Calculate expiry timeline (next 6 months)
      const monthCounts: Record<string, number> = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthCounts[monthKey] = 0;
      }

      documents?.forEach(doc => {
        const expiryDate = new Date(doc.expiry_date);
        const monthKey = `${monthNames[expiryDate.getMonth()]} ${expiryDate.getFullYear()}`;
        
        if (monthCounts.hasOwnProperty(monthKey)) {
          monthCounts[monthKey]++;
        }
      });

      setTimelineData(
        Object.entries(monthCounts).map(([month, expiring]) => ({
          month,
          expiring,
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-accent text-accent-foreground">Valid</Badge>;
    }
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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your document overview.</p>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <DocumentStats
          total={stats.total}
          expiringSoon={stats.expiringSoon}
          expired={stats.expired}
          valid={stats.valid}
        />

        {/* Charts */}
        <div className="space-y-4">
          <DocumentTypeChart data={typeData} />
          <ExpiryTimeline data={timelineData} />
        </div>

        {/* Quick Action */}
        <Link to="/scan">
          <Button className="w-full" size="lg">
            <Camera className="h-5 w-5 mr-2" />
            Scan New Document
          </Button>
        </Link>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/document/${doc.id}`}
                    className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.document_type.replace('_', ' ')} • Expires {new Date(doc.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(doc.expiry_date)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}