import React from "react";
import { Player, PlayerProps } from ".";
import { mockSong } from "../../mocks";
import { fireEvent, render, screen } from "../../test-utils";

const mockPlayButtonPress = jest.fn();

const setup = (props: Omit<PlayerProps, "song"> = {}) => {
  render(
    <Player
      song={mockSong}
      onPlayButtonPress={mockPlayButtonPress}
      {...props}
    />
  );
  return { playButton: screen.getByTestId(/play-button/i) };
};

describe("<Player />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render without error", () => {
    setup();
  });

  it("should have correct song information", () => {
    setup();
    screen.getByText(mockSong.trackName);
    screen.getByText(mockSong.artistName);
  });

  it("should render play song", () => {
    setup({ playing: false });
    screen.getByText(/play song/i);
  });

  it("should render pause song", () => {
    setup({ playing: true });
    screen.getByText(/pause song/i);
  });

  it("should call the on press method", () => {
    const { playButton } = setup();
    fireEvent.press(playButton);
    expect(mockPlayButtonPress).toBeCalled();
  });
});
