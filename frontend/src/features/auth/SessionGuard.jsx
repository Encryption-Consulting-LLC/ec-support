import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setSession } from "./authSlice";
import { useDispatch } from "react-redux";
import { ROUTES } from "../../lib/router/path";

const SessionGuardSelector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const session_id = params.get("session_id");
    const sessionIdFromQuery = params.get("session_id");

    if (success === "True" && session_id) {
      const loginMethod = "sso";
      localStorage.setItem("session_id", session_id); // Align with api.js
      localStorage.setItem(
        "user",
        JSON.stringify({ session_id: sessionIdFromQuery, loginMethod })
      );
      dispatch(setSession(session_id));
      navigate(ROUTES.SUPPORT);
    } else {
      const localSession = localStorage.getItem("session_id");
      if (localSession) {
        navigate(ROUTES.SUPPORT);
      } else {
        navigate("/login");
      }
    }
  }, [location, navigate, dispatch]);

  return null;
};

export default SessionGuardSelector;
