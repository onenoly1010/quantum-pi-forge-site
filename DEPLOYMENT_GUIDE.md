# 0G Aristotle Mainnet DEX Router Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying a Uniswap V2 fork DEX router on 0G Aristotle Mainnet if no canonical DEX router is available.

## Prerequisites

### Required Tools
- Node.js (v18 or higher)
- npm or yarn
- Foundry (for Solidity deployment)
- MetaMask or compatible Web3 wallet

### Network Configuration
- **Network Name:** 0G Aristotle Mainnet
- **Chain ID:** 16661 (0x4115 hex)
- **RPC URL:** https://evmrpc.0g.ai
- **Block Explorer:** https://chainscan.0g.ai
- **Currency Symbol:** 0G

### Add 0G Network to MetaMask
```javascript
// Network Parameters
{
  chainId: '0x4115',
  chainName: '0G Aristotle Mainnet',
  rpcUrls: ['https://evmrpc.0g.ai'],
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18
  },
  blockExplorerUrls: ['https://chainscan.0g.ai']
}
```

## Option A: Find Canonical DEX (Recommended)

### Steps to Locate Official Router

1. **Check 0G Block Explorer**
   ```bash
   # Visit https://chainscan.0g.ai
   # Search for: "router", "swap", "dex", "uniswap"
   # Filter by: Verified contracts
   ```

2. **Join 0G Community Channels**
   - Discord: https://discord.gg/0gnetwork
   - Ask in #dev or #support: "What is the canonical DEX router address for Aristotle Mainnet?"
   - Ping: @0g-team, @moderators

3. **Check 0G Documentation**
   - Official Docs: https://docs.0g.ai
   - GitHub: https://github.com/0glabs
   - Look for ecosystem projects and DeFi integrations

4. **Verify Contract on Explorer**
   ```bash
   # Once address is found:
   # 1. Check contract is verified on https://chainscan.0g.ai
   # 2. Verify it implements IUniswapV2Router02 interface
   # 3. Check deployment date and transaction history
   # 4. Confirm no security issues
   ```

5. **Update Configuration**
   ```bash
   # Edit .env.launch
   ZERO_G_UNIVERSAL_ROUTER=0x[VERIFIED_ADDRESS]
   ROUTER_ADDRESS_VERIFIED=true
   ```

## Option B: Deploy Uniswap V2 Fork

If no canonical DEX exists on Aristotle Mainnet, deploy your own Uniswap V2 fork.

### Step 1: Setup Development Environment

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone Uniswap V2 repositories
git clone https://github.com/Uniswap/v2-core.git
git clone https://github.com/Uniswap/v2-periphery.git

# Or use pre-audited fork
# git clone https://github.com/pancakeswap/pancake-swap-core.git
```

### Step 2: Configure for 0G Network

```bash
# In your project directory
cd v2-core

# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
RPC_URL=https://evmrpc.0g.ai
CHAIN_ID=16661
ETHERSCAN_API_KEY=your_api_key_if_available
EOF
```

### Step 3: Deploy Factory Contract

```bash
# Deploy Uniswap V2 Factory
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

# Save the factory address
FACTORY_ADDRESS=0x... # From deployment output
```

**Sample Factory Deployment Script:**
```solidity
// script/DeployFactory.s.sol
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/UniswapV2Factory.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();
        
        // Your address will be the fee setter
        address feeToSetter = msg.sender;
        
        UniswapV2Factory factory = new UniswapV2Factory(feeToSetter);
        
        console.log("Factory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
```

### Step 4: Deploy WETH Contract

```bash
# Deploy Wrapped 0G token
cd ../v2-periphery

# Deploy WETH9 (or equivalent wrapped native token)
forge script script/DeployWETH.s.sol:DeployWETH \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Save WETH address
WETH_ADDRESS=0x... # From deployment output
```

### Step 5: Deploy Router02 Contract

```bash
# Deploy Uniswap V2 Router
forge script script/DeployRouter.s.sol:DeployRouter \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

# Arguments needed:
# - Factory address
# - WETH address
```

**Sample Router Deployment Script:**
```solidity
// script/DeployRouter.s.sol
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/UniswapV2Router02.sol";

contract DeployRouter is Script {
    function run() external {
        address factory = vm.envAddress("FACTORY_ADDRESS");
        address weth = vm.envAddress("WETH_ADDRESS");
        
        vm.startBroadcast();
        
        UniswapV2Router02 router = new UniswapV2Router02(factory, weth);
        
        console.log("Router deployed at:", address(router));
        
        vm.stopBroadcast();
    }
}
```

### Step 6: Verify Contracts

```bash
# Verify Factory
forge verify-contract $FACTORY_ADDRESS \
  src/UniswapV2Factory.sol:UniswapV2Factory \
  --chain-id 16661 \
  --constructor-args $(cast abi-encode "constructor(address)" $FEE_TO_SETTER)

# Verify Router
forge verify-contract $ROUTER_ADDRESS \
  src/UniswapV2Router02.sol:UniswapV2Router02 \
  --chain-id 16661 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $FACTORY_ADDRESS $WETH_ADDRESS)
