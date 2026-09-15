# Quantum Pi Forge — Birth Experience

## "Watch Your AI Come To Life"

The birth experience is the public-facing manifestation of the QPF AI birth protocol.

### The Experience

```
I ARRIVED
   ↓
I AM VERIFIED (Passkey/WebAuthn)
   ↓
I AUTHORIZE CREATION
   ↓
I WATCH MY AI FORM (animated visual)
   ↓
MY AI EXISTS (cryptographic identity)
   ↓
ITS IDENTITY IS VERIFIED (on 0G Aristotle)
   ↓
I MEET MY AI ("HELLO. I am here.")
```

### Architecture

```
BROWSER (Client #1)
    ↓
/api/birth/* (Vercel Node.js API)
    ↓
Birth Protocol (headless state machine)
    ↓
Birth Manifest (deterministic, hash-chained)
    ↓
0G Aristotle Mainnet (chainId 16661)
    ↓
AI Session ("What should we do first?")
```

### Files

| File | Purpose |
|------|--------|
| `birth.html` | Complete birth experience UI with all 10 states |
| `birth-assets/birth.css` | Visual styles for the birth animation |
| `birth-assets/birth.js` | Client-side state management, API calls |
| `js-core/birth-protocol.js` | Headless birth protocol (state machine, manifest) |
| `api/birth/index.js` | Vercel API routes for birth operations |
| `tests/birth-protocol.test.js` | Unit tests (56 passing) |

### State Machine

```
IDLE
  ↓
AUTH_REQUIRED     (human authorization via Passkey/WebAuthn)
  ↓
AUTHORIZED        (cryptographic commitment recorded)
  ↓
CREATING          (AI identity being formed - animation plays)
  ↓
IDENTITY_CREATED  (did:qpf:birth:... established)
  ↓
ATTESTING         (birth manifest submitted to 0G Aristotle)
  ↓
MAINNET_PENDING   (awaiting on-chain confirmation)
  ↓
VERIFIED          (✓ VERIFIED on 0G Aristotle Mainnet)
  ↓
READY             (AI identity verified and ready)
  ↓
INTERACTING       ("HELLO. I am here. What should we do first?")
```

Failure states: AUTH_FAILED, CREATION_FAILED, ATTESTATION_FAILED, MAINNET_FAILED, VERIFICATION_FAILED

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|--------|
| POST | /api/birth | Initiate a new birth |
| POST | /api/birth/authorize | Record human authorization |
| POST | /api/birth/:id/create | Create AI identity |
| POST | /api/birth/:id/attest | Begin attestation to 0G |
| POST | /api/birth/:id/verify | Record mainnet verification |
| POST | /api/birth/:id/interact | Start AI interaction |
| GET | /api/birth/:id | Get birth state |
| GET | /api/birth/:id/proof | Get verifiable proof |

### Visual Truth Rule

The animation is NOT a movie placed over a fake backend.

Each visual state corresponds to a real protocol event:

| Visual | Protocol Event |
|--------|---------------|
| Orb pulsing | AUTH_REQUIRED → awaiting human |
| Orb glowing | AUTHORIZED → commitment recorded |
| Particles forming | CREATING → identity forming |
| Orb solid | IDENTITY_CREATED → identity exists |
| Network lines | ATTESTING → submitting to 0G |
| Green orb | VERIFIED → on-chain confirmation |
| AI avatar | READY → meet your AI |

If an event doesn't happen, the animation doesn't claim it did.

### Security Boundaries

- **No wallet required** for birth authorization
- **No tokens needed** to create an AI
- **Economic authority = false** (AI cannot spend)
- **Autonomous execution = false** (AI cannot act alone)
- **Network authority = false** (AI cannot deploy)
- **Private keys never stored** (only public identity)
- **No fabricated transactions** (real or pending only)

### 0G Aristotle Integration

- **Chain ID**: 16661
- **RPC**: https://evmrpc.0g.ai
- **Explorer**: https://chainscan.0g.ai

The birth manifest hash is what gets attested on-chain.

### Human Authorization

Preferred: **Passkey / WebAuthn**

The human proves they are the person authorizing creation without:
- Passwords
- Blockchain wallets
- Personal information collection

The authorization creates a cryptographic commitment that becomes part of the birth record.

### External Identity Linking (Optional)

After birth and verification:

```
VERIFIED HUMAN
      ↓
QPF AI ID
      ↓
PI IDENTITY (OPTIONAL)
```

LINK ≠ CONTROL

- User authenticates via Pi OAuth
- QPF receives only the result (uid, username, wallet_address)
- QPF NEVER receives: password, private key, seed phrase, wallet secret
- See `qpf-external-identity-link/` for the linking protocol

### North Star

**WATCH YOUR AI COME TO LIFE.**

Witness its creation.
Verify its identity.
Meet it.

**LIMITLESS | TRUTH**
