import {
  Badge,
  HStack,
  Image,
  IPressableProps,
  Pressable,
  Text,
  View,
} from "native-base";
import React, { FC } from "react";
import { Song } from "../../queries";

export interface SongCardProps extends IPressableProps {
  song: Song;
  isLastPlayed?: boolean;
  status?: "not-started" | "finished" | "playing" | "paused";
}

export const SongCard: FC<SongCardProps> = ({
  song,
  isLastPlayed,
  status,
  ...rest
}) => {
  return (
    <Pressable _pressed={{ opacity: 50 }} {...rest} testID="song-card">
      <HStack space={5} alignItems="center" py={5}>
        <Image
          borderRadius="lg"
          src={song.artworkUrl100}
          height={60}
          width={60}
          alt="art work"
        />
        <View flex={1}>
          <HStack space={2}>
            <Text fontSize="xl" numberOfLines={1} flex={1}>
              {song.trackName}
            </Text>
            {isLastPlayed && status !== "finished" && (
              <Badge
                testID="status-badge"
                variant="outline"
                colorScheme={status === "playing" ? "success" : "coolGray"}
              >
                {status === "playing" ? "Playing" : "Paused"}
              </Badge>
            )}
          </HStack>
          <Text>{song.artistName}</Text>
          <Text numberOfLines={1}>{song.collectionName}</Text>
        </View>
      </HStack>
    </Pressable>
  );
};
