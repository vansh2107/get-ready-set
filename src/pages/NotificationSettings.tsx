import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [expiryReminders, setExpiryReminders] = useState(true);
  const [renewalReminders, setRenewalReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications_enabled, push_notifications_enabled, expiry_reminders_enabled, renewal_reminders_enabled, weekly_digest_enabled')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setEmailNotifications(data.email_notifications_enabled ?? true);
        setPushNotifications(data.push_notifications_enabled ?? false);
        setExpiryReminders(data.expiry_reminders_enabled ?? true);
        setRenewalReminders(data.renewal_reminders_enabled ?? true);
        setWeeklyDigest(data.weekly_digest_enabled ?? false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications_enabled: emailNotifications,
          push_notifications_enabled: pushNotifications,
          expiry_reminders_enabled: expiryReminders,
          renewal_reminders_enabled: renewalReminders,
          weekly_digest_enabled: weeklyDigest,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications on this device</p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Preferences</CardTitle>
            <CardDescription>Configure when you receive reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiry-reminders">Document Expiry Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified when documents are about to expire</p>
              </div>
              <Switch
                id="expiry-reminders"
                checked={expiryReminders}
                onCheckedChange={setExpiryReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="renewal-reminders">Renewal Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified when it's time to renew documents</p>
              </div>
              <Switch
                id="renewal-reminders"
                checked={renewalReminders}
                onCheckedChange={setRenewalReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of your documents</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg" disabled={saving || loading}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
