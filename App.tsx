import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import {
  Box,
  Divider,
  extendTheme,
  FlatList,
  HStack,
  NativeBaseProvider,
  Spinner,
  StatusBar,
  Text,
  Toast,
  useToken,
  View,
  VStack,
} from "native-base";
import React, { FC, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Player, SearchField, SongCard } from "./components";
import { Song, useSearchByArtistQuery } from "./queries";

export const App = () => {
  const [artist, setArtist] = useState("");

  const { bottom: safeAreaBottom } = useSafeAreaInsets();

  const [size40] = useToken("sizes", [40]);

  const { isLoading, data, isFetching } = useSearchByArtistQuery(artist);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
    });
  }, []);

  const [selectedSong, setSelectedSong] = useState<Song | null>();
  const [lastPlayedSong, setLastPlayedSong] = useState<Song | null>();
  const [player, setPlayer] = useState<Audio.Sound | null>();

  const [status, setStatus] = useState<
    "not-started" | "playing" | "paused" | "finished"
  >("not-started");

  useEffect(() => {
    const newPlayer = new Audio.Sound();
    setPlayer(newPlayer);
    newPlayer.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded) {
        if (s.isPlaying) setStatus("playing");
        else setStatus("paused");
        if (s.durationMillis === s.positionMillis) setStatus("finished");
      }
    });
    return () => {
      newPlayer.unloadAsync();
    };
  }, []);

  const selectedSongIsLastPlayed =
    selectedSong &&
    lastPlayedSong &&
    selectedSong.trackId === lastPlayedSong.trackId;

  const selectedSongIsPlaying =
    selectedSongIsLastPlayed && status === "playing";

  const onSelectSongMutation = async (song: Song) => {
    setSelectedSong(song);
    if (!lastPlayedSong) {
      await player?.loadAsync({ uri: song.previewUrl }, { shouldPlay: true });
      setLastPlayedSong(song);
    }
  };

  const { mutate: onSelectSong, isLoading: selectingSong } = useMutation({
    mutationFn: onSelectSongMutation,
  });

  const pauseSong = () => player?.pauseAsync();

  const playSongMutation = async () => {
    if (selectedSongIsLastPlayed) {
      if (status === "finished") await player?.setPositionAsync(0);
      await player?.playAsync();
    } else if (selectedSong) {
      await player?.unloadAsync();
      await player?.loadAsync(
        { uri: selectedSong.previewUrl },
        { shouldPlay: true }
      );
      setLastPlayedSong(selectedSong);
    }
  };

  const { mutate: playSong, isLoading: loadingSong } = useMutation({
    mutationFn: playSongMutation,
  });

  return (
    <Box
      safeAreaTop
      px={5}
      pt={5}
      bgColor="coolGray.800"
      flex={1}
      position="relative"
    >
      <VStack space={5} flex={1}>
        <SearchField
          placeholder="Search by artist name"
          onChangeText={setArtist}
        />

        {!data && artist && isLoading ? <Spinner color="primary.500" /> : null}

        {data && (
          <>
            <HStack>
              <Text flex={1} bold>
                {data.resultCount > 0
                  ? `Results by artist "${artist}"`
                  : `Sorry we were not able to find any songs for artist "${artist}"`}
              </Text>
              <View>{isFetching && <Spinner />}</View>
            </HStack>

            <FlatList
              flex={1}
              contentContainerStyle={{
                paddingBottom: selectedSong ? size40 : safeAreaBottom,
              }}
              data={data.results}
              renderItem={({ item }) => (
                <SongCard
                  onPress={() => onSelectSong(item)}
                  song={item}
                  isLastPlayed={item.trackId === lastPlayedSong?.trackId}
                  status={status}
                />
              )}
              ItemSeparatorComponent={Divider}
              keyExtractor={(item) => item.trackId.toString()}
            />
          </>
        )}
      </VStack>

      {selectedSong ? (
        <Player
          song={selectedSong}
          loading={loadingSong || selectingSong}
          playing={!!selectedSongIsPlaying}
          onPlayButtonPress={() =>
            selectedSongIsPlaying ? pauseSong() : playSong()
          }
        />
      ) : undefined}
    </Box>
  );
};

const client = new QueryClient();

client.setDefaultOptions({
  queries: {
    onError: (error) => {
      if (error instanceof Error)
        Toast.show({ description: error.message, placement: "top" });
    },
  },
  mutations: {
    onError: (error) => {
      if (error instanceof Error)
        Toast.show({ description: error.message, placement: "top" });
    },
  },
});

// extend the theme
const customTheme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
  components: {
    Input: {
      defaultProps: {
        placeholderTextColor: "coolGray.400",
        borderColor: "coolGray.700",
        height: 10,
      },
    },
  },
});

const AppWithProvider: FC = () => {
  return (
    <QueryClientProvider client={client}>
      <NativeBaseProvider theme={customTheme}>
        <App />
        <StatusBar barStyle="light-content" />
      </NativeBaseProvider>
    </QueryClientProvider>
  );
};

export default AppWithProvider;
