import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  CheckCheck, 
  PackageCheck, 
  CalendarClock, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_received':
        return <PackageCheck className="w-4 h-4 text-emerald-600" />;
      case 'donation_created':
        return <PackageCheck className="w-4 h-4 text-blue-600" />;
      case 'donation_expired':
        return <CalendarClock className="w-4 h-4 text-amber-600" />;
      case 'booking_cancelled':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 text-white">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-white/10 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-300">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">Updates on donations & bookings will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-white/5 transition ${
                !notif.is_read ? 'bg-emerald-950/30' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-800/80 flex-shrink-0 mt-0.5">
                {getIcon(notif.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${!notif.is_read ? 'text-white font-bold' : 'text-slate-300'}`}>
                    {notif.title}
                  </h4>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-1.5" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-500 mt-1.5 block">
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
