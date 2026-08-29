# HORNYS-POS V3 Checkout Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the migration of the existing HORNYS-POS checkout to the V3 transactional architecture without breaking the current UI, then harden payment, contract, ledger, stock and customer flows.

**Architecture:** Keep the existing POS shell and progressively replace legacy checkout calls with the canonical `CheckoutPayloadV3 → CheckoutServiceV3 → TransactionService → VenteServiceV3` pipeline. Domain services remain isolated and Google Sheets remains the persistence layer. UI modernization is performed only after functional migration is stable.

**Tech Stack:** Google Apps Script, HTML/CSS/JavaScript, Google Sheets, GitHub.

**Spec:** Architecture approved in chat on 2026-08-29: preserve the existing UI and progressively migrate it to the V3 backend pipeline.

## Global Constraints

- Do not rewrite the existing `Index.html` shell unless strictly required.
- Preserve the existing Google Sheets schema and legacy compatibility during migration.
- Every sale must have an idempotency/order identifier.
- The transaction boundary owns the global lock.
- Payment modes must remain distinct: Facture, Contrat entreprise, Ardoise, Fidélité and ordinary payment.
- Do not claim a feature is complete until it has been verified.
- Prefer focused service/client files over enlarging monolithic files.

---

### Task 1: Canonical checkout payload

**Files:**
- Modify: `src/client/CheckoutPayloadV3.html`
- Test: `src/client/CheckoutPayloadV3.html` via browser/manual fixture

**Interfaces:**
- Consumes: existing POS state object.
- Produces: normalized payload with `orderId`, `vendeur`, `articles`, `paiement`, `clientId`, `contractId`, `employeeId`, `rewardId`, `ardoise`.

- [ ] Verify empty-cart rejection.
- [ ] Verify quantity normalization.
- [ ] Verify seller fallback.
- [ ] Verify all payment-specific fields survive normalization.

### Task 2: Canonical server checkout

**Files:**
- Modify: `src/services/CheckoutServiceV3.gs`
- Modify: `src/api/CheckoutApiV3.gs`
- Test: Apps Script execution tests for `verifierCheckoutV3`.

**Interfaces:**
- Consumes: canonical checkout payload.
- Produces: validated V3 transaction input and transaction result.

- [ ] Verify missing `orderId` is rejected.
- [ ] Verify invalid payment mode is rejected.
- [ ] Verify Ardoise metadata cannot accompany another payment mode.
- [ ] Verify execution enters `TransactionService` exactly once.

### Task 3: Legacy caisse bridge

**Files:**
- Modify: `JS.html` only at the existing checkout submission function.
- Modify: `src/client/PaymentFlowV3.html` if required.
- Modify: `src/client/CheckoutBridgeV3.html` if required.

**Interfaces:**
- Consumes: current basket/payment UI state.
- Produces: call to `POSCheckoutV3.submit()` rather than legacy direct persistence.

- [ ] Locate every checkout submission path.
- [ ] Route normal payment through V3.
- [ ] Route Facture through V3.
- [ ] Route Contrat through V3.
- [ ] Route Ardoise through V3.
- [ ] Route loyalty/reward through V3.
- [ ] Preserve existing success UI and receipt behavior.
- [ ] Preserve existing error display.

### Task 4: Payment business rules

**Files:**
- Modify: `src/services/PaymentServiceV3.gs`
- Modify: `src/services/VenteServiceV3.gs`

- [ ] Separate Facture from Contrat semantics.
- [ ] Require contract data only for contract payment.
- [ ] Require ledger target only for Ardoise.
- [ ] Require customer/reward for loyalty redemption.
- [ ] Ensure loyalty points are not awarded when a reward is redeemed.
- [ ] Ensure total/discount rounding is deterministic.

### Task 5: Contract and employee validation

**Files:**
- Modify: `src/services/ContractServiceV3.gs`
- Test: contract validation cases.

- [ ] Validate active contract period.
- [ ] Validate employee eligibility.
- [ ] Validate contracted products/quantities.
- [ ] Verify weekly fixed discount.
- [ ] Verify transaction ledger allocation.
- [ ] Verify webhook status handling cannot corrupt the sale.

### Task 6: Ardoise / ledger

**Files:**
- Modify: `src/services/ArdoiseServiceV3.gs`
- Modify: ledger persistence helpers as required.

- [ ] Create deferred balance atomically with the sale.
- [ ] Prevent paid amount from exceeding total.
- [ ] Preserve company/customer identity.
- [ ] Audit ardoise creation.
- [ ] Verify balance/status transitions.

### Task 7: Stock consistency

**Files:**
- Modify: `src/services/StockServiceV3.gs`
- Modify: `src/services/VenteServiceV3.gs`

- [ ] Validate availability before persistence.
- [ ] Consume stock exactly once.
- [ ] Ensure duplicate `orderId` cannot consume stock twice.
- [ ] Verify failure behavior when stock is insufficient.

### Task 8: Customer and loyalty integration

**Files:**
- Modify: `src/services/CustomerServiceV3.gs`
- Modify: `src/services/VenteServiceV3.gs`

- [ ] Verify customer lookup.
- [ ] Verify points accumulation.
- [ ] Verify reward redemption.
- [ ] Prevent duplicate point awards on repeated requests.
- [ ] Expose useful customer data to checkout UI.

### Task 9: UI consistency and payment UX

**Files:**
- Modify: `CSS.html`
- Modify: `JS.html` in focused sections only.
- Modify/create: `src/client/*V3.html` focused modules.

- [ ] Standardize buttons, dialogs, loading states and errors.
- [ ] Prevent double submission.
- [ ] Make keyboard/numpad input reliable.
- [ ] Ensure responsive tablet layout.
- [ ] Ensure every payment flow has the same visual lifecycle.

### Task 10: Dashboard and operational features

**Files:**
- Create/modify focused dashboard service and UI files.

- [ ] Daily turnover.
- [ ] Payment-method breakdown.
- [ ] Top products.
- [ ] Stock alerts.
- [ ] Contract/company outstanding balances.
- [ ] Customer loyalty statistics.
- [ ] Employee activity summary.

### Task 11: Verification and regression

**Files:**
- Create: focused test fixtures/documentation as needed.

- [ ] Test normal cash/card sale.
- [ ] Test Facture.
- [ ] Test Contrat entreprise.
- [ ] Test Ardoise.
- [ ] Test loyalty points.
- [ ] Test reward redemption.
- [ ] Test insufficient stock.
- [ ] Test duplicate submission.
- [ ] Test server failure.
- [ ] Test concurrent checkout behavior.
- [ ] Verify Google Sheets writes and column mappings.
- [ ] Compare branch against `main` and inspect all changed files.

### Task 12: Release readiness

- [ ] Run final verification.
- [ ] Review diffs for accidental large-file replacement.
- [ ] Document deployment steps.
- [ ] Create a PR only after verification.
- [ ] Do not merge automatically into `main` without final review.
