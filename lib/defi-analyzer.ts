import { createPublicClient, http, getContract, formatUnits } from "viem";
import { mainnet } from "viem/chains";

// Popular ERC-20 tokens to analyze
const POPULAR_TOKENS = [
  {
    symbol: "USDC",
    address: "0xA0b86a33E6441d95c4a8F56C9a66f6c32Fe8a1c8" as `0x${string}`,
    decimals: 6,
  },
  {
    symbol: "USDT", 
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
    decimals: 6,
  },
  {
    symbol: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
    decimals: 18,
  },
  {
    symbol: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as `0x${string}`,
    decimals: 8,
  },
  {
    symbol: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as `0x${string}`,
    decimals: 18,
  },
];

// Standard ERC-20 ABI (balanceOf function)
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "symbol",
    type: "function", 
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view", 
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Create public client for Ethereum mainnet
const client = createPublicClient({
  chain: mainnet,
  transport: http(), // Will use default RPC
});

export interface TokenBalance {
  symbol: string;
  address: string;
  balance: string;
  decimals: number;
  rawBalance: bigint;
}

/**
 * Get ERC-20 token balances for a wallet address
 */
export async function getTokenBalances(walletAddress: `0x${string}`): Promise<TokenBalance[]> {
  try {
    const balances: TokenBalance[] = [];

    for (const token of POPULAR_TOKENS) {
      try {
        const contract = getContract({
          address: token.address,
          abi: ERC20_ABI,
          client,
        });

        const rawBalance = await contract.read.balanceOf([walletAddress]);
        
        if (rawBalance > 0n) {
          const balance = formatUnits(rawBalance, token.decimals);
          
          balances.push({
            symbol: token.symbol,
            address: token.address,
            balance,
            decimals: token.decimals,
            rawBalance,
          });
        }
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);
        // Continue with other tokens
      }
    }

    return balances;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw new Error("Failed to fetch token balances");
  }
}

/**
 * Get ETH balance for a wallet
 */
export async function getETHBalance(walletAddress: `0x${string}`): Promise<TokenBalance> {
  try {
    const rawBalance = await client.getBalance({ address: walletAddress });
    const balance = formatUnits(rawBalance, 18);

    return {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      balance,
      decimals: 18,
      rawBalance,
    };
  } catch (error) {
    console.error("Error fetching ETH balance:", error);
    throw new Error("Failed to fetch ETH balance");
  }
} 