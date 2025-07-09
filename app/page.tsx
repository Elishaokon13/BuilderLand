"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { useAccount, useConnect, useDisconnect } from "wagmi";

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


export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const addFrame = useAddFrame();
  
  // Wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();
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

  // Wallet connection using Farcaster Mini App connector
  const handleConnect = useCallback(async () => {
    if (isPending) return; // Prevent double clicks
    
    try {
      setMessage("Connecting wallet...");
      
      // Find the Farcaster Mini App connector
      const farcasterConnector = connectors.find(
        (connector) => connector.name === "farcasterMiniApp"
      );
      
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
        setMessage("Wallet connected successfully!");
      } else {
        setMessage("Farcaster connector not found. Please ensure you're in a Farcaster Mini App.");
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setMessage("Failed to connect wallet. Please try again.");
    }
  }, [isPending, connectors, connect]);

  const handleAnalyzeWallet = useCallback(async () => {
    if (!isConnected) {
      setMessage("Please connect your wallet first");
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
      // For x402 payment, we'll use the connected wallet address for authorization
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${address}`, // Use wallet address for auth
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
  }, [isConnected, address, targetAddress]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20 min-h-[44px] min-w-[70px]"
        >
          Save
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg border border-white/20 min-h-[44px] min-w-[80px] flex items-center justify-center">
          ✓ Saved
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="min-h-screen font-pixel bg-[#0052ff] text-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          {/* <div className="text-lg sm:text-xl font-semibold font-pixel">
            Checkraa
          </div> */}
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {saveFrameButton}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isPending}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20 min-h-[44px] min-w-[80px] flex items-center justify-center ${
                  isPending 
                    ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-white/20 active:bg-white/30'
                }`}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  disconnect();
                  setMessage("");
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20 min-h-[44px] min-w-[90px] active:bg-white/30"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-pixel leading-tight">
              Checkraa
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 font-pixel leading-relaxed px-4 sm:px-0">
              Long-Term Capital Gains Analysis
            </p>
          </div>

          {/* Analysis Details */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 font-pixel">Analysis Details</h2>
            
            <div className="mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                This app analyzes your DeFi positions to determine if you have any long-term positions that are eligible for tax optimization.
              </p>
            </div>

            {/* Wallet Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="wallet-address" className="block text-sm sm:text-base text-white/60 mb-2 font-medium">
                  Wallet Address
                </label>
                <input
                  id="wallet-address"
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0x... or ENS name"
                  className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all duration-200 text-sm sm:text-base min-h-[50px]"
                />
              </div>

              <button
                onClick={handleAnalyzeWallet}
                disabled={!isConnected || isLoading || !targetAddress}
                className={`w-full py-3 sm:py-4 px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[50px] sm:min-h-[56px] ${
                  !isConnected || isLoading || !targetAddress
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-white text-[#0052ff] hover:bg-white/90 font-semibold active:bg-white/80'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#0052ff] border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze Positions ($1)'
                )}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent flex-shrink-0"></div>
                  <div className="font-medium text-sm sm:text-base">Scanning Ethereum blockchain...</div>
                </div>
                <div className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Analyzing token balances and transaction history for long-term positions
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-lg border text-sm sm:text-base leading-relaxed ${
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
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 font-pixel">Analysis Results</h2>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-300 mb-2">
                    {analysisResults.summary?.totalLongTermPositions || 0}
                  </div>
                  <div className="text-sm sm:text-base text-white/60 font-medium">Long-term Positions</div>
                  <div className="text-xs sm:text-sm text-white/40">(Held &gt;1 year)</div>
                </div>
                
                <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-300 mb-2">
                    {analysisResults.summary?.totalShortTermPositions || 0}
                  </div>
                  <div className="text-sm sm:text-base text-white/60 font-medium">Short-term Positions</div>
                  <div className="text-xs sm:text-sm text-white/40">(Held &lt;1 year)</div>
                </div>

                <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">
                    {analysisResults.longTermPositions?.length || 0}
                  </div>
                  <div className="text-sm sm:text-base text-white/60 font-medium">Eligible Tokens</div>
                  <div className="text-xs sm:text-sm text-white/40">For tax optimization</div>
                </div>
              </div>

              {/* Long-term Positions List */}
              {analysisResults.longTermPositions?.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-medium mb-4 font-pixel">Long-term Positions (Tax Optimized)</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {analysisResults.longTermPositions.map((position, index) => (
                      <div key={index} className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-base sm:text-lg mb-2">
                              {position.symbol || 'Unknown Token'}
                            </div>
                            <div className="text-sm sm:text-base text-white/60 mb-1">
                              Balance: {parseFloat(position.balance).toLocaleString()}
                            </div>
                            <div className="text-sm sm:text-base text-white/60">
                              First acquired: {position.firstAcquired}
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1 sm:text-right">
                            <div className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded border border-green-400/20 whitespace-nowrap">
                              {position.daysHeld} days
                            </div>
                            <div className="text-xs sm:text-sm text-green-300">
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
                <div className="p-4 sm:p-6 bg-amber-500/10 border border-amber-400/20 rounded-lg text-center">
                  <div className="text-amber-300 text-xl sm:text-2xl mb-3">⚠️</div>
                  <div className="font-medium mb-2 text-sm sm:text-base">No long-term positions found</div>
                  <div className="text-xs sm:text-sm text-white/60 leading-relaxed">
                    Analysis covers major ERC-20 tokens: USDC, WETH, WBTC, DAI, USDT
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 font-pixel">How It Works</h3>
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div className="text-sm sm:text-base text-white/80 leading-relaxed">Connect your Farcaster account to authenticate</div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div className="text-sm sm:text-base text-white/80 leading-relaxed">Enter any Ethereum wallet address for analysis</div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div className="text-sm sm:text-base text-white/80 leading-relaxed">Pay $1 to get comprehensive DeFi position analysis</div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <div className="text-sm sm:text-base text-white/80 leading-relaxed">Optimize your tax strategy with long-term capital gains insights</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
