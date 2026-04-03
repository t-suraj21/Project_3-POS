// NotificationIcon Styles

export const containerStyle = {
  position: "relative",
  display: "inline-block",
};

export const bellButtonStyle = {
  position: "relative",
  background: "transparent",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  padding: "0.5rem",
  borderRadius: "8px",
  transition: "all 0.2s ease",
  color: "rgba(255,255,255,0.7)",
};

export const bellButtonHoverStyle = {
  background: "rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.9)",
};

export const badgeStyle = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  background: "#ef4444",
  color: "white",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  fontWeight: "bold",
  border: "2px solid #1e293b",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

export const dropdownStyle = {
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: "0.5rem",
  width: "380px",
  maxHeight: "500px",
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
};

export const headerStyle = {
  padding: "1rem",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15,23,42,0.5)",
};

export const headerTitleStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "white",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

export const headerBadgeStyle = {
  background: "#ef4444",
  color: "white",
  borderRadius: "12px",
  padding: "0.1rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
};

export const markAllReadButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  fontSize: "0.8rem",
  cursor: "pointer",
  padding: 0,
  fontWeight: "500",
  transition: "color 0.2s",
};

export const contentStyle = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: 0,
};

export const loadingStyle = {
  padding: "2rem",
  textAlign: "center",
  color: "rgba(255,255,255,0.5)",
};

export const emptyStateStyle = {
  padding: "2rem 1.5rem",
  textAlign: "center",
  color: "rgba(255,255,255,0.4)",
};

export const emptyStateIconStyle = {
  fontSize: "2rem",
  marginBottom: "0.5rem",
};

export const emptyStateTextStyle = {
  margin: 0,
  fontSize: "0.9rem",
};

export const notificationItemStyle = {
  padding: "1rem 1.5rem",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  gap: "0.75rem",
};

export const notificationItemUnreadStyle = {
  background: "rgba(99,102,241,0.1)",
};

export const notificationItemReadStyle = {
  background: "transparent",
};

export const notificationIconStyle = {
  fontSize: "1.5rem",
  flexShrink: 0,
  lineHeight: 1,
};

export const notificationContentStyle = {
  flex: 1,
  minWidth: 0,
};

export const notificationHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
};

export const notificationTitleContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flex: 1,
  minWidth: 0,
};

export const notificationTitleStyle = {
  margin: 0,
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "white",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const unreadDotStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#3b82f6",
  flexShrink: 0,
};

export const priorityIndicatorStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  flexShrink: 0,
};

export const notificationMessageStyle = {
  margin: "0.25rem 0 0 0",
  fontSize: "0.8rem",
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.4,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export const notificationTimeStyle = {
  fontSize: "0.75rem",
  color: "rgba(255,255,255,0.4)",
  marginTop: "0.25rem",
  display: "block",
};

export const closeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.4)",
  cursor: "pointer",
  fontSize: "1.2rem",
  padding: 0,
  flexShrink: 0,
  transition: "color 0.2s",
};

export const footerStyle = {
  padding: "0.75rem 1.5rem",
  borderTop: "1px solid rgba(255,255,255,0.07)",
  textAlign: "center",
  background: "rgba(15,23,42,0.3)",
};

export const viewAllButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "500",
  padding: 0,
  transition: "color 0.2s",
};

// Priority colors map
export const priorityColorsMap = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#84cc16",
};

// Notification icons map
export const notificationIconsMap = {
  stock_alert: "📦",
  low_stock: "⚠️",
  refund: "↩️",
  refund_completed: "✅",
  refund_failed: "❌",
  payment_pending: "⏳",
  order_completed: "🎉",
  general: "📢",
};
