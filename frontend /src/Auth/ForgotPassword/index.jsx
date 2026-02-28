import { Link } from "react-router-dom";
import useForgotPassword from "./useForgotPassword";
import styles from "./styles";

const ForgotPassword = () => {
  const { email, submitted, loading, handleChange, handleSubmit } = useForgotPassword();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>

        {submitted ? (
          <p style={styles.success}>
            If that email is registered, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.hint}>
              Enter your account email and we'll send you a reset link.
            </p>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          <Link to="/login">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
