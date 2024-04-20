import { cloneElement } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@hooks/auth";
import { Loader } from "@components/icons";

export const ProtectedRoute = ({ children }: any) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/authorize" replace />;
  }

  return cloneElement(children, { loading, user });
};
