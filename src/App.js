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
  const [playlistID, setPlaylistID] = useState('');
  const [loading, setLoading] = useState(false);

  let likedSongs = [];
  let endpoint = 'https://api.spotify.com/v1/me/tracks?limit=50';
  let offset = 0;

  useEffect(() => {
    setToken(Cookies.get('spotifyAuthToken'))
  }, [])

  let fetchLikedSongs = async (existingPlaylistID) => {
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
          fetchLikedSongs(existingPlaylistID);
        } else {
          fetchUserID(existingPlaylistID)
        }
      }))
  }

  let fetchUserID = async (existingPlaylistID) => {
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
        if (existingPlaylistID) {
          clearPlaylist(existingPlaylistID);
        }
        else {
          createPlaylist(result.id);
        }
      }))
  }

  let createPlaylist = (userID) => {
    let url = new URL("https://api.spotify.com/v1/users/" + userID + "/playlists");
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

  let clearPlaylist = async (existingPlaylistID) => {
    fetch("https://api.spotify.com/v1/playlists/" + existingPlaylistID + "/tracks", {
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
    })
      .then(response => response.json())
      .then((() => {
        updateDate(existingPlaylistID);
      }))
  }

  let updateDate = async (existingPlaylistID) => {
    let date = moment().format('MMMM Do YYYY');

    fetch(`https://api.spotify.com/v1/playlists/${existingPlaylistID}`, {
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
    })
      .then((() => {
        addSongs(existingPlaylistID);
      }))
  }

  let addSongs = async (playlistID) => {
    fetch("https://api.spotify.com/v1/playlists/" + playlistID + "/tracks", {
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
          addSongs(playlistID)
        } else {
          setLoading(false);
          setPlaylistID(playlistID);
        }
      }))
  }

  let PlaylistShareView = () => {
    let url = `https://open.spotify.com/playlist/${playlistID}`
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
        <span>Loading...</span>
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

  let OverwritePlaylistField = () => {
    const [url, setUrl] = useState([]);

    let handleSubmit = (event) => {
      try {
        event.preventDefault();
        let IDregex = /[/](\d|\w)+([?]|$)/;
        let playlistID = url.match(IDregex)[0].replace('/', '').replace('?', ''); // no sanity check we die like men
        fetchLikedSongs(playlistID);
      } catch (error) {
        setLoading(false);
      }
    }
    if (loading) {
      return (
        <></>
      )
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
            disabled={loading}>
            →</button>
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