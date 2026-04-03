import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import * as S from "./styles";

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications?limit=20");
      console.log("✅ Notifications fetched:", response.data);
      if (response.data && response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where data is directly an array
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => n.is_read === 0).length);
      }
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.response?.data
      });
      // Still update state even on error to prevent infinite loading
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.post(`/api/notifications/${notificationId}/read`);
      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: 1 } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/api/notifications/mark-all-read");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, is_read: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch on mount and setup polling (5 seconds = real-time)
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();

    // Poll every 5 seconds for real-time updates
    const pollInterval = setInterval(fetchNotifications, 5000);
    pollIntervalRef.current = pollInterval;

    return () => clearInterval(pollInterval);
  }, []);

  // Get notification icon emoji based on type
  const getNotificationIcon = (type) => {
    return S.notificationIconsMap[type] || "🔔";
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    return S.priorityColorsMap[priority] || "#eab308";
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div ref={dropdownRef} style={S.containerStyle}>
      {/* Notification bell icon */}
      <button
        onClick={() => {
          const newOpen = !isOpen;
          setIsOpen(newOpen);
          // Refresh notifications when opening dropdown
          if (newOpen) {
            fetchNotifications();
          }
        }}
        style={S.bellButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = S.bellButtonHoverStyle.background;
          e.currentTarget.style.color = S.bellButtonHoverStyle.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = S.bellButtonStyle.background;
          e.currentTarget.style.color = S.bellButtonStyle.color;
        }}
        title="Notifications"
      >
        🔔
        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span style={S.badgeStyle}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div style={S.dropdownStyle}>
          {/* Header */}
          <div style={S.headerStyle}>
            <h3 style={S.headerTitleStyle}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={S.headerBadgeStyle}>
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={S.markAllReadButtonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div style={S.contentStyle}>
            {loading && (
              <div style={S.loadingStyle}>
                Loading notifications...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={S.emptyStateStyle}>
                <div style={S.emptyStateIconStyle}>✨</div>
                <p style={S.emptyStateTextStyle}>
                  No notifications yet
                </p>
              </div>
            )}

            {!loading &&
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.is_read === 0) {
                      handleMarkAsRead(notif.id);
                    }
                    if (notif.action_url) {
                      window.location.href = notif.action_url;
                    }
                  }}
                  style={{
                    ...S.notificationItemStyle,
                    ...(notif.is_read === 0 ? S.notificationItemUnreadStyle : S.notificationItemReadStyle),
                    cursor: notif.action_url ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (notif.action_url) {
                      e.currentTarget.style.background = "rgba(99,102,241,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      notif.is_read === 0
                        ? "rgba(99,102,241,0.1)"
                        : "transparent";
                  }}
                >
                  {/* Icon */}
                  <div style={S.notificationIconStyle}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div style={S.notificationContentStyle}>
                    <div style={S.notificationHeaderStyle}>
                      <div style={S.notificationTitleContainerStyle}>
                        <h4 style={S.notificationTitleStyle}>
                          {notif.title}
                        </h4>
                        {notif.is_read === 0 && (
                          <span style={S.unreadDotStyle} />
                        )}
                      </div>

                      {/* Priority indicator */}
                      {notif.priority && (
                        <div
                          style={{
                            ...S.priorityIndicatorStyle,
                            background: getPriorityColor(notif.priority),
                          }}
                          title={notif.priority}
                        />
                      )}
                    </div>

                    {/* Message */}
                    <p style={S.notificationMessageStyle}>
                      {notif.message}
                    </p>

                    {/* Time */}
                    <span style={S.notificationTimeStyle}>
                      {formatTime(notif.created_at)}
                    </span>
                  </div>

                  {/* Close button for unread */}
                  {notif.is_read === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      style={S.closeButtonStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div style={S.footerStyle}>
              <button
                onClick={() => {
                  // Could navigate to a full notifications page here
                  setIsOpen(false);
                }}
                style={S.viewAllButtonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#60a5fa")}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
