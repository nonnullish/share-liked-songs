import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button, Form, Heart, Loader, Or, PlaylistSelect } from "@components";
import { IPlaylist } from "@interfaces/music";
import { IUser } from "@interfaces/users";
import {
  clearPlaylist,
  createPlaylist,
  getLikedSongsQuery,
  getPlaylists,
  saveLikedSongsQuery,
  updateDate,
} from "@utils/data";

import "./generate-playlist.css";

export const GeneratePlaylist = ({ user }: any) => {
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getPlaylists(user.id);
      setPlaylists(data);
    })();
  }, []);

  const retrieve = async () => {
    for await (const request of getLikedSongsQuery()) {
      toast.success(
        `Fetched ${request.progress} songs out of ${request.total}.`
      );

      if (request.progress === request.total) {
        return request.uris;
      }
    }
  };

  const save = async (playlistID: string, songs: string[]) => {
    for await (const request of saveLikedSongsQuery(playlistID, songs)) {
      toast.success(`Saved ${request.progress} songs out of ${request.total}.`);
    }
  };

  const create = async ({ id }: IUser) => {
    setIsFetching(true);

    const songs = await retrieve();

    if (!songs) {
      return;
    }

    const { id: playlistID } = await createPlaylist(id);
    await save(playlistID, songs);

    localStorage.setItem(
      "playlistURL",
      `https://open.spotify.com/playlist/${playlistID}`
    );

    setIsFetching(false);
    navigate("/done", { state: { playlistID } });
    toast.dismiss();
  };

  const overwrite = async (event: FormEvent) => {
    event.preventDefault();
    setIsFetching(true);

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const { playlist: playlistID } = Object.fromEntries(data) as Record<
      string,
      string
    >;

    if (playlistID) {
      await clearPlaylist(playlistID);
      const songs = await retrieve();

      if (!songs) {
        return;
      }

      await save(playlistID, songs);

      await updateDate(playlistID);
      localStorage.setItem(
        "playlistURL",
        `https://open.spotify.com/playlist/${playlistID}`
      );

      navigate("/done", { state: { playlistID } });
    }

    toast.dismiss();
    setIsFetching(false);
  };

  return (
    <section className="section">
      <Heart color="#cc6271" />
      <div className="loader-wrapper" hidden={!isFetching}>
        <Loader />
      </div>
      <div className="generate-playlist" hidden={isFetching}>
        <Button onClick={() => create(user)} disabled={isFetching}>
          Generate Your Playlist
        </Button>
        <Or />

        <Form onSubmit={overwrite}>
          <PlaylistSelect isFetching={isFetching} playlists={playlists} />
        </Form>
      </div>
    </section>
  );
};
