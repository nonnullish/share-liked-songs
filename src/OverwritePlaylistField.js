import { useState } from "react";

const OverwritePlaylistField = ({ loading, setLoading, handleSubmit }) => {
    const [url, setUrl] = useState([]);

    if (loading) {
        return null;
    }

    else {
        return (
            <form onSubmit={(event) => { setLoading(true); handleSubmit(event, url) }}>
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

export default OverwritePlaylistField;