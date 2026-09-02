import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UsageHistory from "./pages/UsageHistory";
import AddReading from "./pages/AddReading";
import AddMeter from "./pages/AddMeter";
import EditMeter from "./pages/EditMeter";
import EditReading from "./pages/EditReading";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        <Route
  path="/edit-reading/:readingId"
  element={<EditReading />}
/>


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
  path="/usage-history"
  element={<UsageHistory />}
/>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />


<Route
  path="/edit-meter/:meterId"
  element={<EditMeter />}
/>

          <Route
  path="/add-reading"
  element={<AddReading />}
/>
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
  path="/add-meter"
  element={<AddMeter />}

/>


      </Routes>
    </BrowserRouter>
  );
}

export default App;