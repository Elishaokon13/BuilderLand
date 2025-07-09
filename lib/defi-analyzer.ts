import { createPublicClient, http, parseAbi, getAddress } from 'viem';
import { mainnet } from 'viem/chains';

// ERC-20 ABI for balanceOf and Transfer events
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

// Popular DeFi tokens to analyze
const POPULAR_TOKENS = [
  { address: '0xA0b86a33E6441D41E0a1a6C7f3AeB6F21d34C8D3' as `0x${string}`, symbol: 'USDC' }, // USDC
  { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`, symbol: 'WETH' }, // WETH
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`, symbol: 'WBTC' }, // WBTC
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as `0x${string}`, symbol: 'DAI' },  // DAI
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, symbol: 'USDT' }, // USDT
];

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export interface TokenPosition {
  address: `0x${string}`;
  symbol: string;
  balance: string;
  firstAcquired: string;
  daysHeld: number;
  isLongTerm: boolean;
}

export async function getTokenPositions(walletAddress: `0x${string}`): Promise<TokenPosition[]> {
  const positions: TokenPosition[] = [];
  
  try {
    for (const token of POPULAR_TOKENS) {
      try {
        // Get current balance
        const balance = await client.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [getAddress(walletAddress)],
        });

        // Skip if no balance
        if (balance === BigInt(0)) continue;

        // Get decimals for formatting
        const decimals = await client.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'decimals',
        });

        // Get first Transfer event to this address (simplified approach)
        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock > BigInt(100000) ? currentBlock - BigInt(100000) : BigInt(0);
        
        const transfers = await client.getLogs({
          address: token.address,
          event: ERC20_ABI.find(item => item.type === 'event' && item.name === 'Transfer')!,
          args: {
            to: getAddress(walletAddress),
          },
          fromBlock,
          toBlock: 'latest',
        });

        let firstAcquiredDate = new Date();
        let firstBlock = await client.getBlockNumber();

        if (transfers.length > 0) {
          // Get the earliest transfer
          const earliestTransfer = transfers[0];
          firstBlock = earliestTransfer.blockNumber;
          
          const block = await client.getBlock({ blockNumber: firstBlock });
          firstAcquiredDate = new Date(Number(block.timestamp) * 1000);
        }

        const daysHeld = Math.floor((Date.now() - firstAcquiredDate.getTime()) / (1000 * 60 * 60 * 24));
        const isLongTerm = daysHeld >= 365;
        
        positions.push({
          address: token.address,
          symbol: token.symbol,
          balance: (Number(balance) / Math.pow(10, decimals)).toFixed(6),
          firstAcquired: firstAcquiredDate.toLocaleDateString(),
          daysHeld,
          isLongTerm,
        });
        
      } catch (tokenError) {
        console.error(`Error analyzing ${token.symbol}:`, tokenError);
        continue;
      }
    }
  } catch (error) {
    console.error('Error in getTokenPositions:', error);
    throw new Error('Failed to analyze token positions');
  }

  return positions;
} 