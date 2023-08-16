import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { SpotifyAuth } from 'react-spotify-auth';
import dayjs from 'dayjs';

import { extractID } from './helpers';

const App = () => {
    const [token, setToken] = useState(Cookies.get('spotifyAuthToken'));
    const [progress, setProgress] = useState({ loaded: -Infinity, total: Infinity });
    const [overwrite, setOverwrite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    let likedSongs = [];
    let playlistID = extractID(localStorage.getItem('playlistURL'));

    const [url, setURL] = useState('');

    useEffect(() => {
        setToken(Cookies.get('spotifyAuthToken'))
    }, []);

    const getUserID = async () => {
        const response = await fetch("https://api.spotify.com/v1/me", {
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error fetching user ID${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);
        }

        return result.id;
    }

    const fetchLikedSongs = async (endpoint) => {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error fetching liked songs${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);
        }

        likedSongs.push(result.items.map(({ track }) => track.uri));
        setProgress(
            {
                loaded: likedSongs.flat().length,
                total: result.total,
            }
        );

        if (!!result.next) {
            await fetchLikedSongs(result.next);
        }
        else {
            return;
        };

    }

    const clearPlaylist = async (id) => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                uris: [],
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error overwriting the playlist${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);

        }
    }

    const updateDate = async (id) => {
        const date = dayjs().format('MMMM D YYYY');

        const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                description: `as of ${date}`,
            })
        });

        const result = await response.text();

        if (!response.ok) {
            throw new Error(`Error updating the date${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);
        }
    }

    const createPlaylist = async (userID) => {
        const url = new URL(`https://api.spotify.com/v1/users/${userID}/playlists`);
        const date = dayjs().format('MMMM D YYYY');

        const response = await fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                name: 'Liked Songs',
                public: true,
                collaborative: false,
                description: `as of ${date}`,
            })
        })

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error creating a new playlist${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);
        }

        playlistID = result.id;
        localStorage.setItem('playlistURL', `https://open.spotify.com/playlist/${result.id}`);
    }

    const addSongs = async (songs, playlistID) => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                uris: songs,
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error copying songs onto a new playlist${result?.error?.message ? `: ${result.error.message.toLowerCase()}` : '.'}`);
        }
    }

    const run = async () => {
        try {
            setLoading(true);
            await fetchLikedSongs('https://api.spotify.com/v1/me/tracks?limit=50');

            if (overwrite && playlistID) {
                await clearPlaylist(playlistID);
                await updateDate(playlistID);
            }
            else {
                const userID = await getUserID();
                await createPlaylist(userID);
            }

            for (const batch of likedSongs) {
                await addSongs(batch, playlistID);
            }

            setURL(`https://open.spotify.com/playlist/${playlistID}`);
            setLoading(false);
        } catch (e) {
            Cookies.remove('spotifyAuthToken');
            setError(e);
        }

    }

    return (
        <>
            <header>
                <h1>Share Liked Songs</h1>
                <span style={{ fontSize: 'small' }}>Create a shareable copy of your Liked Songs playlist.</span>
            </header>

            <div alt="heart icon" className="heart-icon"></div>
            <div className="content">
                {!token && (
                    <SpotifyAuth
                        redirectUri='https://nonnullish.github.io/share-liked-songs'
                        clientID='05bff6f3b4d4467494c8be1b7895403e'
                        scopes={['playlist-modify-public', 'user-library-read']}
                    />
                )}

                {token && error && (
                    <p>{error.message}</p>
                )}

                {token && !loading && (progress.loaded !== progress.total) && !error && (
                    <>
                        <button
                            className="generate-playlist"
                            title="Get Your Playlist"
                            disabled={loading}
                            onClick={run}
                        >
                            Get Your Playlist
                        </button>

                        <div className='overwrite-field column'>
                            <div className='row checkbox'>
                                <input
                                    id='overwrite'
                                    type='checkbox'
                                    defaultChecked={false}
                                    disabled={loading}
                                    onChange={(event) => setOverwrite(event.target.checked)}
                                />
                                <label htmlFor='overwrite'>Overwrite an existing playlist:</label>
                            </div>
                            <div className='row'>
                                <input
                                    type="url"
                                    id="existing-playlist-url"
                                    placeholder="Paste the playlist URL here"
                                    onChange={(event) => {
                                        const id = extractID(event.target.value);
                                        if (id) {
                                            localStorage.setItem('playlistURL', event.target.value);
                                            playlistID = id;
                                        }
                                    }}
                                    defaultValue={localStorage.getItem('playlistURL') || ''}
                                />
                            </div>
                        </div>

                    </>
                )}

                {token && loading && !error && (
                    <div className='progress-bar-wrapper'>
                        <div
                            className="progress-bar"
                            style={{ width: `${(progress.loaded / progress.total) * 100 || 0}%` }}
                        />
                    </div>
                )}

                {token && !loading && (progress.loaded === progress.total) && !error && (
                    <div className='playlist-link'>
                        <span className='playlist-link-label'>The playlist has been added to your account.</span>
                        <a className="playlist-link-url" href={url}>{url}</a>
                    </div>
                )}

            </div>

            <footer>
                <div>
                    <a href="https://elk.zone/indieweb.social/@nonnullish" title="Find me on Mastodon">
                        <div data-icon="ei-comment" data-size="s"></div>
                    </a>
                </div>

                <div>
                    <a style={{ fontSize: 'small' }} href="https://www.spotify.com/account/apps/">Revoking account permissions</a>
                </div>
            </footer>
        </>
    )
}

export default App;