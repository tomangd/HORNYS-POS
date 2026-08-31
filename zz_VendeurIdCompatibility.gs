/**
 * HORNYS-POS compatibility guard.
 *
 * Some legacy execution paths referenced vendeurId as a global value while
 * newer APIs pass it explicitly as a function argument. Apps Script evaluates
 * all server files in one global scope, so define a harmless fallback to keep
 * legacy/admin paths from throwing ReferenceError when no seller context is
 * available yet. Explicit function parameters still shadow this value.
 */
var vendeurId = null;
