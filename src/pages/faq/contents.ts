export const contents = `
# Info & Help

### If something doesn't work:
  - try running the app in the private / incognito mode,
  - revoke the app permissions [here](https://www.spotify.com/account/apps/),
  - make sure your internet connection is stable.


### How does the app work?

The source code is available [here](https://github.com/nonnullish/share-liked-songs).
In short, through the [Spotify API](https://developer.spotify.com/documentation/web-api),
the browser fetches the list of the liked songs, and then creates a new
playlist with these songs.


 ### In the agreement it says that “we can edit or remove something on your behalf”. What does that mean?

 The app needs to “take actions in Spotify on your behalf: Create,
 edit, and follow playlists” - that is because the app needs the
 permission to save a new playlist (one with the songs you've liked) to
 your account, or update an old one.

 I am not collecting any data or performing any other actions with it,
 but if you want, you can revoke the permissions here:
 [https://www.spotify.com/account/apps/](https://www.spotify.com/account/apps/).


 ### Does this work constantly? If I add a song to my liked songs, does it automatically update the other playlist or do I need to run a copy again? 

 It doesn't work in the background, but you can update the same playlist manually periodically.
 The previously generated (or updated) playlist is saved by default in the browser.

 ### I get network errors.

 Unfortunately, the network has to be pretty stable for this app to work.
 You can try using mobile data if that's an option.


 ### I get errors mentioning authorization or an expired token.
 
 Try revoking the app permissions [here](https://www.spotify.com/account/apps/).
 If that doesn't work, try running the app in the private / incognito mode.
 Make sure your internet connection is stable.


 ### Only 10 000 of my songs have made it onto the playlist.

 That's a limitation enforced by Spotify.


 ### Can you add a feature? Can I add a feature?

 Probably! The source code is available [here](https://github.com/nonnullish/share-liked-songs).
 Feel free to contact me with questions.
`;