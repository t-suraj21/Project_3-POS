import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import useSuperDashboard from "../../../hooks/useSuperDashboard";
import useSubscriptions from "../../../hooks/useSubscriptions";
import { colors, spacing, typography, shadows, borderRadius, transitions } from "../designSystem";

const SuperDashboard = () => {
  const { revenue, loading, error } = useSuperDashboard();
  const { stats: subStats } = useSubscriptions();
  const { user, logout } = useAuth();

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div style={{
      background: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.md,
      transition: `all ${transitions.base}`,
      cursor: "pointer",
      borderTop: `4px solid ${color}`,
      display: "flex",
      flexDirection: "column",
      gap: spacing.md,
      "&:hover": {
        boxShadow: shadows.lg,
        transform: "translateY(-4px)",
      },
    }}>
      {/* Icon and Title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: "2rem",
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: trend > 0 ? colors.success : colors.danger,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p style={{
          ...typography.bodySmall,
          color: colors.neutral600,
          margin: "0 0 0.25rem 0",
        }}>
          {title}
        </p>
        <p style={{
          ...typography.h2,
          color: colors.neutral900,
          margin: 0,
        }}>
          {value}
        </p>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          ...typography.bodyXSmall,
          color: colors.neutral500,
          margin: 0,
        }}>
          {subtitle}
        </p>
      )}
    </div>
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
          {/* Left side */}
          <div>
            <h1 style={{
              ...typography.h1,
              color: colors.neutral900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: spacing.md,
            }}>
              📊 Developer Dashboard
            </h1>
            <p style={{
              ...typography.bodySmall,
              color: colors.neutral600,
              margin: "0.5rem 0 0 0",
            }}>
              Welcome back, {user?.name || "Admin"}
            </p>
          </div>

          {/* Right side - Navigation */}
          <nav style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
          }}>
            <Link to="/super/shops" style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              border: `2px solid ${colors.primary}`,
              background: colors.primaryLight,
              color: colors.primary,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              transition: `all ${transitions.base}`,
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              cursor: "pointer",
              "&:hover": {
                background: colors.primary,
                color: colors.white,
              },
            }}>
              🏪 All Shops
            </Link>

            <Link to="/super/subscriptions" style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              border: `2px solid ${colors.secondary}`,
              background: colors.secondaryLight,
              color: colors.secondary,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              transition: `all ${transitions.base}`,
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              cursor: "pointer",
              "&:hover": {
                background: colors.secondary,
                color: colors.white,
              },
            }}>
              📋 Subscriptions
            </Link>

            <button onClick={logout} style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.danger}`,
              background: "transparent",
              color: colors.danger,
              fontWeight: 600,
              fontSize: typography.bodySmall.fontSize,
              cursor: "pointer",
              transition: `all ${transitions.base}`,
              "&:hover": {
                background: colors.dangerLight,
              },
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: spacing.lg,
          marginBottom: spacing.xxl,
        }}>
          {/* Revenue Card */}
          <StatCard
            icon="💰"
            title="Total Revenue"
            value={loading ? "..." : error ? "Error" : `₹${Number(revenue).toLocaleString("en-IN")}`}
            subtitle="From all shops"
            color={colors.success}
          />

          {/* Active Subscriptions */}
          {subStats && (
            <>
              <StatCard
                icon="✅"
                title="Active Subscriptions"
                value={subStats.active}
                subtitle="Currently running"
                color={colors.primary}
                trend={5}
              />

              {/* Subscription Revenue */}
              <StatCard
                icon="💳"
                title="Subscription Revenue"
                value={`₹${Number(subStats.total_revenue).toLocaleString("en-IN")}`}
                subtitle="Recurring income"
                color={colors.secondary}
              />

              {/* Paused Subscriptions */}
              <StatCard
                icon="⏸️"
                title="Paused Subscriptions"
                value={subStats.paused}
                subtitle="Awaiting action"
                color={colors.warning}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <section style={{
          background: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
        }}>
          <h2 style={{
            ...typography.h3,
            color: colors.neutral900,
            margin: `0 0 ${spacing.lg} 0`,
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
          }}>
            🎯 Quick Actions
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: spacing.lg,
          }}>
            {/* Action Card Template */}
            {[
              {
                icon: "🏪",
                title: "Manage Shops",
                description: "View and manage all registered shops",
                link: "/super/shops",
                color: colors.primary,
              },
              {
                icon: "📋",
                title: "Manage Subscriptions",
                description: "Pause, resume, and monitor subscriptions",
                link: "/super/subscriptions",
                color: colors.secondary,
              },
              {
                icon: "📊",
                title: "View Analytics",
                description: "Check revenue and usage statistics",
                link: "/super/dashboard",
                color: colors.success,
              },
              {
                icon: "⚙️",
                title: "System Settings",
                description: "Configure platform-wide settings",
                link: "/super/settings",
                color: colors.warning,
              },
            ].map((action, idx) => (
              <Link key={idx} to={action.link} style={{
                background: `${action.color}10`,
                border: `2px solid ${action.color}`,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                textDecoration: "none",
                cursor: "pointer",
                transition: `all ${transitions.base}`,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
                "&:hover": {
                  background: action.color,
                  color: colors.white,
                },
              }}>
                <div style={{
                  fontSize: "2rem",
                }}>
                  {action.icon}
                </div>
                <div>
                  <h3 style={{
                    ...typography.h4,
                    color: action.color,
                    margin: 0,
                  }}>
                    {action.title}
                  </h3>
                  <p style={{
                    ...typography.bodySmall,
                    color: colors.neutral600,
                    margin: "0.5rem 0 0 0",
                  }}>
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Status */}
        <section style={{
          background: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginTop: spacing.xl,
        }}>
          <h2 style={{
            ...typography.h3,
            color: colors.neutral900,
            margin: `0 0 ${spacing.lg} 0`,
          }}>
            📡 System Status
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.lg,
          }}>
            {[
              { label: "API Server", status: "operational", color: colors.success },
              { label: "Database", status: "operational", color: colors.success },
              { label: "Payment Gateway", status: "operational", color: colors.success },
              { label: "Email Service", status: "operational", color: colors.success },
            ].map((system, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: spacing.md,
                background: colors.neutral50,
                borderRadius: borderRadius.md,
                borderLeft: `4px solid ${system.color}`,
              }}>
                <span style={{
                  ...typography.bodySmall,
                  color: colors.neutral700,
                  fontWeight: 600,
                }}>
                  {system.label}
                </span>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: system.color,
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }} />
                  <span style={{
                    ...typography.bodyXSmall,
                    color: system.color,
                    fontWeight: 600,
                  }}>
                    {system.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        a:hover {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
};

export default SuperDashboard;
