    # Baseline audit

## Repository state

- Branch: `refactor/hornys-pos-v3`
- Main application files: `Code.js`, `Index.html`, `JS.html`, `CSS.html`
- Runtime: Google Apps Script V8 + Google Sheets

## Initial risks identified

1. Monolithic server and client files with tightly coupled UI/business/data logic.
2. Heavy use of inline styles in `Index.html`, reducing visual consistency.
3. Sheet names and schemas are mixed between legacy and newer identifiers.
4. `initializeSheet()` uses repeated sheet insertion attempts and broad exception handling.
5. Security and authorization need systematic server-side verification before feature expansion.
6. No automated test harness is present in the repository, so baseline behavioral tests cannot yet be executed.

## First implementation milestone

Create shared server-side infrastructure for:

- structured success/error responses;
- safe sheet lookup and schema validation;
- idempotency primitives for financial writes;
- centralized audit logging;
- authorization guards reusable by all sensitive operations.

Production behavior must remain backward compatible while call sites are migrated incrementally.
