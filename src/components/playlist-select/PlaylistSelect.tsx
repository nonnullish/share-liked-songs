import { useEffect, useRef, useState } from "react";
import ReactSelect, {
  OptionProps,
  SingleValueProps,
  components,
} from "react-select";

import { ArrowRightIcon, OverwriteIcon } from "@components/icons";
import { IPlaylist } from "@interfaces/music";

import "./select.css";

interface IProps {
  isFetching: boolean;
  playlists: IPlaylist[];
}

const SingleValue = ({
  children,
  ...props
}: { children: any } & SingleValueProps) => {
  const [name, id] = children?.split("|");

  return (
    <components.SingleValue {...props}>
      <div className="selected-value">
        <span className="name">{name}</span>
        <span className="id">ID: {id}</span>
      </div>
    </components.SingleValue>
  );
};

const Option = ({ children, ...props }: { children: any } & OptionProps) => {
  const [name, id] = children?.split("|");

  return (
    <components.Option {...props}>
      <div className="selected-value">
        <span className="name">{name}</span>
        <span className="id">ID: {id}</span>
      </div>
    </components.Option>
  );
};

export const PlaylistSelect = ({ isFetching, playlists }: IProps) => {
  const [options, setOptions] = useState<any>([]);
  const [value, setValue] = useState<any>("");
  const [placeholder, setPlaceholder] = useState("Paste the playlist URL here");

  const ref = useRef<any>();

  useEffect(() => {
    setOptions(
      playlists.map((playlist) => ({
        label: `${playlist.name}|${playlist.id}`,
        value: playlist.id,
      }))
    );
  }, [playlists]);

  useEffect(() => {
    setValue(
      options.find(({ value }: any) =>
        localStorage.getItem("playlistURL")?.includes(value)
      )
    );
  }, [options]);

  return (
    <div className="playlist-select">
      <label htmlFor="playlist" className="label">
        Update an existing playlist
      </label>
      <div className="input">
        <OverwriteIcon />
        <ReactSelect
          ref={ref}
          components={{ Option, SingleValue }}
          filterOption={({ value }, input) => input.includes(value)}
          noOptionsMessage={({ inputValue }) =>
            inputValue ? "Playlist not found" : ""
          }
          isDisabled={!playlists.length}
          isLoading={!playlists.length}
          value={value}
          onChange={setValue}
          isSearchable
          required
          menuIsOpen={false}
          unstyled
          name="playlist"
          id="playlist"
          inputValue=""
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder={placeholder}
          onInputChange={(input, { action }) => {
            if (action !== "input-change") {
              return;
            }

            const option = options.find(({ value }: { value: string }) =>
              input.includes(value)
            );

            if (!option) {
              setValue(undefined);
              setPlaceholder("Playlist not found");
              return;
            }

            setValue(option);
            ref.current.blur();
            setPlaceholder("");
          }}
          options={options}
        />
        <button type="submit" disabled={isFetching || !value}>
          <ArrowRightIcon />
        </button>
      </div>
      <div className="help">
        Paste the URL of a playlist that you want to update above. The
        previously generated playlist is saved by default.
      </div>
    </div>
  );
};
