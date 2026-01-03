# Router Resolution Checklist

Use this checklist to track progress on resolving the 0G Aristotle DEX router address.

## Phase 1: Research (Hours 0-12)

### Discord & Community Research
- [ ] Join 0G Discord: https://discord.gg/0gnetwork
- [ ] Post in #dev channel: "What is the canonical DEX router address for Aristotle Mainnet?"
- [ ] Post in #support channel (if no dev response)
- [ ] Ping @0g-team or @moderators
- [ ] Document any responses received
- [ ] Verify any addresses provided on block explorer

### Block Explorer Research
- [ ] Visit https://chainscan.0g.ai
- [ ] Search for "router" contracts
- [ ] Search for "swap" contracts
- [ ] Search for "dex" contracts
- [ ] Search for "uniswap" contracts
- [ ] Check recent contract deployments
- [ ] Look for verified contracts
- [ ] Note any potential router addresses

### Documentation Research
- [ ] Review 0G Docs: https://docs.0g.ai
- [ ] Check for DeFi/DEX section
- [ ] Look for ecosystem projects list
- [ ] Check GitHub: https://github.com/0glabs
- [ ] Search for DEX-related repositories
- [ ] Look for contract deployment info

## Phase 2: Decision (Hours 12-24)

### If Canonical Router Found
- [ ] Verify contract on https://chainscan.0g.ai
- [ ] Check contract is verified (source code available)
- [ ] Verify it implements IUniswapV2Router02 interface
- [ ] Check deployment date and transaction history
- [ ] Confirm no security issues or red flags
- [ ] Document router address: `0x_______________`
- [ ] Update `.env.launch` with address
- [ ] Set `ROUTER_ADDRESS_VERIFIED=true`
- [ ] Skip to Phase 4 (Testing)

### If No Canonical Router Found
- [ ] Decision made to deploy own Uniswap V2 fork
- [ ] Review `DEPLOYMENT_GUIDE.md` thoroughly
- [ ] Prepare deployment environment
- [ ] Proceed to Phase 3 (Deployment)

## Phase 3: Deployment (Hours 24-36) - Only if deploying own

### Environment Setup
- [ ] Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- [ ] Clone Uniswap V2 Core: `git clone https://github.com/Uniswap/v2-core.git`
- [ ] Clone Uniswap V2 Periphery: `git clone https://github.com/Uniswap/v2-periphery.git`
- [ ] Add 0G Aristotle network to MetaMask
- [ ] Ensure sufficient 0G tokens for gas
- [ ] Create deployment wallet/keys
- [ ] Setup `.env` with deployment config

### Factory Deployment
- [ ] Deploy UniswapV2Factory contract
- [ ] Record factory address: `0x_______________`
- [ ] Verify factory on block explorer
- [ ] Test factory creation (optional)

### WETH Deployment
- [ ] Deploy WETH9 (Wrapped 0G) contract
- [ ] Record WETH address: `0x_______________`
- [ ] Verify WETH on block explorer
- [ ] Test wrap/unwrap functionality (optional)

### Router Deployment
- [ ] Deploy UniswapV2Router02 with factory + WETH addresses
- [ ] Record router address: `0x_______________`
- [ ] Verify router on block explorer
- [ ] Check all contract functions are visible

### Configuration Update
- [ ] Update `.env.launch` with router address
- [ ] Set `ROUTER_DEPLOYED_BY=onenoly1010`
- [ ] Set `ROUTER_TYPE=uniswap_v2`
- [ ] Set `ROUTER_DEPLOYMENT_DATE=YYYY-MM-DD`
- [ ] Set `ROUTER_ADDRESS_VERIFIED=true`

## Phase 4: Testing (Hours 36-44)

### Basic Contract Testing
- [ ] Call `router.factory()` - verify returns correct factory address
- [ ] Call `router.WETH()` - verify returns correct WETH address
- [ ] Check router has expected functions (swapExact*, addLiquidity*, etc.)

### Test Token Deployment (for testing)
- [ ] Deploy test ERC20 token A
- [ ] Deploy test ERC20 token B
- [ ] Approve router to spend tokens
- [ ] Mint test tokens to your address

### Liquidity Testing
- [ ] Add liquidity for Token A / Token B pair
- [ ] Verify pair is created
- [ ] Check LP tokens are received
- [ ] Verify reserves are correct
- [ ] Test removing liquidity

### Swap Testing
- [ ] Execute test swap: Token A → Token B
- [ ] Verify swap executed correctly
- [ ] Check balances after swap
- [ ] Execute reverse swap: Token B → Token A
- [ ] Test swap with native 0G (if applicable)

### Configuration Update
- [ ] Set `TEST_SWAP_COMPLETED=true` in `.env.launch`
- [ ] Set `LIQUIDITY_DEPLOYMENT_READY=true`
- [ ] Document test results

## Phase 5: Final Verification (Hours 44-48)

### Documentation
- [ ] All router addresses documented
- [ ] All deployment details recorded
- [ ] Test results documented
- [ ] Any issues/notes documented

### Configuration Review
- [ ] Review `.env.launch` - all values correct
- [ ] Verify `ROUTER_ADDRESS_VERIFIED=true`
- [ ] Verify `TEST_SWAP_COMPLETED=true`
- [ ] Verify `LIQUIDITY_DEPLOYMENT_READY=true`
- [ ] Update `FLASH_LAUNCH_ENABLED=true` (if ready)

### Integration Testing
- [ ] Test DEX frontend integration (if applicable)
- [ ] Verify wallet connection works
- [ ] Verify swap interface works
- [ ] Verify liquidity interface works
- [ ] Test with multiple wallets/accounts

### Security Review
- [ ] All contracts verified on block explorer
- [ ] Router address is correct and immutable
- [ ] No known security issues
- [ ] All admin functions reviewed
- [ ] Ownership/permissions configured correctly

### Ecosystem Integration
- [ ] Update `api/ecosystem-gateway.js` with router address
- [ ] Update README.md with final router info
- [ ] Update any frontend configuration
- [ ] Test ecosystem health checks

### Final Checks
- [ ] All checklist items completed
- [ ] No blocking issues remain
- [ ] System is ready for mainnet launch
- [ ] All stakeholders notified
- [ ] Documentation is complete

## Issue Resolution

### GitHub Issue Update
- [ ] Update issue with final router address
- [ ] Document decision path taken (canonical vs deployed)
- [ ] List all deployed contract addresses
- [ ] Mark issue as resolved
- [ ] Close issue

### Success Criteria Met
- [ ] DEX router address identified/deployed
- [ ] Address verified on 0G block explorer
- [ ] `.env.launch` updated with correct values
- [ ] Test swap executed successfully
- [ ] Liquidity can be added and removed
- [ ] System ready for flash launch
- [ ] All documentation complete

---

## Notes & Issues

Use this space to document any issues, blockers, or important notes during the resolution process:

```
Date: _______
Issue: _______________________________________
Resolution: __________________________________

Date: _______
Issue: _______________________________________
Resolution: __________________________________

Date: _______
Issue: _______________________________________
Resolution: __________________________________
```

---

## Final Router Address

**ROUTER ADDRESS:** `0x_____________________________________________`

**Type:** [ ] Canonical DEX  [ ] Deployed Uniswap V2 Fork

**Verification:** [ ] Verified on Block Explorer

**Status:** [ ] READY FOR MAINNET LAUNCH

---

**Checklist Last Updated:** 2025-12-22  
**Resolution Status:** ⏳ IN PROGRESS
