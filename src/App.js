import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'
import { SpotifyAuth } from 'react-spotify-auth'
import Div100vh from 'react-div-100vh'
import moment from 'moment'


let Header = () => (
  <header>
    <h1>Share Liked Songs</h1>
    <span style={{ fontSize: 'small' }}>Create a shareable copy of your Liked Songs playlist.</span>
  </header>
)

let Heart = () => {
  return (
    <div alt="heart icon" className="heart-icon"></div>
  )
}

let Footer = () => {
  return (
    <footer>

      <div>
        <a href="https://twitter.com/halfelfnomad" title="Find me on Twitter">
          <div data-icon="ei-sc-twitter" data-size="s"></div>
        </a>
      </div>

      <div>
        <a style={{ fontSize: 'small' }} href="https://www.spotify.com/account/apps/">revoking account permissions</a>
      </div>

    </footer>
  )
}


function App() {
  const [token, setToken] = useState(Cookies.get('spotifyAuthToken'));
  const [likedSongsTotal, setLikedSongsTotal] = useState(0);
  const [playlistId, setPlaylistId] = useState('');
  const [loading, setLoading] = useState(false);

  let likedSongs = [];
  let endpoint = 'https://api.spotify.com/v1/me/tracks?limit=50';
  let offset = 0;

  useEffect(() => {
    setToken(Cookies.get('spotifyAuthToken'))
  }, [])

  let fetchLikedSongs = async () => {
    fetch(endpoint, {
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
    })
      .then(response => response.json())
      .then((result => {
        if (likedSongsTotal === 0 && result.total !== 0) {
          setLikedSongsTotal(result.total);
        }
        likedSongs.push(result.items.map(a => a.track.uri));
        if (result.next !== null) {
          endpoint = result.next;
          fetchLikedSongs();
        } else {
          fetchUserId()
        }
      }))
  }

  let fetchUserId = async () => {
    fetch("https://api.spotify.com/v1/me", {
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
    })
      .then(response => response.json())
      .then((result => {
        createPlaylist(result.id);
      }))
  }

  let createPlaylist = (userId) => {
    let url = new URL("https://api.spotify.com/v1/users/" + userId + "/playlists");
    let date = moment().format('MMMM Do YYYY');

    fetch(url, {
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
      .then(response => response.json())
      .then((result => {
        addSongs(result.id)
      }))
  };

  let addSongs = async (playlistId) => {
    fetch("https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", {
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
    })
      .then(response => response.json())
      .then((() => {
        if (((likedSongs.length - 1) > offset) && (offset < 200)) {
          offset = offset + 1;
          addSongs(playlistId)
        } else {
          setLoading(false);
          setPlaylistId(playlistId);
        }
      }))
  }

  let PlaylistShareView = () => {
    let url = `https://open.spotify.com/playlist/${playlistId}`
    return (
      <>
        <h2>Done!</h2>
        <a className="playlist-link" href={url}>{url}</a>
        <span style={{ fontSize: 'small', textAlign: 'center' }}>This playlist has been added to your account.</span>
      </>
    )
  }

  let PlaylistButton = () => {
    if (loading) {
      return (
        <div data-icon="ei-spinner" data-size="m"></div>
      )
    }
    else {
      return (
        <button
          className="generatePlaylistButton"
          title="Get Your Playlist"
          disabled={loading}
          onClick={() => { setLoading(true); fetchLikedSongs() }}>
          Get Your Playlist
        </button>
      )
    }
  }

  if (token) {
    if (playlistId !== '') {
      return (
        <Div100vh>
          <div className="container">
            <Header />
            <div className="mainView">
              <Heart />
            </div>
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
          <div className="mainView">
            <Heart />
          </div>
          <div className="info">
            <PlaylistButton />
          </div>
          <Footer />
        </div>
      </Div100vh>
    )
  } else return (
    <Div100vh>
      <div className="container">
        <Header />
        <div className="mainView">
          <Heart />
        </div>
        <div className="info">
          <SpotifyAuth
            redirectUri='https://tusindfryd.github.io/share-liked-songs'
            clientID='05bff6f3b4d4467494c8be1b7895403e'
            scopes={[
              'playlist-modify-public',
              'user-library-read']}
          />
        </div>
        <Footer />
      </div>
    </Div100vh>
  )

}

export default App;