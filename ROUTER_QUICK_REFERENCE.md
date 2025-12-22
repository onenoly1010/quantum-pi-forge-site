# 0G Aristotle DEX Router - Quick Reference

## 🔴 CRITICAL STATUS: ROUTER ADDRESS PENDING

This document provides a quick reference for resolving the DEX router address blocker.

---

## Current Status

- **Launch Blocker**: YES - CRITICAL
- **Timeline**: 48 hours from issue creation (2025-12-14)
- **Router Address**: PENDING
- **Configuration File**: `.env.launch`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`

---

## 0G Aristotle Mainnet Quick Facts

| Parameter | Value |
|-----------|-------|
| Network Name | 0G Aristotle Mainnet |
| Chain ID | 16661 |
| Chain ID (Hex) | 0x4115 |
| RPC URL | https://evmrpc.0g.ai |
| Block Explorer | https://chainscan.0g.ai |
| Currency | 0G |
| Decimals | 18 |

---

## Two-Path Resolution

### Path 1: Find Canonical Router ⭐ PREFERRED

**Steps:**
1. Join 0G Discord → https://discord.gg/0gnetwork
2. Ask in #dev or #support: "What is the canonical DEX router address for Aristotle Mainnet?"
3. Verify on block explorer → https://chainscan.0g.ai
4. Update `.env.launch`:
   ```bash
   ZERO_G_UNIVERSAL_ROUTER=0x[CANONICAL_ADDRESS]
   ROUTER_ADDRESS_VERIFIED=true
   ```

**Time Estimate:** 1-4 hours (depends on community response)

### Path 2: Deploy Uniswap V2 Fork 🛠️ FALLBACK

**Steps:**
1. Review `DEPLOYMENT_GUIDE.md`
2. Setup Foundry environment
3. Deploy contracts:
   - Factory
   - WETH (Wrapped 0G)
   - Router02
4. Verify on block explorer
5. Test swap functionality
6. Update `.env.launch`:
   ```bash
   ZERO_G_UNIVERSAL_ROUTER=0x[DEPLOYED_ROUTER]
   ROUTER_DEPLOYED_BY=onenoly1010
   ROUTER_TYPE=uniswap_v2
   ROUTER_ADDRESS_VERIFIED=true
   TEST_SWAP_COMPLETED=true
   ```

**Time Estimate:** 24-36 hours (includes testing)

---

## Verification Checklist

Before marking as resolved:

- [ ] Router address obtained/deployed
- [ ] Contract verified on https://chainscan.0g.ai
- [ ] `.env.launch` updated with correct address
- [ ] Test swap executed successfully
- [ ] Liquidity can be added/removed
- [ ] All safety flags set to `true`
- [ ] Documentation updated
- [ ] Flash launch system ready

---

## Key Files Modified

1. **`.env.launch`** (NEW)
   - Complete launch configuration
   - Network parameters
   - Router address placeholder
   - Safety checks

2. **`DEPLOYMENT_GUIDE.md`** (NEW)
   - Comprehensive deployment instructions
   - Step-by-step Uniswap V2 deployment
   - Testing procedures
   - Troubleshooting

3. **`api/ecosystem-gateway.js`** (UPDATED)
   - Enhanced 0G network configuration
   - Router configuration object
   - Corrected chain ID (16661)

4. **`README.md`** (UPDATED)
   - New "0G DEX Router Configuration" section
   - Network details
   - Quick start instructions

5. **`ROUTER_QUICK_REFERENCE.md`** (NEW - this file)
   - Quick reference guide
   - Status tracking
   - Decision matrix

---

## Decision Matrix

```
╔═══════════════════════════════════════╗
║     Router Address Resolution         ║
╠═══════════════════════════════════════╣
║                                       ║
║  Found Canonical DEX?                 ║
║                                       ║
║  ├─ YES                               ║
║  │   ├─ Verified Contract?            ║
║  │   │   ├─ YES → Use Address ✅      ║
║  │   │   └─ NO  → Deploy Own ⚠️       ║
║  │   │                                ║
║  └─ NO                                ║
║      └─ Deploy Uniswap V2 Fork        ║
║          ├─ Test on Testnet           ║
║          └─ Deploy to Mainnet         ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## Command Quick Reference

