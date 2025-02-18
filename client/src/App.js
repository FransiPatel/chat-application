import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load components
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const ChatBox = lazy(() => import("./components/Chat/ChatBox"));

function App() {
  return (
    <Router>
      <SocketProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/chat/*"
              element={
                <ProtectedRoute>
                  <ChatBox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatBox />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </SocketProvider>
    </Router>
  );
}

export default App;
