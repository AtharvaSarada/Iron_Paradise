import { supabase } from '@/config/supabase';

// Action types for consistent logging
export const LOG_ACTIONS = {
  // Member actions
  MEMBER_CREATED: 'member_created',
  MEMBER_UPDATED: 'member_updated',
  MEMBER_DELETED: 'member_deleted',
  MEMBER_VIEWED: 'member_viewed',

  // Bill actions
  BILL_CREATED: 'bill_created',
  BILL_VIEWED: 'bill_viewed',
  BILL_UPDATED: 'bill_updated',

  // Package actions
  PACKAGE_CREATED: 'package_created',
  PACKAGE_UPDATED: 'package_updated',
  PACKAGE_DELETED: 'package_deleted',
  PACKAGE_ASSIGNED: 'package_assigned',

  // Notification actions
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',

  // Supplement actions
  SUPPLEMENT_CREATED: 'supplement_created',
  SUPPLEMENT_UPDATED: 'supplement_updated',
  SUPPLEMENT_DELETED: 'supplement_deleted',

  // Diet actions
  DIET_CREATED: 'diet_created',
  DIET_UPDATED: 'diet_updated',
  DIET_DELETED: 'diet_deleted',
  DIET_ASSIGNED: 'diet_assigned',

  // Auth actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LOGIN_FAILED: 'login_failed',

  // Report actions
  REPORT_EXPORTED: 'report_exported',

  // System actions
  ERROR_OCCURRED: 'error_occurred',
} as const;

export interface LogEntry {
  user_id?: string;
  action_type: string;
  details?: Record<string, any>;
  ip_address?: string;
}

/**
 * Log a user action to the database
 * @param action - The action type from LOG_ACTIONS
 * @param details - Additional details about the action
 * @param userId - The user performing the action (optional, auto-detected if authenticated)
 */
export const logAction = async (
  action: string,
  details?: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    // Get current user if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      currentUserId = session?.user?.id;
    }

    // Get client IP (in browser, this might be limited)
    const ipAddress = undefined; // Would need server-side implementation

    const logEntry: LogEntry = {
      user_id: currentUserId,
      action_type: action,
      details,
      ip_address: ipAddress,
    };

    const { error } = await supabase
      .from('activity_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Failed to log action:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  } catch (error) {
    console.error('Logging service error:', error);
  }
};

/**
 * Log an error with context
 */
export const logError = async (
  error: Error,
  context?: Record<string, any>,
  userId?: string
): Promise<void> => {
  await logAction(LOG_ACTIONS.ERROR_OCCURRED, {
    error: error.message,
    stack: error.stack,
    ...context,
  }, userId);
};

/**
 * Get activity logs with optional filtering
 */
export const getActivityLogs = async (
  filters?: {
    user_id?: string;
    action_type?: string;
    limit?: number;
    offset?: number;
  }
) => {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters?.action_type) {
    query = query.eq('action_type', filters.action_type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 50) - 1
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};
