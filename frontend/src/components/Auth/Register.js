import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Register Password:", password);  // Log the password to ensure it's a string
      await api.post("/api/users/register", { name, email, password: String(password) });
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed!");
    }
  };
  

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
