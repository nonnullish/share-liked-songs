const PlaylistShareView = ({ playlistID }) => {
    const url = `https://open.spotify.com/playlist/${playlistID}`
    return (
        <>
            <h2>Done!</h2>
            <a className="playlist-link" href={url}>{url}</a>
            <span style={{ fontSize: 'small', textAlign: 'center' }}>This playlist has been added to your account.</span>
        </>
    )
}

export default PlaylistShareView;