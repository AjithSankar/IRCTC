import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TrainList from "./pages/TrainList";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Logout from "./components/auth/Logout";
import { AuthProvider } from "./components/auth/AuthContext";
import BookTicket from "./components/BookTicket";
import PaymentProcessing from "./components/PaymentProcessing";
import TicketConfirmation from "./components/TicketConfirmation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminRoute from "./components/auth/AdminRoute"; 
import Checkout from "./components/Checkout"; 
import ReviewJourney from "./components/ReviewJourney";

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

          {/* <Route path="/book" element={
            <ProtectedRoute>
              <BookTicket />
            </ProtectedRoute>

          } /> */}


          <Route path="/processing/:bookingId" element={
            <ProtectedRoute>
              <PaymentProcessing />
            </ProtectedRoute>

          } />


          <Route path="/ticket/:bookingId" element={
            <ProtectedRoute>
              <TicketConfirmation />
            </ProtectedRoute>
          } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/book" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewJourney />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;