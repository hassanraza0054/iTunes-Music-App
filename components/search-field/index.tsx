import Ionicons from "@expo/vector-icons/Ionicons";
import { IInputProps, Input, useToken } from "native-base";

import React, { FC } from "react";
import { useDebounce } from "../../hooks";

export const SearchField: FC<IInputProps> = ({ onChangeText, ...rest }) => {
  const debounce = useDebounce();
  const [white] = useToken("colors", ["white"]);
  const [size2, size4] = useToken("sizes", [2, 4]);

  return (
    <Input
      testID="search-field"
      onChangeText={(value) => debounce(() => onChangeText?.(value))}
      InputRightElement={
        <Ionicons
          name="search"
          color={white}
          size={size4}
          style={{ marginRight: size2 }}
        />
      }
      {...rest}
    />
  );
};
