/**
 * HORNYS-POS — consistent Apps Script responses.
 */
var Response = (function () {
  'use strict';

  function ok(data, message) {
    return {
      success: true,
      message: message || '',
      data: data === undefined ? null : data
    };
  }

  function fail(error, code) {
    return {
      success: false,
      code: code || 'ERROR',
      message: error && error.message ? error.message : String(error || 'Erreur inconnue.')
    };
  }

  function run(callback) {
    try {
      return ok(callback());
    } catch (error) {
      console.error(error && error.stack ? error.stack : error);
      return fail(error);
    }
  }

  return { ok: ok, fail: fail, run: run };
})();