### Add 0G Network to MetaMask
```javascript
await ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x4115',
    chainName: '0G Aristotle Mainnet',
    rpcUrls: ['https://evmrpc.0g.ai'],
    nativeCurrency: {
      name: '0G',
      symbol: '0G',
      decimals: 18
    },
    blockExplorerUrls: ['https://chainscan.0g.ai']
  }]
});
```

### Check Contract on Explorer
```bash
# Visit block explorer
open https://chainscan.0g.ai

# Search for potential router addresses
# Keywords: "router", "swap", "dex", "uniswap"
```

### Deploy with Foundry (if needed)
```bash
# Setup
forge init dex-deployment
cd dex-deployment

# Deploy Factory
forge create src/UniswapV2Factory.sol:UniswapV2Factory \
  --rpc-url https://evmrpc.0g.ai \
  --private-key $PRIVATE_KEY \
  --constructor-args $FEE_TO_SETTER

# Deploy Router (after Factory + WETH)
forge create src/UniswapV2Router02.sol:UniswapV2Router02 \
  --rpc-url https://evmrpc.0g.ai \
  --private-key $PRIVATE_KEY \
  --constructor-args $FACTORY_ADDRESS $WETH_ADDRESS
```

---

## Contact Points

### 0G Network
- **Discord**: https://discord.gg/0gnetwork
- **Documentation**: https://docs.0g.ai
- **Block Explorer**: https://chainscan.0g.ai
- **GitHub**: https://github.com/0glabs

### Project Team
- **GitHub**: https://github.com/onenoly1010/quantum-pi-forge-site
- **Main Site**: https://onenoly1010.github.io/quantum-pi-forge-site/
- **DEX Frontend**: https://quantum-pi-forge-fixed.vercel.app

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Router Address Found/Deployed | ✅ | ⏳ Pending |
| Contract Verified on Explorer | ✅ | ⏳ Pending |
| Test Swap Executed | ✅ | ⏳ Pending |
| Configuration Updated | ✅ | ⏳ Pending |
| Launch System Ready | ✅ | ⏳ Pending |

---

## Timeline Tracker

| Hour Range | Task | Status |
|------------|------|--------|
| 0-4 | Research: Discord, Explorer, Docs | ⏳ |
| 4-12 | Decision: Canonical vs Deploy | ⏳ |
| 12-24 | Implementation: Config or Deploy | ⏳ |
| 24-36 | Testing: Swaps and Liquidity | ⏳ |
| 36-48 | Verification: Final Checks | ⏳ |
| **48** | **✅ RESOLVED** | ⏳ |

---

## Next Actions

### Immediate (Next 4 Hours)
1. ✅ Configuration files created (DONE)
2. ✅ Documentation written (DONE)
3. ⏳ Join 0G Discord
4. ⏳ Post router address question in #dev
5. ⏳ Check block explorer for existing DEX deployments

### Short-term (4-12 Hours)
6. ⏳ Evaluate responses from 0G community
7. ⏳ Decide: Canonical router vs. Deploy own
8. ⏳ If deploying: Setup Foundry environment
9. ⏳ If deploying: Clone Uniswap V2 repos

### Medium-term (12-48 Hours)
10. ⏳ Deploy/Configure router
11. ⏳ Verify on block explorer
12. ⏳ Execute test swaps
13. ⏳ Update all configuration flags
14. ⏳ Mark issue as resolved

---

## Notes

- This is THE critical path blocker for mainnet launch
- All other systems are 99% complete
- Router address is the only missing piece
- 48-hour deadline is firm
- Configuration is production-ready pending router address

---

**Document Created**: 2025-12-22  
**Last Updated**: 2025-12-22  
**Status**: ACTIVE - AWAITING ROUTER RESOLUTION  
**Priority**: 🔴 CRITICAL
