# HORNYS-POS v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make HORNYS-POS a reliable, coherent restaurant POS while preserving Google Apps Script + Google Sheets and consolidating existing caisse, clients, contracts, invoices, loyalty and permissions workflows.

**Architecture:** Keep Apps Script as the backend and Google Sheets as the persistence layer, but introduce explicit validation, authorization, locking, batch data access and shared UI primitives. Refactor incrementally instead of replacing the working application wholesale.

**Tech Stack:** Google Apps Script V8, HTMLService, vanilla JavaScript, HTML, CSS, Google Sheets, clasp.

**Spec:** `docs/superpowers/plans/2026-08-29-hornys-pos-v3.md`.

## Global Constraints

- Preserve `Europe/Paris`, V8 runtime, and the existing Apps Script web-app deployment model.
- Preserve Google Sheets as the primary database; do not introduce a required external database.
- Preserve existing business concepts: cash/card/mixed/ledger payment, company contracts, invoices, customers, loyalty and role permissions.
- Never trust client-side permissions; sensitive server operations must authorize the active seller.
- Avoid per-cell spreadsheet writes in transaction paths; prefer batched reads/writes.
- Do not silently change existing sheet column semantics; migrations must be additive and backward-compatible.
- Every behavioral change must have a reproducible test or verification procedure.

---

### Task 1: Baseline audit and safety harness

**Files:**
- Create: `tests/test_static_audit.py`
- Create: `docs/superpowers/audits/2026-08-29-baseline.md`
- Modify: `.gitignore` only if required by the test tooling.

**Interfaces:**
- Consumes: repository source files and Apps Script project metadata.
- Produces: a repeatable static audit covering JavaScript syntax, duplicate function names, missing referenced functions and dangerous direct spreadsheet writes.

- [ ] **Step 1: Write the failing audit tests**

Create a Python unittest that scans `Code.js`, `JS.html`, `Index.html`, and `CSS.html`, extracts function declarations, detects duplicate global function names, and checks that every `google.script.run.<method>` reference has a corresponding server function. The test must initially report the current duplicate/missing references rather than hiding them.

- [ ] **Step 2: Run the audit and record baseline failures**

Run `python -m unittest tests/test_static_audit.py -v`. Save the observed failures and high-risk findings in `docs/superpowers/audits/2026-08-29-baseline.md`.

- [ ] **Step 3: Add only the minimum audit infrastructure**

Make the parser tolerant of HTML script/style wrappers and Apps Script template tags. Do not modify production behavior in this task.

- [ ] **Step 4: Run the audit again**

Run `python -m unittest tests/test_static_audit.py -v` and confirm the scanner itself passes while the baseline findings remain explicit.

- [ ] **Step 5: Commit**

`git add tests/test_static_audit.py docs/superpowers/audits/2026-08-29-baseline.md && git commit -m "test: add HORNYS-POS static audit harness"`

### Task 2: Shared server infrastructure

**Files:**
- Create: `ServerUtils.js`
- Modify: `Code.js`
- Test: `tests/test_server_utils.py`

**Interfaces:**
- Consumes: existing `obtenirFeuille`, `NOMS_ONGLETS`, seller data and permission configuration.
- Produces: `normaliserId(value)`, `normaliserBooleen(value)`, `normaliserMontant(value)`, `requireAuthenticatedSeller(vendeurId)`, `requirePermission(vendeurId, feature)`, `withSheetLock(callback)`, and `appendRows(sheet, rows)`.

- [ ] **Step 1: Write failing tests for normalization and authorization contracts**

Test that IDs are normalized consistently, monetary values reject NaN/infinite values, unauthorized sellers are rejected, authorized sellers are accepted, and sheet transactions use a document lock.

- [ ] **Step 2: Verify RED**

Run `python -m unittest tests/test_server_utils.py -v` and confirm the contract tests fail because the utilities do not yet exist.

- [ ] **Step 3: Implement minimal server utilities**

Keep utilities dependency-light and Apps Script compatible. Authorization must resolve the seller from the server-side `VENDEURS` sheet and derive permissions with `obtenirPermissionsRole`; never trust a permission object supplied by the browser.

- [ ] **Step 4: Refactor only transaction-critical paths to use the utilities**

Wrap payment/order persistence and seller/permission mutations with server-side authorization and `LockService.getDocumentLock()` without changing sheet schemas.

