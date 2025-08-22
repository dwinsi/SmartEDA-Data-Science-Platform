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
  const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful!");
        if (onLoginSuccess) onLoginSuccess();
        window.location.href = '/';
        } else {
        setError(data.detail || "Login failed.");
        }
    } catch (err) {
        setError("Network error. Please check your connection and try again.");
    }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-2xl" aria-hidden="true">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
        </div>
        <label htmlFor="login-email" className="sr-only">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          aria-label="Email"
        />
        <label htmlFor="login-password" className="sr-only">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          aria-label="Password"
        />
        <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-semibold p-3 rounded-lg shadow transition">Login</button>
        {message && <div className="mt-3 text-green-600 text-center" role="alert">{message}</div>}
        {error && <div className="mt-3 text-red-600 font-semibold text-center" role="alert">{error}</div>}
      </form>
    </div>
  );
};

export default LoginForm;
