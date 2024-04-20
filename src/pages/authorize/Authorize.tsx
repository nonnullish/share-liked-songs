import { Navigate } from "react-router-dom";

import { Button } from "@components/button";
import { Heart } from "@components/heart";
import { useAuth } from "@hooks/auth";
import { redirectToAuth } from "@utils/auth";

export const Authorize = () => {
  const { loading, user } = useAuth();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="section">
      <Heart color="#1db954" />
      <Button onClick={redirectToAuth}>Continue with Spotify</Button>
    </section>
  );
};