- [ ] **Step 5: Verify**

Run the static audit and Apps Script-compatible syntax checks. Confirm no transaction path writes without a lock where concurrent edits can corrupt totals.

- [ ] **Step 6: Commit**

`git add ServerUtils.js Code.js tests/test_server_utils.py && git commit -m "refactor: add secure server utilities"`

### Task 3: Payment and order state machine

**Files:**
- Create: `OrderService.js`
- Modify: `Code.js`, `JS.html`
- Test: `tests/test_order_service.py`

**Interfaces:**
- Consumes: cart items, selected payment mode, customer/contract IDs and current seller.
- Produces: validated order payloads and deterministic totals; payment states `draft`, `pending`, `paid`, `cancelled`.

- [ ] **Step 1: Write failing tests**

Cover empty carts, invalid quantities/prices, reduction greater than subtotal, mixed payment totals, duplicate submission IDs and valid cash/card/ledger transactions.

- [ ] **Step 2: Verify RED**

Run the order-service tests and confirm they fail before implementation.

- [ ] **Step 3: Implement deterministic order validation and totals**

Calculate subtotal from canonical item values, clamp no business values silently, reject invalid totals, and assign an idempotency key to each encaissement.

- [ ] **Step 4: Integrate the existing caisse flow**

Make the current `encaisser`/payment path call the service, preserving existing Google Sheet columns and existing UI labels where possible.

- [ ] **Step 5: Verify**

Exercise cash, card, mixed and company-ledger payment paths; verify duplicate clicks do not create duplicate sales.

- [ ] **Step 6: Commit**

`git add OrderService.js Code.js JS.html tests/test_order_service.py && git commit -m "feat: harden order and payment processing"`

### Task 4: Google Sheets data-access layer

**Files:**
- Create: `SheetRepository.js`
- Modify: `Code.js`
- Test: `tests/test_sheet_repository.py`

**Interfaces:**
- Produces: `getAllRows(sheetName)`, `findRows(sheetName, predicate)`, `appendRows(sheetName, rows)`, `updateRow(sheetName, rowNumber, row)`, and `ensureHeaders(sheetName, headers)`.

- [ ] **Step 1: Write failing repository tests**

Test header detection, empty sheets, batched append and row updates without cell-by-cell loops.

- [ ] **Step 2: Verify RED**

Run the repository tests and confirm failure before implementation.

- [ ] **Step 3: Implement batched repository methods**

Centralize header mapping and data-range access. Preserve dates and boolean values instead of converting everything to display strings.

- [ ] **Step 4: Migrate high-frequency reads/writes**

Migrate articles, clients, sellers, orders, contract transactions and loyalty updates first. Leave initialization functions compatible with the current sheets.

- [ ] **Step 5: Verify performance invariants**

Static-scan transaction code to ensure no repeated `getRange(...).setValue(...)` loop remains in migrated paths.

- [ ] **Step 6: Commit**

`git add SheetRepository.js Code.js tests/test_sheet_repository.py && git commit -m "refactor: centralize Google Sheets data access"`

### Task 5: Contracts, ardoises and company accounting

**Files:**
- Create: `ContractService.js`
- Modify: `Code.js`, `JS.html`
- Test: `tests/test_contract_service.py`

**Interfaces:**
- Produces: contract validation, eligibility checks, discount calculation, company/employee split, ledger entry and consumption payloads.

- [ ] **Step 1: Write failing contract tests**

Cover weekly fixed contracts, limits, allowed/forbidden products, overage pricing, active date ranges, employee eligibility, company percentage and employee percentage.

- [ ] **Step 2: Verify RED**

Run the contract tests and confirm failure before implementation.

- [ ] **Step 3: Implement contract rules as pure calculations**

Return structured decisions rather than directly writing Sheets. Reject expired/inactive contracts and invalid percentage totals.

- [ ] **Step 4: Integrate persistence**

Persist contract transactions, consumption, ledger entries and invoices atomically under the document lock.

- [ ] **Step 5: Verify end-to-end scenarios**

Test a normal covered order, an overage order, a forbidden product, an unknown employee, an expired contract and invoice generation.

- [ ] **Step 6: Commit**

`git add ContractService.js Code.js JS.html tests/test_contract_service.py && git commit -m "feat: consolidate company contract accounting"`

### Task 6: Customers and loyalty

