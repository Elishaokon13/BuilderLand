# x402 Farcaster Mini App - Project Documentation

## Background and Motivation

**NEW PROJECT REQUEST**: Build a **DeFi Long-Term Capital Gains Analyzer**

### Project Requirements:
- **Core Function**: Enter wallet address → analyze DeFi positions held for >1 year
- **Tax Optimization**: Help users identify positions eligible for long-term capital gains treatment
- **User Experience**: Avoid manual transaction checking for every position
- **Monetization**: x402 integration charging $1 per address scan
- **Business Model**: API/node costs covered by user payments

### URGENT TIMELINE CHANGE:
- **3 HOURS TO SHIP** (not 8 weeks!)
- Deploy on Farcaster Mini App (keep existing template)
- Minimal viable product with basic DeFi position checking
- Focus on simple token balance analysis only

## Codebase Overview

### Core Architecture
- **Framework**: Next.js (Canary 15) with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Web3**: OnchainKit, Wagmi, Viem for wallet connectivity
- **Payments**: x402 protocol with middleware protection
- **Notifications**: Upstash Redis for persistent storage

### Key Features
1. **Farcaster Mini App Integration**: 
   - Frame SDK initialization and detection
   - Account association and frame management
   - Background notifications via webhooks

2. **x402 Payment Protection**:
   - Middleware-protected API routes (`/api/protected`)
   - Client-side payment handling with `x402-fetch`
   - Configurable pricing ($0.01 for protected route)

3. **Wallet Integration**:
   - OnchainKit components for wallet connection
   - Identity display (name, address, avatar, balance)
   - Support for Base and Base Sepolia networks

4. **Notification System**:
   - Redis-backed user notification storage
   - Webhook handling for frame events
   - Client utilities for sending notifications

### File Structure Analysis

#### Core Application Files
- `app/page.tsx`: Main application interface with wallet connection and protected API interaction
- `app/layout.tsx`: Root layout with Frame metadata and mobile optimization
- `app/providers.tsx`: MiniKit provider setup with OnchainKit configuration

#### API Routes
- `app/api/protected/route.ts`: Payment-protected endpoint demonstrating x402 integration
- `app/api/notify/route.ts`: Notification sending endpoint
- `app/api/webhook/route.ts`: Farcaster webhook handler for frame events

#### Middleware & Libraries
- `middleware.ts`: x402 payment middleware configuration
- `lib/notification.ts`: User notification data management
- `lib/notification-client.ts`: Client utilities for sending notifications
- `lib/redis.ts`: Redis connection setup for Upstash

#### Configuration
- `package.json`: Dependencies including x402, OnchainKit, Farcaster SDK
- `tsconfig.json`: TypeScript configuration with Next.js optimization
- Environment variables for API keys, wallet addresses, and Redis config

## Current Status / Progress Tracking

### Project Status Board

- [x] Initial codebase analysis completed  
- [x] User specified Planner mode
- [x] **EMERGENCY TIMELINE**: Changed from 8 weeks to 3 HOURS!
- [x] **3-Hour MVP Plan Created**: Hyper-focused scope for immediate shipping
- [ ] **SWITCHING TO EXECUTOR MODE**: Ready to start building NOW
- [ ] **Hour 1**: Foundation (x402 $1 + wallet input + RPC setup)
- [ ] **Hour 2**: Basic token analysis engine
- [ ] **Hour 3**: Results display + deployment to Farcaster
- [ ] **Target**: Live Farcaster Mini App in 3 hours

## Key Challenges and Analysis

### Core Technical Challenges

1. **Multi-Chain DeFi Data Aggregation**:
   - Need to query multiple blockchain networks (Ethereum, Base, Arbitrum, Polygon, etc.)
   - Parse complex DeFi protocol interactions (liquidity positions, lending, staking)
   - Handle different token standards (ERC-20, ERC-721, ERC-1155)
   - Track position entry/exit events across protocols

2. **Real-Time vs Historical Data**:
   - Balance current positions vs. historical transaction analysis
   - Need accurate timestamps for 1-year calculation
   - Handle chain reorganizations and failed transactions
   - Cache expensive queries to manage API costs

3. **DeFi Protocol Complexity**:
   - Each protocol has unique contract structures
   - Position representation varies (LP tokens, receipt tokens, NFTs)
   - Need to understand wrapped/derivative assets
   - Handle protocol upgrades and migrations

4. **Tax Calculation Logic**:
   - Determine position entry date (first interaction vs. last increase)
   - Handle partial withdrawals and reinvestments
   - Account for rewards/fees affecting cost basis
   - Different rules for different position types

### Data Source Requirements

1. **Blockchain Data**:
   - RPC endpoints for multiple chains (Infura, Alchemy, QuickNode)
   - Historical transaction data and logs
   - Current state queries for active positions
   - Gas cost tracking for accurate calculations

2. **DeFi Protocol APIs**:
   - Uniswap V2/V3 subgraphs for LP positions
   - Aave/Compound for lending positions
   - Curve for stable pools
   - Yearn for vault positions
   - Protocol-specific position tracking

3. **Price Data**:
   - Historical token prices for cost basis calculation
   - Current prices for P&L analysis
   - DEX price feeds vs. centralized sources
   - Handle low-liquidity/exotic tokens

### Technical Architecture Decisions

