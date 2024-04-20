import dayjs from "dayjs";

import { IPlaylist } from "@interfaces/music";
import { currentToken } from "./auth";
import { api, group } from "./utils";
import { toast } from "sonner";

export const getUserData = async () => {
  const endpoint = "https://api.spotify.com/v1/me";
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  return await api({
    endpoint,
    headers,
    onError: () => toast.error("Error: Couldn't get user data"),
  });
};

export async function* getLikedSongsQuery() {
  const endpoint = "https://api.spotify.com/v1/me/tracks?limit=50";

  const query = async (next: string) => {
    const headers = { Authorization: `Bearer ${currentToken.access_token}` };
    return await api({
      endpoint: next,
      headers,
      onError: () => toast.error("Error: Couldn't get the liked songs"),
    });
  };

  const data: { uris: string[]; progress?: number; total?: number } = {
    uris: [],
  };

  let next = endpoint;

  while (next) {
    const response = await query(next);
    const uris = response.items.map(({ track }: any) => track.uri);
    data.uris.push(...uris);
    data.progress = data.uris.length;
    data.total = response.total;
    next = response.next;

    yield data;
  }
}

export const getPlaylistCover = async (playlistID: string) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}?fields=images`;
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };

  const response = await api({
    endpoint,
    headers,
    onError: () => toast.error("Error: Couldn't get the playlist cover"),
  });

  return response.images.at(1).url;
};

export const clearPlaylist = async (playlistID: string) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };
  const body = { uris: [] };

  return await api({
    endpoint,
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    onError: () => toast.error("Error: Couldn't clear the playlist"),
    onSuccess: () => toast.success("Cleared the playlist."),
  });
};

export const createPlaylist = async (user: string) => {
  const endpoint = `https://api.spotify.com/v1/users/${user}/playlists`;
  const headers = {
    Authorization: `Bearer ${currentToken.access_token}`,
    "Content-Type": "application/json",
  };
  const date = dayjs().format("MMMM D YYYY");

  const body = {
    name: "Liked Songs",
    public: true,
    collaborative: false,
    description: `as of ${date}`,
  };

  const data = await api({
    endpoint,
    method: "POST",
    headers,
    body: JSON.stringify(body),
    onError: () => toast.error("Error: Couldn't create a new playlist"),
    onSuccess: () => toast.success("Created a new playlist."),
  });

  return data;
};

export async function* saveLikedSongsQuery(
  playlistID: string,
  songs: string[]
) {
  const query = async (body: string) => {
    const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
    const headers = {
      Authorization: `Bearer ${currentToken.access_token}`,
      "Content-Type": "application/json",
    };

    return await api({
      body,
      endpoint,
      headers,
      method: "POST",
      onError: () => toast.error("Error: Couldn't save the liked songs"),
    });
  };

  const limit = 100;
  const pages = group<string>(songs, limit);
  let progress = 0;

  for await (const uris of pages) {
    const body = JSON.stringify({ uris });
    await query(body);
    progress = progress + uris.length;

    yield { progress, total: songs.length };
  }
}

export async function* getPlaylistsQuery(userID: string) {
  const endpoint = `https://api.spotify.com/v1/users/${userID}/playlists`;

  const query = async (next: string) => {
    const headers = { Authorization: `Bearer ${currentToken.access_token}` };
    return await api({
      endpoint: next,
      headers,
      onError: () => toast.error("Error: Couldn't get user's playlists"),
    });
  };

  const data: { items: IPlaylist[]; total?: number } = {
    items: [],
    total: undefined,
  };

  let next = endpoint;

  while (next) {
    const response = await query(next);
    const items = response.items
      .filter((item: any) => item.owner.id === userID)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.external_urls.spotify,
      }));
    data.items.push(...items);
    data.total = response.items.filter(
      (item: any) => item.owner.id === userID
    ).length;
    next = response.next;

    yield data;
  }
}

export const getPlaylists = async (userID: string) => {
  const playlists: IPlaylist[] = [];

  for await (const n of getPlaylistsQuery(userID)) {
    if (n.items.length === n.total) {
      playlists.push(...n.items);
    }
  }

  return playlists;
};

export const updateDate = async (playlistID: string) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${playlistID}`;
  const headers = { Authorization: `Bearer ${currentToken.access_token}` };
  const date = dayjs().format("MMMM D YYYY");
  const body = { description: `as of ${date}` };

  return await api({
    endpoint,
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    onError: () => toast.error("Error: Couldn't update the date"),
    onSuccess: () => toast.success("Updated the date."),
  });
};