**Files:**
- Create: `CustomerService.js`
- Modify: `Code.js`, `JS.html`
- Test: `tests/test_customer_service.py`

**Interfaces:**
- Produces: customer creation/update, loyalty point accrual, reward eligibility and redemption records.

- [ ] **Step 1: Write failing customer/loyalty tests**

Cover one dollar equals one point, no points on cancelled transactions, reward eligibility at 10/100/1000 points, insufficient points, and atomic redemption.

- [ ] **Step 2: Verify RED**

Run customer tests and confirm failure before implementation.

- [ ] **Step 3: Implement customer service**

Normalize customer IDs and update points under a document lock. Keep rewards configurable through `RECOMPENSES` while preserving the current default rewards.

- [ ] **Step 4: Integrate the caisse**

Allow customer creation/selection after payment-method selection and show current points/rewards consistently.

- [ ] **Step 5: Verify**

Complete paid and cancelled orders and verify points/history remain consistent.

- [ ] **Step 6: Commit**

`git add CustomerService.js Code.js JS.html tests/test_customer_service.py && git commit -m "feat: harden customers and loyalty"`

### Task 7: Stock and product management

**Files:**
- Create: `InventoryService.js`
- Modify: `Code.js`, `JS.html`, `Index.html`
- Test: `tests/test_inventory_service.py`

**Interfaces:**
- Produces: stock movements, low-stock decisions, product availability and cost calculations.

- [ ] **Step 1: Write failing inventory tests**

Cover stock decrement on completed sales, no decrement on cancelled sales, manual adjustments, negative-stock policy, low-stock thresholds and product deactivation.

- [ ] **Step 2: Verify RED**

Run inventory tests and confirm failure before implementation.

- [ ] **Step 3: Implement movement-based inventory**

Use `STOCK_MOVEMENTS` as the audit source where possible, while retaining compatibility with the current `ARTICLES.Stock` column.

- [ ] **Step 4: Integrate product availability**

Prevent selling inactive products and clearly flag low/out-of-stock products in the catalogue.

- [ ] **Step 5: Verify**

Test normal sale, cancellation, adjustment and low-stock display.

- [ ] **Step 6: Commit**

`git add InventoryService.js Code.js JS.html Index.html tests/test_inventory_service.py && git commit -m "feat: add reliable inventory management"`

### Task 8: Shared UI/design system

**Files:**
- Create: `DesignSystem.html`
- Modify: `CSS.html`, `Index.html`, `JS.html`
- Test: `tests/test_ui_consistency.py`

**Interfaces:**
- Produces: shared classes for buttons, cards, forms, tables, badges, modals, alerts, loading states and empty states.

- [ ] **Step 1: Write failing UI consistency checks**

Scan HTML/CSS for duplicated inline button styles, inconsistent hard-coded colors and page-specific component variants.

- [ ] **Step 2: Verify RED**

Run the UI checks and record current violations.

- [ ] **Step 3: Define design tokens**

Centralize colors, spacing, radius, typography, focus rings and status states in CSS variables. Keep the existing night/day theme behavior.

- [ ] **Step 4: Replace high-visibility inconsistencies**

Normalize sidebar, header, sections, buttons, forms, tables and modals first. Remove duplicated inline styles only when the shared class fully replaces them.

- [ ] **Step 5: Verify responsive layouts**

Check desktop, tablet and narrow mobile widths; verify the caisse two-panel layout and mobile tabs still work.

- [ ] **Step 6: Commit**

`git add DesignSystem.html CSS.html Index.html JS.html tests/test_ui_consistency.py && git commit -m "style: unify HORNYS-POS design system"`

### Task 9: Dashboard, reporting and audit log

**Files:**
- Create: `ReportingService.js`
- Modify: `Code.js`, `JS.html`, `Index.html`
- Test: `tests/test_reporting_service.py`

**Interfaces:**
- Produces: period KPIs, payment breakdown, product/category rankings, low-stock alerts, outstanding company balances and audit-log entries.

- [ ] **Step 1: Write failing reporting tests**

Cover zero-sales periods, date boundaries, payment totals, average ticket and cancelled transactions exclusion.

- [ ] **Step 2: Verify RED**

Run reporting tests and confirm failure before implementation.

- [ ] **Step 3: Implement reporting from normalized transaction data**

Keep reporting read-only and avoid modifying operational sheets during dashboard rendering.

