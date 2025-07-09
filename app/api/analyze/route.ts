import { NextResponse } from "next/server";
import { getTokenBalances, getETHBalance } from "@/lib/defi-analyzer";

/**
 * DeFi Position Analysis endpoint protected by x402 payment ($1).
 * Analyzes a wallet address to find positions held for >1 year.
 *
 * @returns {Promise<NextResponse>} JSON response with analysis results
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log(`Analyzing wallet: ${address}`);

    // Validate address format
    if (!address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Get current token balances
    const [tokenBalances, ethBalance] = await Promise.all([
      getTokenBalances(address as `0x${string}`),
      getETHBalance(address as `0x${string}`)
    ]);

    // Add ETH to balances if > 0
    const allBalances = ethBalance.rawBalance > 0n 
      ? [ethBalance, ...tokenBalances] 
      : tokenBalances;

    // For MVP: assume all current positions are long-term
    // TODO: Add transaction history analysis in Task 2B
    const longTermPositions = allBalances.map(token => ({
      symbol: token.symbol,
      balance: token.balance,
      firstAcquired: "2023-01-01", // Placeholder - will be real in Task 2B
      daysHeld: 400, // Placeholder - will be calculated in Task 2C
      tokenAddress: token.address,
    }));

    const results = {
      address,
      analysisDate: new Date().toISOString(),
      longTermPositions,
      summary: {
        totalLongTermPositions: longTermPositions.length,
        totalShortTermPositions: 0, // Will be calculated properly in later tasks
        eligibleForLongTermGains: longTermPositions.length > 0,
      },
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 