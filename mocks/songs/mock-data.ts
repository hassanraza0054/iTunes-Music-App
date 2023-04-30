import { Song } from "../../queries";

export const knownArtistSongs: Song[] = Array(5)
  .fill({})
  .map((_, index) => ({
    artistName: "artistName",
    artworkUrl100: "artworkUrl100",
    collectionName: "collectionName",
    previewUrl: `previewUrl${index}`,
    trackId: index,
    trackName: `trackName${index}`,
  }));

export const mockSong: Song = knownArtistSongs[0];
