/**
 * HORNYS-POS — shared server-side validation helpers.
 */
var Validation = (function () {
  'use strict';

  function required(value, field) {
    if (value === null || value === undefined || String(value).trim() === '') {
      throw new Error((field || 'Champ') + ' est requis.');
    }
    return value;
  }

  function positiveNumber(value, field) {
    var n = Number(value);
    if (!isFinite(n) || n < 0) {
      throw new Error((field || 'Valeur') + ' doit être un nombre positif.');
    }
    return n;
  }

  function integer(value, field) {
    var n = Number(value);
    if (!Number.isInteger(n)) {
      throw new Error((field || 'Valeur') + ' doit être un entier.');
    }
    return n;
  }

  function object(value, field) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error((field || 'Données') + ' invalides.');
    }
    return value;
  }

  return {
    required: required,
    positiveNumber: positiveNumber,
    integer: integer,
    object: object
  };
})();
