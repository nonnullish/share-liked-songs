import { SuccessIcon } from "@components/icons";
import "./view-playlist.css";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlaylistCover } from "@utils/data";

export const ViewPlaylist = () => {
  const location = useLocation();
  const playlistID = location.state?.playlistID;
  const [cover, setCover] = useState("");
  const [opacity, setOpacity] = useState(0);

  if (!playlistID) {
    return <Navigate to="/"></Navigate>;
  }

  useEffect(() => {
    const retrieveCover = async () => {
      const image = await getPlaylistCover(playlistID);
      setCover(image);
    };

    if (playlistID) {
      retrieveCover();
    }
  }, []);

  return (
    <section className="section view-playlist">
      <div className="cover">
        <a href={`https://open.spotify.com/playlist/${playlistID}`}>
          <img
            style={{ opacity }}
            src={cover}
            onLoad={() => setOpacity(1)}
            title="Liked Songs"
            alt="Cover of the Liked Songs playlist"
          />
        </a>
      </div>
      <div className="info">
        <SuccessIcon />
        <a href={`https://open.spotify.com/playlist/${playlistID}`}>
          {" "}
          Saved to Spotify
        </a>
      </div>
    </section>
  );
};
