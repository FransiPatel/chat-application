import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';
import api from "../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/chat");
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient" style={{ background: 'linear-gradient(to right, #89CFF0, #B0E0E6)' }}>
      <div className="custom-container">
        <h2 className="text-dark mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-info btn-lg w-100 mb-3">
            Login
          </button>
          <div className="text-center">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="text-info text-decoration-none">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
