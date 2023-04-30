export type Song = {
  artistName: string;
  artworkUrl100: string;
  collectionName: string;
  previewUrl: string;
  trackId: number;
  trackName: string;
};

export type SearchResponse = {
  resultCount: number;
  results: Song[];
};
