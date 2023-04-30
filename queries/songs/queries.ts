import { useQuery } from "@tanstack/react-query";
import { appAxios } from "../app-axios";
import type { QueryPropsHelper } from "../types";
import { SearchResponse } from "./types";
const keys = {
  all: () => [{ scope: "song" }] as const,
  searchByArtist: (artist: string) => [{ ...keys.all()[0], artist }] as const,
};

type QueryProps<T extends keyof typeof keys> = QueryPropsHelper<typeof keys, T>;

const searchByArtist = async ({
  queryKey: [{ artist }],
}: QueryProps<"searchByArtist">) =>
  (
    await appAxios.get<SearchResponse>("/search", {
      params: {
        term: artist,
        media: "music",
        attribute: "artistTerm",
        limit: 25,
      },
    })
  ).data;

export const useSearchByArtistQuery = (artist: string) =>
  useQuery({
    queryKey: keys.searchByArtist(artist),
    queryFn: searchByArtist,
    enabled: !!artist,
  });
