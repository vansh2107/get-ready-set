import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  document_type: string;
  expiry_date: string;
  created_at: string;
}

interface ExpiryTimelineProps {
  data: Array<{ month: string; expiring: number }>;
  documents: Document[];
}

type TimeRange = '6' | '12' | 'all';
type FilterType = 'upcoming' | 'expired' | 'all';

export function ExpiryTimeline({ data, documents }: ExpiryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('6');
  const [filter, setFilter] = useState<FilterType>('upcoming');

  const calculateTimelineData = (range: TimeRange, filterType: FilterType) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts: Record<string, number> = {};
    const today = new Date();
    
    // Determine time range
    let monthsToShow = range === '6' ? 6 : range === '12' ? 12 : 24;
    let startMonth = 0;
    
    // For expired filter, show past months
    if (filterType === 'expired') {
      startMonth = -monthsToShow;
      monthsToShow = 0;
    } else if (filterType === 'all') {
      startMonth = -12;
      monthsToShow = 12;
    }
    
    // Initialize months
    for (let i = startMonth; i < monthsToShow; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthCounts[monthKey] = 0;
    }

    // Filter documents based on filter type
    const filteredDocs = documents.filter(doc => {
      const expiryDate = new Date(doc.expiry_date);
      if (filterType === 'upcoming') {
        return expiryDate >= today;
      } else if (filterType === 'expired') {
        return expiryDate < today;
      }
      return true; // 'all'
    });

    // Count documents per month
    filteredDocs.forEach(doc => {
      const expiryDate = new Date(doc.expiry_date);
      const monthKey = `${monthNames[expiryDate.getMonth()]} ${expiryDate.getFullYear()}`;
      
      if (monthCounts.hasOwnProperty(monthKey)) {
        monthCounts[monthKey]++;
      }
    });

    return Object.entries(monthCounts).map(([month, expiring]) => ({
      month,
      expiring,
    }));
  };

  const getFilteredDocuments = () => {
    const today = new Date();
    return documents.filter(doc => {
      const expiryDate = new Date(doc.expiry_date);
      if (filter === 'upcoming') {
        return expiryDate >= today;
      } else if (filter === 'expired') {
        return expiryDate < today;
      }
      return true;
    }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  };

  const getStatusBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground text-xs">Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">Valid</Badge>;
    }
  };

  const chartData = isExpanded ? calculateTimelineData(timeRange, filter) : data;
  const filteredDocuments = getFilteredDocuments();

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiry Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No documents to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Expiry Timeline
          </CardTitle>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className={isExpanded ? "animate-scale-in" : ""}>
          <ResponsiveContainer width="100%" height={isExpanded ? 300 : 250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={isExpanded ? -45 : 0}
                textAnchor={isExpanded ? "end" : "middle"}
                height={isExpanded ? 80 : 30}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar 
                dataKey="expiring" 
                fill={filter === 'expired' ? "hsl(var(--destructive))" : "hsl(var(--primary))"} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in">
            {/* Time Range Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ZoomIn className="h-4 w-4" />
                Time Range:
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={timeRange === '6' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('6')}
                >
                  6 Months
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === '12' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('12')}
                >
                  12 Months
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === 'all' ? 'default' : 'outline'}
                  onClick={() => setTimeRange('all')}
                >
                  All Time
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Show:
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === 'upcoming' ? 'default' : 'outline'}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'expired' ? 'default' : 'outline'}
                  onClick={() => setFilter('expired')}
                >
                  Expired
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
              </div>
            </div>

            {/* Document List */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <p className="text-sm font-semibold">
                  {filteredDocuments.length} Document{filteredDocuments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No documents match the current filter
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredDocuments.map((doc, index) => (
                      <Link
                        key={doc.id}
                        to={`/document/${doc.id}`}
                        className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                        style={{ animationDelay: `${0.05 * index}s` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {doc.document_type.replace('_', ' ')} • {new Date(doc.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(doc.expiry_date)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
