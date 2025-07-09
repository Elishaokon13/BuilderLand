"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { sdk } from "@farcaster/frame-sdk";

interface AnalysisResults {
  address: string;
  analysisDate: string;
  longTermPositions: Array<{
    symbol: string;
    balance: string;
    firstAcquired: string;
    daysHeld: number;
    tokenAddress: string;
  }>;
  summary: {
    totalLongTermPositions: number;
    totalShortTermPositions: number;
    eligibleForLongTermGains: boolean;
  };
}
import { wrapFetchWithPayment } from "x402-fetch";
import { getWalletClient } from "wagmi/actions";
import { createConfig, http } from "@wagmi/core";
import { mainnet, base, baseSepolia } from "@wagmi/core/chains";
import { createClient } from "viem";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [user, setUser] = useState<any>(null);

  const addFrame = useAddFrame();

  const config = createConfig({
    chains: [mainnet, base, baseSepolia],
    client({ chain }) {
      return createClient({ chain, transport: http() });
    },
  });

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();
        const isInMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(isInMiniApp);
      } catch (error) {
        console.log('Not running in Mini App context or SDK not available:', error);
      }
    };

    initMiniApp();
  }, []);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  // Farcaster Sign In
  const handleSignIn = useCallback(async () => {
    try {
      const nonce = Math.random().toString(36).substring(7);
      const result = await sdk.actions.signIn({ nonce });
      setUser({ username: "farcaster_user", token: "mock_token" });
      setMessage("Successfully signed in with Farcaster!");
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage("Sign in failed. Please try again.");
    }
  }, []);

  const handleAnalyzeWallet = useCallback(async () => {
    if (!user) {
      setMessage("Please sign in with Farcaster first");
      return;
    }

    if (!targetAddress || targetAddress.length < 10) {
      setMessage("Please enter a valid wallet address");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setAnalysisResults(null);

    try {
      // For x402 payment, we'll use a simple fetch since Farcaster handles the wallet
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`, // Use Farcaster auth
        },
        body: JSON.stringify({ address: targetAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResults(data);
      setMessage(`Analysis complete! Found ${data.longTermPositions?.length || 0} long-term positions.`);
    } catch (error) {
      console.error("Error analyzing wallet:", error);
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("payment")) {
          errorMessage = "Payment failed. Please ensure you have sufficient funds and try again.";
        } else if (error.message.includes("network") || error.message.includes("RPC")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("address")) {
          errorMessage = "Invalid wallet address. Please check the address and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, targetAddress]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20"
        >
          Save
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg border border-white/20">
          ✓ Saved
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="min-h-screen bg-[#0052ff] text-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-lg font-semibold">
            DeFi Tax Analyzer
          </div>
          
          <div className="flex items-center space-x-4">
            {saveFrameButton}
            {!user ? (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={() => setUser(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              DeFi Tax Challenge
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Long-Term Capital Gains Analysis
            </p>
          </div>

          {/* Analysis Details */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Analysis Details</h2>
            
            <div>
              <p>
                This app analyzes your DeFi positions to determine if you have any long-term positions that are eligible for tax optimization.
              </p>
            </div>

            {/* Wallet Input */}
            <div>
              <div className="mb-4">
                <label htmlFor="wallet-address" className="block text-sm text-white/60 mb-2">
                  Wallet Address
                </label>
                <input
                  id="wallet-address"
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0x... or ENS name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all duration-200"
                />
              </div>

              <button
                onClick={handleAnalyzeWallet}
                disabled={!user || isLoading || !targetAddress}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  !user || isLoading || !targetAddress
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-white text-[#0052ff] hover:bg-white/90 font-semibold'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0052ff] border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze Positions ($1)'
                )}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <div className="font-medium">Scanning Ethereum blockchain...</div>
                </div>
                <div className="text-sm text-white/60">
                  Analyzing token balances and transaction history for long-term positions
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mb-8 p-4 rounded-lg border ${
                message.startsWith('Error')
                  ? 'bg-red-500/10 border-red-400/20 text-red-200'
                  : 'bg-green-500/10 border-green-400/20 text-green-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Results Section */}
          {analysisResults && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Analysis Results</h2>
              
              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {analysisResults.summary?.totalLongTermPositions || 0}
                  </div>
                  <div className="text-sm text-white/60">Long-term Positions</div>
                  <div className="text-xs text-white/40">(Held &gt;1 year)</div>
                </div>
                
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-300 mb-2">
                    {analysisResults.summary?.totalShortTermPositions || 0}
                  </div>
                  <div className="text-sm text-white/60">Short-term Positions</div>
                  <div className="text-xs text-white/40">(Held &lt;1 year)</div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">
                    {analysisResults.longTermPositions?.length || 0}
                  </div>
                  <div className="text-sm text-white/60">Eligible Tokens</div>
                  <div className="text-xs text-white/40">For tax optimization</div>
                </div>
              </div>

              {/* Long-term Positions List */}
              {analysisResults.longTermPositions?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Long-term Positions (Tax Optimized)</h3>
                  <div className="space-y-4">
                    {analysisResults.longTermPositions.map((position, index) => (
                      <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg mb-1">
                              {position.symbol || 'Unknown Token'}
                            </div>
                            <div className="text-sm text-white/60 mb-1">
                              Balance: {parseFloat(position.balance).toLocaleString()}
                            </div>
                            <div className="text-sm text-white/60">
                              First acquired: {position.firstAcquired}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded border border-green-400/20">
                              {position.daysHeld} days
                            </div>
                            <div className="text-xs text-green-300 mt-1">
                              ✓ Long-term eligible
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No positions found */}
              {(!analysisResults.longTermPositions || analysisResults.longTermPositions.length === 0) && (
                <div className="p-6 bg-amber-500/10 border border-amber-400/20 rounded-lg text-center">
                  <div className="text-amber-300 text-lg mb-2">⚠️</div>
                  <div className="font-medium mb-2">No long-term positions found</div>
                  <div className="text-sm text-white/60">
                    Analysis covers major ERC-20 tokens: USDC, WETH, WBTC, DAI, USDT
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-lg font-medium mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <div>Connect your Farcaster account to authenticate</div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <div>Enter any Ethereum wallet address for analysis</div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <div>Pay $1 to get comprehensive DeFi position analysis</div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                <div>Optimize your tax strategy with long-term capital gains insights</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
