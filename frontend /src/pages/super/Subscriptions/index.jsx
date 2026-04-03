import { useState } from "react";
import { Link } from "react-router-dom";
import useSubscriptions from "../../../hooks/useSubscriptions";
import { useAuth } from "../../../hooks/useAuth";
import { colors, spacing, typography, shadows, borderRadius, transitions } from "../designSystem";

const Subscriptions = () => {
  const { subscriptions, stats, loading, error, pauseSubscription, resumeSubscription } = useSubscriptions();
  const { logout } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handlePause = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    setActionError("");
    const result = await pauseSubscription(subscriptionId);
    if (!result.success) {
      setActionError(result.error);
    }
    setActionLoading(null);
  };

  const handleResume = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    setActionError("");
    const result = await resumeSubscription(subscriptionId);
    if (!result.success) {
      setActionError(result.error);
    }
    setActionLoading(null);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      background: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      boxShadow: shadows.md,
      border: `1px solid ${colors.neutral200}`,
      transition: `all ${transitions.base}`,
      display: "flex",
      alignItems: "flex-start",
      gap: spacing.lg,
      "&:hover": {
        boxShadow: shadows.lg,
        transform: "translateY(-2px)",
      },
    }}>
      <div style={{
        fontSize: "2.5rem",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          ...typography.bodySmall,
          color: colors.neutral600,
          margin: "0 0 0.5rem 0",
          fontWeight: 600,
        }}>
          {title}
        </p>
        <p style={{
          ...typography.h3,
          color: color || colors.primary,
          margin: 0,
        }}>
          {value}
        </p>
      </div>
    </div>
  );

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return { bg: colors.successLight, text: colors.success, label: "Active" };
      case "paused":
        return { bg: colors.warningLight, text: colors.warning, label: "Paused" };
      case "expired":
        return { bg: colors.dangerLight, text: colors.danger, label: "Expired" };
      default:
        return { bg: colors.neutral100, text: colors.neutral600, label: status };
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.shop_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.neutral50,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.neutral200}`,
        padding: `${spacing.lg} ${spacing.xl}`,
        boxShadow: shadows.sm,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h1 style={{
              ...typography.h1,
              color: colors.neutral900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: spacing.md,
            }}>
              📋 Subscription Management
            </h1>
            <p style={{
              ...typography.bodySmall,
              color: colors.neutral600,
              margin: "0.5rem 0 0 0",
            }}>
              Manage shop subscriptions and monitor recurring revenue
            </p>
          </div>

          <nav style={{
            display: "flex",
            gap: spacing.md,
            alignItems: "center",
          }}>
            <Link to="/super/dashboard" style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              background: colors.neutral100,
              color: colors.neutral900,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              transition: `all ${transitions.base}`,
              border: `1px solid ${colors.neutral300}`,
              cursor: "pointer",
            }}>
              ← Dashboard
            </Link>

            <Link to="/super/shops" style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              background: colors.neutral100,
              color: colors.neutral900,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              transition: `all ${transitions.base}`,
              border: `1px solid ${colors.neutral300}`,
              cursor: "pointer",
            }}>
              🏪 Shops
            </Link>

            <button onClick={logout} style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.danger}`,
              background: colors.dangerLight,
              color: colors.danger,
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              cursor: "pointer",
              transition: `all ${transitions.base}`,
            }}>
              🚪 Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: spacing.xl,
      }}>
        {/* Stats Grid */}
        {stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: spacing.lg,
            marginBottom: spacing.xxl,
          }}>
            <StatCard
              title="Active Subscriptions"
              value={stats.active}
              icon="✅"
              color={colors.success}
            />
            <StatCard
              title="Paused Subscriptions"
              value={stats.paused}
              icon="⏸️"
              color={colors.warning}
            />
            <StatCard
              title="Expiring Soon"
              value={stats.expiring_soon}
              icon="⏰"
              color={colors.danger}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${Number(stats.total_revenue).toLocaleString("en-IN")}`}
              icon="💰"
              color={colors.secondary}
            />
          </div>
        )}

        {/* Error Message */}
        {actionError && (
          <div style={{
            background: colors.dangerLight,
            border: `1px solid ${colors.danger}`,
            color: colors.danger,
            padding: spacing.md,
            marginBottom: spacing.lg,
            borderRadius: borderRadius.md,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontWeight: 600 }}>⚠️ {actionError}</span>
            <button onClick={() => setActionError("")} style={{
              background: "transparent",
              border: "none",
              color: colors.danger,
              cursor: "pointer",
              fontSize: "1.5rem",
            }}>
              ×
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div style={{
          background: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
          boxShadow: shadows.sm,
          display: "flex",
          gap: spacing.md,
          alignItems: "center",
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: spacing.md }}>
            <span style={{ fontSize: "1.5rem" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by shop name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.neutral300}`,
                fontSize: typography.body.fontSize,
                fontFamily: "inherit",
                transition: `all ${transitions.base}`,
                "&:focus": {
                  outline: "none",
                  borderColor: colors.primary,
                  boxShadow: `0 0 0 3px ${colors.primaryLight}`,
                },
              }}
            />
          </div>
          <div style={{
            ...typography.bodySmall,
            color: colors.neutral600,
            fontWeight: 600,
          }}>
            {filteredSubscriptions.length} results
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: colors.white,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.md,
          overflow: "hidden",
          border: `1px solid ${colors.neutral200}`,
        }}>
          {loading ? (
            <div style={{
              padding: spacing.xxl,
              textAlign: "center",
              color: colors.neutral600,
            }}>
              <div style={{ fontSize: "2rem", marginBottom: spacing.md }}>⏳</div>
              <p style={typography.body}>Loading subscriptions...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: spacing.xxl,
              textAlign: "center",
              background: colors.dangerLight,
              color: colors.danger,
            }}>
              <div style={{ fontSize: "2rem", marginBottom: spacing.md }}>❌</div>
              <p style={typography.body}>{error}</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div style={{
              padding: spacing.xxl,
              textAlign: "center",
              color: colors.neutral600,
            }}>
              <div style={{ fontSize: "3rem", marginBottom: spacing.md }}>📭</div>
              <p style={typography.body}>No subscriptions found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
              }}>
                <thead>
                  <tr style={{
                    background: colors.neutral50,
                    borderBottom: `1px solid ${colors.neutral200}`,
                  }}>
                    {["Shop Details", "Plan", "Amount", "Dates", "Status", "Days Left", "Actions"].map((header, idx) => (
                      <th key={idx} style={{
                        padding: spacing.lg,
                        textAlign: "left",
                        ...typography.label,
                        color: colors.neutral700,
                        fontWeight: 700,
                        borderBottom: `2px solid ${colors.neutral300}`,
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub, idx) => {
                    const statusStyle = getStatusBadgeColor(sub.status);
                    return (
                      <tr key={sub.id} style={{
                        borderBottom: `1px solid ${colors.neutral200}`,
                        background: idx % 2 === 0 ? colors.white : colors.neutral50,
                        transition: `all ${transitions.base}`,
                        "&:hover": {
                          background: colors.primaryLight,
                        },
                      }}>
                        {/* Shop Details */}
                        <td style={{
                          padding: spacing.lg,
                          color: colors.neutral900,
                          fontWeight: 600,
                        }}>
                          <div>
                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: 700, color: colors.neutral900 }}>
                              {sub.shop_name}
                            </p>
                            <p style={{ margin: 0, ...typography.bodySmall, color: colors.neutral600 }}>
                              {sub.shop_email}
                            </p>
                            {sub.shop_phone && (
                              <p style={{ margin: "0.25rem 0 0 0", ...typography.bodySmall, color: colors.neutral600 }}>
                                📞 {sub.shop_phone}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Plan */}
                        <td style={{
                          padding: spacing.lg,
                          color: colors.neutral900,
                          fontWeight: 600,
                        }}>
                          <div style={{
                            display: "inline-block",
                            background: colors.primaryLight,
                            color: colors.primary,
                            padding: `${spacing.xs} ${spacing.md}`,
                            borderRadius: borderRadius.md,
                            ...typography.bodySmall,
                            fontWeight: 600,
                          }}>
                            📅 {sub.plan_name}
                          </div>
                        </td>

                        {/* Amount */}
                        <td style={{
                          padding: spacing.lg,
                          color: colors.neutral900,
                          fontWeight: 600,
                        }}>
                          ₹{Number(sub.amount).toLocaleString("en-IN")}
                        </td>

                        {/* Dates */}
                        <td style={{
                          padding: spacing.lg,
                          color: colors.neutral600,
                          ...typography.bodySmall,
                        }}>
                          <p style={{ margin: "0 0 0.25rem 0" }}>
                            {new Date(sub.start_date).toLocaleDateString("en-IN")}
                          </p>
                          <p style={{ margin: 0 }}>
                            → {new Date(sub.end_date).toLocaleDateString("en-IN")}
                          </p>
                        </td>

                        {/* Status */}
                        <td style={{
                          padding: spacing.lg,
                        }}>
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: spacing.xs,
                            padding: `${spacing.xs} ${spacing.md}`,
                            borderRadius: borderRadius.full,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            ...typography.bodyXSmall,
                            fontWeight: 700,
                          }}>
                            <span style={{ fontSize: "1rem" }}>
                              {sub.status === "active" ? "✅" : sub.status === "paused" ? "⏸️" : "❌"}
                            </span>
                            {statusStyle.label}
                          </div>
                        </td>

                        {/* Days Left */}
                        <td style={{
                          padding: spacing.lg,
                          color: sub.days_remaining <= 7 ? colors.danger : colors.neutral900,
                          fontWeight: 600,
                        }}>
                          <div style={{
                            display: "inline-block",
                            padding: `${spacing.xs} ${spacing.md}`,
                            borderRadius: borderRadius.md,
                            background: sub.days_remaining <= 7 ? colors.dangerLight : colors.neutral100,
                            color: sub.days_remaining <= 7 ? colors.danger : colors.neutral900,
                          }}>
                            {sub.days_remaining} days
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{
                          padding: spacing.lg,
                          textAlign: "center",
                        }}>
                          {sub.status === "active" ? (
                            <button
                              onClick={() => handlePause(sub.id)}
                              disabled={actionLoading === sub.id}
                              style={{
                                padding: `${spacing.xs} ${spacing.md}`,
                                borderRadius: borderRadius.md,
                                border: "none",
                                background: colors.warning,
                                color: colors.white,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: actionLoading === sub.id ? "not-allowed" : "pointer",
                                opacity: actionLoading === sub.id ? 0.6 : 1,
                                transition: `all ${transitions.base}`,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              {actionLoading === sub.id ? "..." : "⏸️ Pause"}
                            </button>
                          ) : sub.status === "paused" ? (
                            <button
                              onClick={() => handleResume(sub.id)}
                              disabled={actionLoading === sub.id}
                              style={{
                                padding: `${spacing.xs} ${spacing.md}`,
                                borderRadius: borderRadius.md,
                                border: "none",
                                background: colors.success,
                                color: colors.white,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: actionLoading === sub.id ? "not-allowed" : "pointer",
                                opacity: actionLoading === sub.id ? 0.6 : 1,
                                transition: `all ${transitions.base}`,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              {actionLoading === sub.id ? "..." : "▶️ Resume"}
                            </button>
                          ) : (
                            <span style={{
                              color: colors.neutral500,
                              ...typography.bodySmall,
                            }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        a {
          text-decoration: none;
        }
        div[style*="transform"] {
          transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;
