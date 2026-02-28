import { useState } from "react";

const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: call /api/auth/forgot-password in Phase 2
    // await api.post("/api/auth/forgot-password", { email });
    setSubmitted(true);
    setLoading(false);
  };

  return { email, submitted, loading, handleChange, handleSubmit };
};

export default useForgotPassword;
