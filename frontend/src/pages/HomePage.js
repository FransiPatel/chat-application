import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      navigate("/chat"); // Navigate to chat if authenticated
    }
  }, [navigate]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient" style={{ background: 'linear-gradient(to right, #89CFF0, #B0E0E6)' }}>
      <div className="bg-light p-5 rounded-4 shadow-lg text-center border border-light">
        <h1 className="display-4 text-dark mb-4">Welcome to ChatZone</h1>
        <p className="text-muted mb-4 lead">Connect and chat in real-time!</p>
        {isAuthenticated ? (
          <p className="text-dark lead">You are logged in. Redirecting to chat...</p>
        ) : (
          <div className="d-grid gap-3">
            <button
              onClick={handleLogin}
              className="btn btn-outline-info btn-lg"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="btn btn-info btn-lg"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
