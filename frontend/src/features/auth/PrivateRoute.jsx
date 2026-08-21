import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRouteSelector() {
  const sessionId = useSelector((state) => state.auth.session);
  const validSession = sessionId || localStorage.getItem("session_id");

  return validSession ? <Outlet /> : <Navigate to="/login" />;
}
