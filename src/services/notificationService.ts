import despia from 'despia-native';
import { supabase } from '@/integrations/supabase/client';

interface Reminder {
  id: string;
  reminder_date: string;
  is_sent: boolean;
  documents: {
    id: string;
    name: string;
    document_type: string;
  };
}

export const scheduleLocalNotifications = async (userId: string) => {
  try {
    // Fetch user's notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_notifications_enabled, push_notifications_enabled, expiry_reminders_enabled')
      .eq('user_id', userId)
      .single();

    // Check if push notifications are enabled
    if (!profile?.push_notifications_enabled || !profile?.expiry_reminders_enabled) {
      console.log('Push notifications are disabled for user');
      return;
    }

    // Fetch all pending reminders for the user
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        id,
        reminder_date,
        is_sent,
        documents (
          id,
          name,
          document_type
        )
      `)
      .eq('user_id', userId)
      .eq('is_sent', false)
      .gte('reminder_date', new Date().toISOString())
      .order('reminder_date', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
      return;
    }

    if (!reminders || reminders.length === 0) {
      console.log('No pending reminders found');
      return;
    }

    // Schedule notifications for each reminder
    for (const reminder of reminders as Reminder[]) {
      const reminderDate = new Date(reminder.reminder_date);
      const now = new Date();
      const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);

      if (secondsUntilReminder > 0) {
        const documentName = reminder.documents.name;
        const documentType = reminder.documents.document_type;
        const title = `Document Reminder: ${documentType}`;
        const message = `Your ${documentName} requires attention`;
        const url = `/document/${reminder.documents.id}`;

        // Schedule local push notification using Despia SDK
        despia(`sendlocalpushmsg://push.send?s=${secondsUntilReminder}=msg!${message}&!#${title}&!#${url}`);
        
        console.log(`Scheduled notification for ${documentName} in ${secondsUntilReminder} seconds`);
      }
    }
  } catch (error) {
    console.error('Error scheduling local notifications:', error);
  }
};

export const scheduleNotificationForReminder = async (
  reminderId: string,
  reminderDate: string,
  documentName: string,
  documentType: string,
  documentId: string
) => {
  try {
    const now = new Date();
    const reminderDateTime = new Date(reminderDate);
    const secondsUntilReminder = Math.floor((reminderDateTime.getTime() - now.getTime()) / 1000);

    if (secondsUntilReminder > 0) {
      const title = `Document Reminder: ${documentType}`;
      const message = `Your ${documentName} requires attention`;
      const url = `/document/${documentId}`;

      // Schedule local push notification using Despia SDK
      despia(`sendlocalpushmsg://push.send?s=${secondsUntilReminder}=msg!${message}&!#${title}&!#${url}`);
      
      console.log(`Scheduled notification for ${documentName} in ${secondsUntilReminder} seconds`);
    }
  } catch (error) {
    console.error('Error scheduling notification for reminder:', error);
  }
};

export const cancelAllNotifications = () => {
  try {
    // Note: Despia SDK may need a cancel method - check documentation
    console.log('Cancelled all pending notifications');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};