```

### Step 7: Test Deployment

```bash
# Test basic router functions
cast call $ROUTER_ADDRESS "factory()" --rpc-url $RPC_URL
cast call $ROUTER_ADDRESS "WETH()" --rpc-url $RPC_URL

# Create a test pair
# 1. Deploy test tokens
# 2. Add liquidity via router
# 3. Execute test swap
```

**Test Swap Script:**
```javascript
// test-swap.js
const { ethers } = require('ethers');

async function testSwap() {
  const provider = new ethers.providers.JsonRpcProvider('https://evmrpc.0g.ai');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const routerAddress = '0x...'; // Your deployed router
  const routerABI = [...]; // Uniswap V2 Router ABI
  
  const router = new ethers.Contract(routerAddress, routerABI, wallet);
  
  // Test swap
  const amountIn = ethers.utils.parseEther('0.1');
  const path = [WETH_ADDRESS, TOKEN_ADDRESS];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
  
  const tx = await router.swapExactETHForTokens(
    0, // amountOutMin
    path,
    wallet.address,
    deadline,
    { value: amountIn }
  );
  
  await tx.wait();
  console.log('Swap successful:', tx.hash);
}

testSwap().catch(console.error);
```

### Step 8: Update Configuration

```bash
# Edit .env.launch
ZERO_G_UNIVERSAL_ROUTER=0x[YOUR_ROUTER_ADDRESS]
ROUTER_DEPLOYED_BY=onenoly1010
ROUTER_TYPE=uniswap_v2
ROUTER_VERSION=2.0.0
ROUTER_DEPLOYMENT_DATE=2025-12-22
ROUTER_ADDRESS_VERIFIED=true
TEST_SWAP_COMPLETED=true
```

## Gas Optimization Tips

### 0G Network Characteristics
- **Low Gas Costs:** 0G is designed for efficient computation
- **Fast Finality:** CometBFT consensus for quick confirmations
- **EVM Compatible:** Standard Ethereum tooling works

### Deployment Cost Estimates
```
Factory:    ~2.5M gas
WETH:       ~1M gas
Router02:   ~3.5M gas
Total:      ~7M gas
```

## Security Considerations

### Pre-Deployment Checklist
- [ ] Use audited contract code (Uniswap V2 is battle-tested)
- [ ] Verify all contract addresses before deployment
- [ ] Test on 0G testnet first (if available)
- [ ] Keep private keys secure (use hardware wallet)
- [ ] Enable contract verification on block explorer

### Post-Deployment Checklist
- [ ] Verify contracts on https://chainscan.0g.ai
- [ ] Test all router functions
- [ ] Execute test swaps with small amounts
- [ ] Monitor for any issues
- [ ] Document all addresses

## Alternative: Uniswap V3 Deployment

For more advanced features (concentrated liquidity):

```bash
# Clone Uniswap V3
git clone https://github.com/Uniswap/v3-core.git
git clone https://github.com/Uniswap/v3-periphery.git

# V3 is more complex:
# - Factory, Router, NFT Position Manager
# - More gas for deployment
# - Better capital efficiency
# - More complex integration
```

**V3 Considerations:**
- Higher deployment complexity
- Requires more testing
- Better for professional DEX operations
- More gas for users (but better execution)

## Troubleshooting

### Common Issues

**Issue 1: Insufficient Gas**
```bash
# Increase gas limit
--gas-limit 10000000
```

**Issue 2: Nonce Issues**
```bash
# Reset nonce
cast nonce $YOUR_ADDRESS --rpc-url $RPC_URL
```

**Issue 3: Verification Failing**
```bash
# Manual verification on block explorer
# Upload flattened contract source
forge flatten src/UniswapV2Router02.sol > Router02.flat.sol
```

**Issue 4: RPC Connection**
```bash
# Try alternative RPC endpoints
# - https://evmrpc.0g.ai (primary)
# - Check 0G docs for additional endpoints
```

## Success Criteria

Before marking as complete:

- [ ] Router address verified on block explorer
- [ ] Contract source code verified
- [ ] Test swap executed successfully
- [ ] Liquidity can be added and removed
- [ ] .env.launch updated with correct address
- [ ] All safety checks passed
- [ ] Documentation updated

## Resources

### Official Links
- **0G Docs:** https://docs.0g.ai
- **0G Discord:** https://discord.gg/0gnetwork
- **Block Explorer:** https://chainscan.0g.ai
- **0G GitHub:** https://github.com/0glabs

### Uniswap Resources
- **V2 Core:** https://github.com/Uniswap/v2-core
- **V2 Periphery:** https://github.com/Uniswap/v2-periphery
- **V2 Docs:** https://docs.uniswap.org/contracts/v2/overview
- **V3 Core:** https://github.com/Uniswap/v3-core
- **V3 Periphery:** https://github.com/Uniswap/v3-periphery

### Development Tools
- **Foundry:** https://book.getfoundry.sh
- **Hardhat:** https://hardhat.org
- **Ethers.js:** https://docs.ethers.io

## Support

For issues or questions:
1. Check 0G Discord: https://discord.gg/0gnetwork
2. Review 0G Docs: https://docs.0g.ai
3. Open GitHub issue in quantum-pi-forge-site repo

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-22  
**Author:** OINIO Genesis Team
