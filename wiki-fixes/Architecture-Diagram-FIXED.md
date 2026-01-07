# 🏗️ Architecture Diagram  
### Structural Overview of the Autonomous Ecosystem

This page provides a visual representation of the system architecture — showing how backend, on‑chain, governance, and agent layers interconnect.

---

# 🧱 High‑Level Architecture Diagram

```mermaid
flowchart TB

    subgraph Backend["Backend Layer"]
        Genesis["🏔️ Pi Forge Quantum Genesis"]
        Resonance["⚡ Quantum Resonance Engine"]
    end

    subgraph OnChain["On‑Chain Layer"]
        DEX["💱 Quantum Pi Forge DEX"]
        NFT["🎨 Pi MR NFT System"]
    end

    subgraph Governance["Governance Layer"]
        Soul["🧠 OINIO Soul System"]
        Open["🔓 Quantum Pi Forge OPEN"]
    end

    subgraph Agents["Autonomous Agent Layer"]
        GitHub["🧭 GitHub Agent"]
        Coding["💻 Coding"]
        Creativity["🎨 Creativity"]
        Documentation["📘 Documentation"]
        Testing["🧪 Testing"]
        Steward["🌿 Steward"]
        Design["🎨 Design"]
        GovernanceA["⚖️ Governance"]
        Onboarding["🌱 Onboarding"]
    end

    Genesis --> Resonance
    Resonance --> DEX
    Resonance --> NFT
    NFT --> Soul
    Soul --> Open
    Open --> Genesis

    GitHub --> Coding
    GitHub --> Creativity
    GitHub --> Documentation
    GitHub --> Testing
    GitHub --> Steward
    GitHub --> Design
    GitHub --> GovernanceA
    GitHub --> Onboarding
```

---

## Related Resources

- [Ecosystem Overview](Ecosystem)
- [Folder Structure](Folder-Structure)
- [Agent Documentation](Home#agents)