- [ ] **Step 4: Integrate dashboard cards and activity feed**

Add CA, tickets, average ticket, payment mix, top products and operational alerts while preserving existing dashboard data.

- [ ] **Step 5: Verify**

Compare dashboard totals against raw sales rows for known fixtures.

- [ ] **Step 6: Commit**

`git add ReportingService.js Code.js JS.html Index.html tests/test_reporting_service.py && git commit -m "feat: expand dashboard and reporting"`

### Task 10: Permissions and authentication hardening

**Files:**
- Create: `AuthService.js`
- Modify: `Code.js`, `JS.html`, `Index.html`
- Test: `tests/test_auth_service.py`

**Interfaces:**
- Produces: server-authoritative seller session validation, role permissions and protected mutation helpers.

- [ ] **Step 1: Write failing security tests**

Test inactive sellers, unknown sellers, permission denial and authorized admin/manager/vendor actions.

- [ ] **Step 2: Verify RED**

Run auth tests and confirm failure before implementation.

- [ ] **Step 3: Implement authorization service**

Resolve the seller server-side and reject any mutation whose required feature is not allowed. Keep UI hiding as a convenience only, not as security.

- [ ] **Step 4: Replace sensitive endpoints**

Protect vendor edits, permission edits, contract changes, invoices, rewards and financial mutations.

- [ ] **Step 5: Verify**

Run static scans for protected endpoints and execute authorization fixtures.

- [ ] **Step 6: Commit**

`git add AuthService.js Code.js JS.html Index.html tests/test_auth_service.py && git commit -m "security: enforce server-side POS permissions"`

### Task 11: Operational UX and error handling

**Files:**
- Modify: `CSS.html`, `Index.html`, `JS.html`
- Create: `ErrorService.html`
- Test: `tests/test_frontend_contracts.py`

**Interfaces:**
- Produces: consistent toast/error/loading/empty states, keyboard handling and safe async action guards.

- [ ] **Step 1: Write failing frontend contract tests**

Check every async `google.script.run` action has success/failure handling, critical buttons have disabled/loading behavior, and PIN supports top-row digits plus numpad.

- [ ] **Step 2: Verify RED**

Run the frontend contract tests and record violations.

- [ ] **Step 3: Implement centralized client helpers**

Provide one wrapper for success/failure/loading state and one keyboard dispatcher. Preserve existing function names where the HTML calls them directly.

- [ ] **Step 4: Integrate across critical workflows**

Apply to login, payment, customer creation, contract selection, invoices and permission changes.

- [ ] **Step 5: Verify**

Test keyboard, mouse and touch interaction and ensure errors remain visible and actionable.

- [ ] **Step 6: Commit**

`git add CSS.html Index.html JS.html ErrorService.html tests/test_frontend_contracts.py && git commit -m "fix: standardize POS async UX and keyboard handling"`

### Task 12: Final cleanup, documentation and release gate

**Files:**
- Modify: all production files as required by previous tasks.
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/GOOGLE-SHEETS-SCHEMA.md`
- Create: `docs/DEPLOYMENT.md`
- Test: all `tests/` suites.

**Interfaces:**
- Produces: documented architecture, sheet schema, deployment procedure and a release-ready branch.

- [ ] **Step 1: Run every test suite**

Run `python -m unittest discover -s tests -v` and the static syntax checks. No known regression may remain undocumented.

- [ ] **Step 2: Perform a production-path review**

Manually trace: login → caisse → customer → contract/ardoise → payment → inventory → loyalty → invoice → dashboard.

- [ ] **Step 3: Remove dead code safely**

Delete only functions proven unused by static/reference analysis or clearly superseded with backward-compatible aliases. Preserve the historical backup file unless it contains secrets or causes tooling issues.

- [ ] **Step 4: Document Google Sheets**

Document every sheet, header, data type, ownership and migration rule. Include the contract/company sheets already defined in `Code.js`.

- [ ] **Step 5: Document deployment**

Document clasp push, Apps Script deployment, required spreadsheet binding and verification of `Europe/Paris`, V8 and web-app access settings.

- [ ] **Step 6: Final verification**

Run all tests again, inspect the diff against `main`, and verify the branch contains no credentials, webhooks or other secrets.

- [ ] **Step 7: Commit**

`git add . && git commit -m "chore: prepare HORNYS-POS v3 release"`
