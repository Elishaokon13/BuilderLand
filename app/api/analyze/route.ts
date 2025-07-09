import { NextResponse } from "next/server";
import { getTokenPositions } from "../../../lib/defi-analyzer";

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

    // Get token positions with historical data
    const positions = await getTokenPositions(address as `0x${string}`);

    // Separate long-term and short-term positions
    const longTermPositions = positions.filter(pos => pos.isLongTerm).map(pos => ({
      symbol: pos.symbol,
      balance: pos.balance,
      firstAcquired: pos.firstAcquired,
      daysHeld: pos.daysHeld,
      tokenAddress: pos.address,
    }));

    const shortTermPositions = positions.filter(pos => !pos.isLongTerm);

    const results = {
      address,
      analysisDate: new Date().toISOString(),
      longTermPositions,
      summary: {
        totalLongTermPositions: longTermPositions.length,
        totalShortTermPositions: shortTermPositions.length,
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