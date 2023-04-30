import React, { FC } from "react";

import { BlurView } from "expo-blur";
import { Button, Factory, HStack, Image, Text, VStack } from "native-base";
import { IViewProps } from "native-base/lib/typescript/components/basic/View/types";
import { Platform } from "react-native";
import { Song } from "../../queries";

const NbBlurView = Factory(BlurView);

export interface PlayerProps extends IViewProps {
  song: Song;
  loading?: boolean;
  playing?: boolean;
  onPlayButtonPress?: () => void;
}

export const Player: FC<PlayerProps> = ({
  song,
  loading,
  playing,
  onPlayButtonPress,
  ...rest
}) => {
  return (
    <NbBlurView
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={40}
      p={5}
      intensity={Platform.OS === "android" ? 100 : 50}
      tint="dark"
      testID="player"
      {...rest}
    >
      <HStack height="full" alignItems="center" space={5}>
        <Image
          src={song.artworkUrl100}
          alt="album"
          height={100}
          width="100"
          borderRadius="lg"
        />
        <VStack flex={1} space={1}>
          <Text numberOfLines={1} fontSize="xl">
            {song.trackName}
          </Text>
          <Text numberOfLines={1}>{song.artistName}</Text>
          <Button
            onPress={onPlayButtonPress}
            disabled={loading}
            isLoading={loading}
            testID="play-button"
          >
            {playing ? "Pause Song" : "Play Song"}
          </Button>
        </VStack>
      </HStack>
    </NbBlurView>
  );
};
