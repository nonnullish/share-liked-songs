const PlaylistButton = ({ loading, progress, total, onClick }) => {
    if (loading) {
        return (
            <span>Loading... ({progress} / {total}) </span>
        )
    }
    else {
        return (
            <button
                className="generatePlaylistButton"
                title="Get Your Playlist"
                disabled={loading}
                onClick={onClick}
            >
                Get Your Playlist
            </button>
        )
    }
}

export default PlaylistButton;