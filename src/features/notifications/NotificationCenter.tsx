import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Bell, BellOff, CheckCheck, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationCenter() {
  const { auth, notifications, markNotificationRead } = useStore();
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  // deleteNotification function (will be added to store later)
  const deleteNotification = (id: string) => {
    console.log('Delete notification:', id);
  };

  if (!auth.user) return null;

  // Get notifications for current user
  const myNotifications = notifications.filter(n => n.recipientId === auth.user!.id);

  const filteredNotifications = useMemo(() => {
    let filtered = myNotifications;
    
    if (filterType === 'UNREAD') {
      filtered = filtered.filter(n => !n.read);
    } else if (filterType === 'READ') {
      filtered = filtered.filter(n => n.read);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [myNotifications, filterType]);

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return '📋';
      case 'APPLICATION':
        return '📄';
      case 'SHORTLIST':
        return '⭐';
      case 'REJECTION':
        return '❌';
      case 'INTERVIEW_SCHEDULE':
        return '📅';
      case 'DECISION':
        return '✅';
      case 'HOLD':
        return '⏸️';
      case 'RESUME':
        return '▶️';
      default:
        return '🔔';
    }
  };

  const markAllAsRead = () => {
    myNotifications.forEach(n => {
      if (!n.read) {
        markNotificationRead(n.id);
      }
    });
  };

  const deleteAll = () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      filteredNotifications.forEach(n => deleteNotification(n.id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with all your activities
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {filteredNotifications.length > 0 && (
              <Button variant="outline" onClick={deleteAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Button
              variant={filterType === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ALL')}
            >
              All ({myNotifications.length})
            </Button>
            <Button
              variant={filterType === 'UNREAD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('UNREAD')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filterType === 'READ' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('READ')}
            >
              Read ({myNotifications.length - unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {filterType === 'UNREAD' 
                ? 'No unread notifications'
                : filterType === 'READ'
                ? 'No read notifications'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-card rounded-lg border p-4 transition-all ${
                  !notification.read 
                    ? 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="success" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy hh:mm a')}
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