1. **Backend Strategy**:
   - Node.js with TypeScript (consistent with current stack)
   - Redis for caching expensive queries
   - Queue system for long-running analysis jobs
   - Rate limiting to manage API costs

2. **Blockchain Integration**:
   - Viem for type-safe contract interactions
   - Wagmi for wallet connections (if needed)
   - Multiple RPC providers with fallback logic
   - Efficient batch querying strategies

3. **x402 Monetization**:
   - $1 per address scan (100x current $0.01 protected route)
   - Consider tiered pricing for multiple addresses
   - Free preview with limited data
   - Premium features for detailed analysis

### Business Model Analysis

1. **Revenue Potential**:
   - Target market: DeFi users with significant positions (high-value customers)
   - Pain point: Manual tax calculation is time-consuming and error-prone
   - Value proposition: Save hours of work + reduce tax mistakes
   - Market validation: Existing tools like Koinly charge $50-300/year

2. **Cost Structure**:
   - RPC API calls: ~$0.10-0.50 per comprehensive address analysis
   - Infrastructure: Redis, hosting, domain (~$50/month initially)
   - Break-even: ~2-10 scans per month to cover API costs
   - Scaling: Caching reduces marginal costs significantly

3. **Competitive Advantages**:
   - **Speed**: Focused on long-term positions only (not full tax reports)
   - **Price**: One-time $1 vs. annual subscriptions
   - **Simplicity**: Single address scan vs. complex onboarding
   - **x402 Integration**: Seamless crypto payments, no sign-up required

4. **Growth Strategy**:
   - Phase 1: Ethereum DeFi power users
   - Phase 2: Multi-chain expansion
   - Phase 3: Additional features (bulk pricing, watchlists)
   - Phase 4: API for other tax tools to integrate

## 🚀 EMERGENCY 3-HOUR MVP PLAN

### **Hour 1: Foundation Setup (60 minutes)**
- [ ] **Task 1A**: Update x402 middleware to charge $1 for `/api/analyze` endpoint  
  - Success criteria: Payment works with $1 charge
  - Time: 15 minutes

- [ ] **Task 1B**: Add wallet address input form to main page
  - Success criteria: Simple input with ENS resolution and validation
  - Time: 20 minutes

- [ ] **Task 1C**: Set up Ethereum RPC connection (use free Infura/Alchemy)
  - Success criteria: Can query basic wallet data
  - Time: 15 minutes

- [ ] **Task 1D**: Create `/api/analyze` endpoint skeleton
  - Success criteria: Accepts wallet address, returns basic structure
  - Time: 10 minutes

### **Hour 2: Core Analysis Engine (60 minutes)**
- [ ] **Task 2A**: Implement basic ERC-20 token balance checking
  - Success criteria: Get current token balances for wallet
  - Time: 25 minutes

- [ ] **Task 2B**: Add simple transaction history for major tokens
  - Success criteria: Find first transfer date for each token
  - Time: 25 minutes

- [ ] **Task 2C**: Calculate 1-year position logic
  - Success criteria: Identify which tokens were acquired >365 days ago
  - Time: 10 minutes

### **Hour 3: Results & Deployment (60 minutes)**
- [ ] **Task 3A**: Build results display component
  - Success criteria: Show long-term vs short-term positions clearly
  - Time: 25 minutes

- [ ] **Task 3B**: Add loading states and error handling
  - Success criteria: Good UX during analysis
  - Time: 15 minutes

- [ ] **Task 3C**: Test end-to-end flow
  - Success criteria: Payment → analysis → results works
  - Time: 10 minutes

- [ ] **Task 3D**: Deploy and share on Farcaster
  - Success criteria: Live app accessible via Frame
  - Time: 10 minutes

### **MVP Feature Scope (Realistic for 3 hours)**
✅ **What we WILL build:**
- Simple wallet address input
- x402 $1 payment gate
- Basic ERC-20 token balance checking
- Identify tokens held >1 year (simple heuristic)
- Clean results display

❌ **What we WON'T build (future iterations):**
- Complex DeFi protocol analysis
- Multi-chain support
- Advanced tax calculations
- LP position tracking
- Detailed reports

## Executor's Feedback or Assistance Requests

### Emergency 3-Hour MVP Decisions  
1. **Keep Farcaster**: Don't remove Frame SDK - ship as Farcaster Mini App
2. **Minimal Scope**: Basic ERC-20 token analysis only (no complex DeFi protocols)
3. **Simple Heuristic**: First token transfer date = position start date
4. **Free RPC**: Use Infura/Alchemy free tier to minimize setup time

### Ready to Execute - Starting Hour 1 NOW
✅ **All planning complete** - hyper-focused 3-hour plan ready
✅ **Existing codebase** - Farcaster template provides perfect foundation  
✅ **x402 infrastructure** - Just need to change price from $0.01 to $1.00
✅ **Tech stack decided** - Keep existing setup, add basic RPC calls

### Immediate Next Actions (Executor Mode)
1. **Task 1A**: Update middleware.ts to charge $1 for new /api/analyze endpoint
2. **Task 1B**: Modify app/page.tsx to add wallet address input form  
3. **Task 1C**: Add RPC configuration for Ethereum mainnet
4. **Task 1D**: Create /api/analyze endpoint structure

**Ready to start building - switching to Executor mode now!**

## Lessons

*To be populated as issues are encountered and resolved* 