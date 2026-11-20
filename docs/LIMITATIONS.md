# Limitations and Future Work

This document outlines the architectural boundaries, known constraints, and future roadmap for the **Cooperative Gig Services Platform for Household & Community Services**, intended for inclusion in the academic capstone / end-semester college project report.

---

## 1. Intentional Scoping Limitations

In accordance with project constraints prioritizing an egalitarian, well-tested core over surface-level feature sprawl, the following capabilities were intentionally excluded:

1. **No Fiat Money or Payment Processing**:
   - The platform strictly rejects fiat currencies (USD, INR, EUR) and payment gateways (Stripe, Razorpay, PayPal).
   - *Rationale*: Eliminates fee extraction, price surges, and market distortion, adhering to pure cooperative time-banking ethics.
2. **No Real-Time Geolocation / Maps**:
   - Locality is managed through cooperative group boundaries (housing societies, hostels, neighborhoods) rather than GPS coordinates.
   - *Rationale*: Protects resident privacy and focuses trust on verified group membership rather than geolocation tracking.
3. **No Direct In-App Chat**:
   - Booking communication is conducted via structured state-machine updates rather than unmoderated websocket messaging.
   - *Rationale*: Reduces operational overhead and harassment attack surfaces while keeping state transitions auditable.
4. **No Native Mobile App**:
   - The frontend is designed as a responsive, accessible Progressive Web Application (PWA).

---

## 2. Technical Limitations

1. **Single-Tenant Transaction Serialization**:
   - In high-throughput multi-concurrency scenarios, balance calculations derived from table scans could experience contention without row-level locking.
2. **Zero-Balance Bootstrapping**:
   - New members join with zero credits and must earn credits by offering services first, or receive an initial community welcome grant from a group admin.
3. **Fixed Integer Duration Truncation**:
   - Durations are calculated in minutes and rounded to integer credit increments ($1\text{ hr} = 1\text{ credit}$). Fractional credits are disallowed.

---

## 3. Future Roadmap

1. **Dispute Resolution & Community Jury**:
   - Implementation of decentralized community arbitration where three neutral, active group members vote to resolve contested service quality before ledger posting.
2. **Scheduled Time-Credit Decay (Demurrage)**:
   - Introducing a gradual demurrage mechanism (e.g., 2% credit expiration per quarter) to discourage credit hoarding and incentivize circulation within the cooperative.
3. **Cross-Group Credit Bridges**:
   - Allowing audited federation between neighboring cooperatives with an agreed-upon exchange ratio or reciprocal clearinghouse.
4. **Offline Proof-of-Work Vouchers**:
   - Cryptographic offline QR tokens that allow elderly or non-smartphone community members to sign off on completed services without immediate internet access.
5. **Enhanced Moderation Tooling**:
   - Automated anomaly detection for suspicious booking patterns or rating collusion.
