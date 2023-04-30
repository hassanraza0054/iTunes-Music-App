import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { NativeBaseProvider } from "native-base";
import React, { FC, ReactElement } from "react";

const client = new QueryClient();

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={client}>
      <NativeBaseProvider
        initialWindowMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        {children}
      </NativeBaseProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: { createNodeMock?: (element: React.ReactElement) => any }
) => render(ui, { ...options, wrapper: AllTheProviders });

export * from "@testing-library/react-native";
export { customRender as render };
