<a id="readme-top"></a>
<div align="center">
  <a href="https://github.com/nonnullish/share-liked-songs">
    <img src="public/heart.svg" alt="Heart" width="80" height="80">
  </a>

<h3 align="center">Share Liked Songs</h3>

  <p align="center">
    Create a shareable copy of your Liked Songs playlist
    <br />
    <a href="https://nonnullish.github.io/share-liked-songs/">Go to App</a>
    ·
    <a href="https://github.com/nonnullish/share-liked-songs/issues/new?labels=bug.md">Report Bug</a>
    ·
    <a href="https://github.com/nonnullish/share-liked-songs/issues/new?labels=enhancement.md">Request Feature</a>
  </p>
</div>

## About

Since Spotify doesn't allow sharing Liked Songs in the official app, this is a web page that automatically copies all your liked songs onto a public playlist and gives you the link.

## Info & Help
- If something doesn't work:
    - try running the app in the private / incognito mode,
    - revoke the app permissions [here](https://www.spotify.com/account/apps/),
    - make sure your internet connection is stable.
- If I add a song to my liked songs, does it automatically update the other playlist or do I need to run a copy again?
    - It doesn't work in the background, but you can update the same playlist manually periodically. The previously generated (or updated) playlist is saved by default in the browser.
- Only 10 000 of my songs have made it onto the playlist.
    - That's a limitation enforced by Spotify.

## Contributing

Contributions are welcome! If you have a suggestion that would make this project better, please fork the repo and create a pull request. You can also open an issue first to discuss your idea or request help or guidance.

### Authorization to Spotify API

The authorization is performed with the [PKCE Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow). To develop the app locally, you will need to sign up for a [Spotify Developer account](https://developer.spotify.com/) and replace the `client_id` and the `redirect_uri` wherever applicable.

## License

Distributed under the MIT License. See `LICENSE.md` for more information.


