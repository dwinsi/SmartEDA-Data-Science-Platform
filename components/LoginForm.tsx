import React, { useState } from "react";

interface LoginFormProps {
  onLoginSuccess?: () => void;
}
const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError(null);
    try {
        const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful!");
        if (onLoginSuccess) onLoginSuccess();
        } else {
        setError(data.detail || "Login failed.");
        }
    } catch (err) {
        setError("Network error. Please check your connection and try again.");
    }
};

  return (
  <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto p-4 border rounded">
      <h2 className="text-xl mb-4">Login</h2>
      <label htmlFor="email" className="sr-only">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
        aria-label="Email"
      />
      <label htmlFor="password" className="sr-only">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
        aria-label="Password"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
  {message && <div className="mt-2 text-green-600" role="alert">{message}</div>}
  {error && <div className="mt-2 text-red-600 font-semibold" role="alert">{error}</div>}
    </form>
  );
};

export default LoginForm;
