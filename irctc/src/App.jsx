import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TrainList from "./pages/TrainList";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Logout from "./components/auth/Logout";
import { AuthProvider } from "./components/auth/AuthContext";
import BookTicket from "./components/BookTicket";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trains" element={<TrainList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/book" element={<BookTicket />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;