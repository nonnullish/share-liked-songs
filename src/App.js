import React, { useState, useEffect } from 'react';
import Div100vh from 'react-div-100vh'
import { SpotifyAuth } from 'react-spotify-auth'
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie'
import dayjs from 'dayjs'

import Header from './Header';
import Heart from './Heart';
import Footer from './Footer';
import PlaylistShareView from './PlaylistShareView';
import PlaylistButton from './PlaylistButton';
import OverwritePlaylistField from './OverwritePlaylistField';

const App = () => {
    const [token, setToken] = useState(Cookies.get('spotifyAuthToken'));
    const [likedSongsTotal, setLikedSongsTotal] = useState(0);
    const [playlistID, setPlaylistID] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    let likedSongs = [];
    let endpoint = 'https://api.spotify.com/v1/me/tracks?limit=50';
    let offset = 0;

    useEffect(() => {
        setToken(Cookies.get('spotifyAuthToken'))
    }, [])

    const fetchLikedSongs = async (existingPlaylistID) => {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
        });

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.');
        }

        const result = await response.json();

        if (likedSongsTotal === 0 && result.total !== 0) {
            setLikedSongsTotal(result.total);
        }

        likedSongs.push(result.items.map(({ track }) => track.uri));
        setProgress(likedSongs.flat().length);

        if (!!result.next) {
            endpoint = result.next;
            await fetchLikedSongs(existingPlaylistID);
        } else {
            await fetchUserID(existingPlaylistID);
        }
    }

    const fetchUserID = async (existingPlaylistID) => {
        const response = await fetch("https://api.spotify.com/v1/me", {
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            referrerPolicy: 'no-referrer',
        });

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.')
        }

        const result = await response.json();
        existingPlaylistID ? await clearPlaylist(existingPlaylistID) : await createPlaylist(result.id);
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

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.')
        }

        const result = await response.json();
        await addSongs(result.id);
    };

    const clearPlaylist = async (existingPlaylistID) => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${existingPlaylistID}/tracks`, {
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

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.')
        }

        updateDate(existingPlaylistID);
    }

    const updateDate = async (existingPlaylistID) => {
        const date = dayjs().format('MMMM D YYYY');

        const response = await fetch(`https://api.spotify.com/v1/playlists/${existingPlaylistID}`, {
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

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.')
        }

        addSongs(existingPlaylistID);
    }

    const addSongs = async (playlistID) => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                uris: likedSongs[offset],
            })
        });

        if (!response.ok) {
            toast.error('There was en error. Please try again or contact the developer.')
        }

        if (((likedSongs.length - 1) > offset) && (offset < 200)) {
            offset = offset + 1;
            addSongs(playlistID);
        } else {
            setLoading(false);
            setPlaylistID(playlistID);
        }
    }

    const handleSubmit = (event, url) => {
        try {
            event.preventDefault();
            const IDregex = /[/](\d|\w)+([?]|$)/;
            const playlistID = url.match(IDregex)[0].replace('/', '').replace('?', '');
            fetchLikedSongs(playlistID);
        } catch (error) {
            console.log(error)
            setLoading(false);
        }
    }

    return (
        <Div100vh>
            <div className="container">
                <Header />
                <Heart />
                <div className="info">
                    {!token &&
                        <SpotifyAuth
                            redirectUri='https://nonnullish.github.io/share-liked-songs'
                            clientID='05bff6f3b4d4467494c8be1b7895403e'
                            scopes={['playlist-modify-public', 'user-library-read']}
                        />
                    }
                    {token && !playlistID &&
                        <>
                            <PlaylistButton
                                loading={loading}
                                progress={progress}
                                total={likedSongsTotal}
                                onClick={() => { setLoading(true); fetchLikedSongs() }}
                            />
                            <OverwritePlaylistField
                                loading={loading}
                                setLoading={setLoading}
                                handleSubmit={handleSubmit} />
                        </>
                    }
                    {token && !!playlistID && <PlaylistShareView playlistID={playlistID} />}
                </div>
                <Toaster position="top-right" toastOptions={{ style: { fontSize: 'small' } }} />
                <Footer />
            </div>
        </Div100vh>
    )
}

export default App;