import { rest } from "msw";
import { knownArtistSongs } from "./mock-data";

export const handlers = [
  rest.get(/search/i, async (req, res, ctx) => {
    const artist = req.url.searchParams.get("term");
    if (artist === "known")
      return res(
        ctx.status(200),
        ctx.json({
          resultCount: knownArtistSongs.length,
          results: knownArtistSongs,
        })
      );
    else return res(ctx.status(200), ctx.json({ resultCount: 0, results: [] }));
  }),
];
