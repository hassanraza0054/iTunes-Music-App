import React from "react";
import { SongCard, SongCardProps } from ".";
import { mockSong } from "../../mocks";
import { render, screen } from "../../test-utils";

const setup = (props: Omit<SongCardProps, "song"> = {}) => {
  render(<SongCard song={mockSong} {...props} />);
};

describe("<SongCard />", () => {
  it("should render without error", () => {
    setup();
  });

  it("should have correct data", () => {
    setup();
    screen.getByText(mockSong.artistName);
    screen.getByText(mockSong.collectionName);
    screen.getByText(mockSong.trackName);
  });

  it("it should show play status badge", () => {
    setup({ isLastPlayed: true, status: "playing" });
    screen.getByTestId("status-badge");
    screen.getByText(/playing/i);
  });

  it("should show paused status badge", () => {
    setup({ isLastPlayed: true, status: "paused" });
    screen.getByTestId("status-badge");
    screen.getByText(/paused/i);
  });

  it("should not show status badge if the song is last played but the status is finished", async () => {
    setup({ isLastPlayed: true, status: "finished" });
    expect(await screen.queryByTestId(/status-badge/i)).toBeNull();
  });
});
