import React from "react";
import { App } from "./App";
import { knownArtistSongs } from "./mocks/songs";
import { act, fireEvent, render, screen, waitFor, within } from "./test-utils";

let eventListener: ((props: any) => void) | null = null;

const mockLoadAsync = jest.fn();
const mockUnloadAsync = jest.fn();
const mockPlayAsync = jest.fn();
const mockSetPositionAsync = jest.fn();
const mockPauseAsync = jest.fn();
const mockSetOnPlaybackStatus = jest.fn((listener) => {
  eventListener = listener;
});

jest.mock("expo-av", () => {
  const actual = jest.requireActual("expo-av");
  return {
    ...actual,
    Audio: {
      setAudioModeAsync: jest.fn(),
      Sound: jest.fn().mockImplementation(() => ({
        loadAsync: mockLoadAsync,
        unloadAsync: mockUnloadAsync,
        playAsync: mockPlayAsync,
        pauseAsync: mockPauseAsync,
        setPositionAsync: mockSetPositionAsync,
        setOnPlaybackStatusUpdate: mockSetOnPlaybackStatus,
      })),
    },
  };
});

const setup = () => {
  render(<App />);
  const searchField = screen.getByTestId(/search-field/i);
  const searchForKnownArtist = () => {
    fireEvent.changeText(searchField, "known");
  };
  const getSongs = async () => await screen.findAllByTestId(/song-card/i);
  const getPlayButton = async () => await screen.findByTestId(/play-button/i);
  const getPlayer = async () => await screen.findByTestId(/player/i);
  return {
    searchField,
    searchForKnownArtist,
    getSongs,
    getPlayButton,
    getPlayer,
  };
};

describe("<App />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render without error", () => {
    setup();
  });

  it("should show results for search", async () => {
    const { searchField, searchForKnownArtist, getSongs } = setup();
    fireEvent.changeText(searchField, "known");
    searchForKnownArtist();
    expect(await getSongs()).toHaveLength(knownArtistSongs.length);
  });

  it("should play the first selected song automatically", async () => {
    const { searchField, getSongs } = setup();
    fireEvent.changeText(searchField, "known");
    const firstSong = (await getSongs())[0];
    fireEvent.press(firstSong);

    await waitFor(() =>
      expect(mockLoadAsync).toBeCalledWith(
        { uri: knownArtistSongs[0].previewUrl },
        { shouldPlay: true }
      )
    );
  });

  it("should play the song on pressing play button", async () => {
    const { searchField, getSongs, getPlayButton } = setup();
    fireEvent.changeText(searchField, "known");
    const firstSong = (await getSongs())[0];
    fireEvent.press(firstSong);

    await waitFor(() =>
      expect(mockLoadAsync).toBeCalledWith(
        { uri: knownArtistSongs[0].previewUrl },
        { shouldPlay: true }
      )
    );

    fireEvent.press(await getPlayButton());
    await waitFor(() => expect(mockPlayAsync).toBeCalled());
  });

  it("should load the subsequent song and unload the previous song", async () => {
    const { searchForKnownArtist, getSongs, getPlayer, getPlayButton } =
      setup();
    searchForKnownArtist();
    const songs = await getSongs();
    fireEvent.press(songs[0]);

    await waitFor(() =>
      expect(mockLoadAsync).toBeCalledWith(
        { uri: knownArtistSongs[0].previewUrl },
        { shouldPlay: true }
      )
    );

    const player = await getPlayer();

    fireEvent.press(songs[1]);

    within(player).findByText(knownArtistSongs[1].trackName);

    fireEvent.press(await getPlayButton());

    await waitFor(() => {
      expect(mockUnloadAsync).toBeCalled();
    });
    expect(mockLoadAsync).toBeCalledWith(
      { uri: knownArtistSongs[1].previewUrl },
      { shouldPlay: true }
    );
  });

  it("should show fallback message if there are no songs for the artist", async () => {
    const { searchField } = setup();
    fireEvent.changeText(searchField, "unknown");
    await screen.findByText(
      /Sorry we were not able to find any songs for artist/i
    );
  });

  it("should set the event listener on mount", () => {
    setup();
    expect(mockSetOnPlaybackStatus).toBeCalled();
  });

  it("should render playing playback status on playing song card", async () => {
    const { searchForKnownArtist, getSongs, getPlayer } = setup();
    searchForKnownArtist();

    const song = (await getSongs())[0];
    fireEvent.press(song);
    await getPlayer();

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: true,
        durationMillis: 100,
        positionMillis: 10,
      });
    });

    await within(song).findByText(/playing/i);
  });

  it("should call the pause method", async () => {
    const { searchForKnownArtist, getSongs, getPlayer, getPlayButton } =
      setup();
    searchForKnownArtist();

    const song = (await getSongs())[0];
    fireEvent.press(song);
    await getPlayer();

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: true,
        durationMillis: 100,
        positionMillis: 10,
      });
    });

    await within(song).findByText(/playing/i);

    fireEvent.press(await getPlayButton());

    expect(mockPauseAsync).toBeCalled();
  });

  it("should render paused playback status on playing song card", async () => {
    const { searchForKnownArtist, getSongs, getPlayer } = setup();
    searchForKnownArtist();

    const song = (await getSongs())[0];
    fireEvent.press(song);
    await getPlayer();

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: false,
        durationMillis: 100,
        positionMillis: 10,
      });
    });

    await within(song).findByText(/paused/i);
  });

  it("should hide the playback status when the song is finished", async () => {
    const { searchForKnownArtist, getSongs, getPlayer } = setup();
    searchForKnownArtist();

    const song = (await getSongs())[0];
    fireEvent.press(song);
    await getPlayer();

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: true,
        durationMillis: 100,
        positionMillis: 10,
      });
    });

    await within(song).findByText(/playing/i);

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: false,
        durationMillis: 100,
        positionMillis: 100,
      });
    });

    expect(await within(song).queryByText(/playing/i)).toBeNull();
  });

  it("should play the last played finished song from the start", async () => {
    const { searchForKnownArtist, getSongs, getPlayer, getPlayButton } =
      setup();
    searchForKnownArtist();
    const song = (await getSongs())[0];

    fireEvent.press(song);

    await getPlayer();

    act(() => {
      eventListener?.({
        isLoaded: true,
        isPlaying: false,
        durationMillis: 100,
        positionMillis: 100,
      });
    });

    fireEvent.press(await getPlayButton());

    await waitFor(() => expect(mockSetPositionAsync).toBeCalledWith(0));
  });
});
