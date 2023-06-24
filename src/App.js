import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'
import { SpotifyAuth } from 'react-spotify-auth'
import Div100vh from 'react-div-100vh'
import dayjs from 'dayjs'

import Header from './Header';
import Heart from './Heart';
import Footer from './Footer';

const App = () => {
    const [token, setToken] = useState(Cookies.get('spotifyAuthToken'));
    const [likedSongsTotal, setLikedSongsTotal] = useState(0);
    const [playlistID, setPlaylistID] = useState('');
    const [loading, setLoading] = useState(false);

    let likedSongs = [];
    let endpoint = 'https://api.spotify.com/v1/me/tracks?limit=50';
    let offset = 0;

    useEffect(() => {
        setToken(Cookies.get('spotifyAuthToken'))
    }, [])

    const fetchLikedSongs = async (existingPlaylistID) => {
        const response = await fetch(endpoint, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        });

        const result = await response.json();

        if (likedSongsTotal === 0 && result.total !== 0) {
            setLikedSongsTotal(result.total);
        }

        likedSongs.push(result.items.map(({ track }) => track.uri));

        if (!!result.next) {
            endpoint = result.next;
            await fetchLikedSongs(existingPlaylistID);
        } else {
            await fetchUserID(existingPlaylistID);
        }
    }

    const fetchUserID = async (existingPlaylistID) => {
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        });

        const result = await response.json();
        existingPlaylistID ? await clearPlaylist(existingPlaylistID) : await createPlaylist(result.id);
    }

    const createPlaylist = async (userID) => {
        const url = new URL("https://api.spotify.com/v1/users/" + userID + "/playlists");
        const date = dayjs().format('MMMM Do YYYY');

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                name: 'Liked Songs',
                public: true,
                collaborative: false,
                description: `as of ${date}`,
            })
        })

        const result = await response.json();
        await addSongs(result.id);
    };

    const clearPlaylist = async (existingPlaylistID) => {
        const response = await fetch("https://api.spotify.com/v1/playlists/" + existingPlaylistID + "/tracks", {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                uris: [],
            })
        });

        // console.log(response.ok); // todo;

        updateDate(existingPlaylistID);
    }

    const updateDate = async (existingPlaylistID) => {
        const date = dayjs().format('MMMM Do YYYY');

        const response = await fetch(`https://api.spotify.com/v1/playlists/${existingPlaylistID}`, {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                description: `as of ${date}`,
            })
        });

        // console.log(response.ok); // todo

        addSongs(existingPlaylistID);
    }

    const addSongs = async (playlistID) => {
        const response = await fetch("https://api.spotify.com/v1/playlists/" + playlistID + "/tracks", {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                uris: likedSongs[offset],
            })
        });

        // console.log(response.ok); // todo

        if (((likedSongs.length - 1) > offset) && (offset < 200)) {
            offset = offset + 1;
            addSongs(playlistID);
        } else {
            setLoading(false);
            setPlaylistID(playlistID);
        }
    }

    const PlaylistShareView = () => {
        const url = `https://open.spotify.com/playlist/${playlistID}`
        return (
            <>
                <h2>Done!</h2>
                <a className="playlist-link" href={url}>{url}</a>
                <span style={{ fontSize: 'small', textAlign: 'center' }}>This playlist has been added to your account.</span>
            </>
        )
    }

    const PlaylistButton = () => {
        if (loading) {
            return (
                <span>Loading...</span>
            )
        }
        else {
            return (
                <button
                    className="generatePlaylistButton"
                    title="Get Your Playlist"
                    disabled={loading}
                    onClick={() => { setLoading(true); fetchLikedSongs() }}
                >
                    Get Your Playlist
                </button>
            )
        }
    }

    const OverwritePlaylistField = () => {
        const [url, setUrl] = useState([]);

        const handleSubmit = (event) => {
            try {
                event.preventDefault();
                const IDregex = /[/](\d|\w)+([?]|$)/;
                const playlistID = url.match(IDregex)[0].replace('/', '').replace('?', '');
                fetchLikedSongs(playlistID);
            } catch (error) {
                setLoading(false);
            }
        }

        if (loading) {
            return null;
        }

        else {
            return (
                <form onSubmit={(event) => { setLoading(true); handleSubmit(event) }}>
                    <label>
                        <span>or overwrite an existing playlist:</span>
                        <input
                            type="url"
                            id="existingPlaylistUrl"
                            placeholder="paste the playlist URL here"
                            onChange={event => setUrl(event.target.value)}
                            value={url}
                            required={true} />
                    </label>
                    <button
                        type="submit"
                        className="overwritePlaylistButton"
                        title="Overwrite Playlist"
                        disabled={loading}
                    >
                        →
                    </button>
                </form>
            )
        }
    }

    if (token) {
        if (playlistID !== '') {
            return (
                <Div100vh>
                    <div className="container">
                        <Header />
                        <Heart />
                        <div className="info">
                            <PlaylistShareView />
                        </div>
                        <Footer />
                    </div>
                </Div100vh>
            )
        }

        return (
            <Div100vh>
                <div className="container">
                    <Header />
                    <Heart />
                    <div className="info">
                        <PlaylistButton />
                        <OverwritePlaylistField />
                    </div>
                    <Footer />
                </div>
            </Div100vh>
        )
    } else return (
        <Div100vh>
            <div className="container">
                <Header />
                <Heart />
                <div className="info">
                    <SpotifyAuth
                        redirectUri='https://nonnullish.github.io/share-liked-songs'
                        clientID='05bff6f3b4d4467494c8be1b7895403e'
                        scopes={['playlist-modify-public', 'user-library-read']}
                    />
                </div>
                <Footer />
            </div>
        </Div100vh>
    )
}

export default App;