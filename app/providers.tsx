"use client";

import React, { type ReactNode } from "react";
import { base, mainnet } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

// Wagmi configuration for Farcaster Mini App
const config = createConfig({
  chains: [base, mainnet],
  connectors: [miniAppConnector()],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

// React Query client
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "base",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DeFi Tax Analyzer",
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
          }}
        >
          {children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
