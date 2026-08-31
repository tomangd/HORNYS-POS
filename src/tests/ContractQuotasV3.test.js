// RED tests for per-employee contract article quotas.
// These tests describe the business rules before the implementation is wired.

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message + `\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function testQuotaRuleIsPerEmployeeAndArticle() {
  const rules = [
    { contractId: 'CTR-1', employeeId: 'EMP-1', articleId: 'ART-1', quota: 2, period: 'DAY' },
    { contractId: 'CTR-1', employeeId: 'EMP-2', articleId: 'ART-1', quota: 5, period: 'DAY' },
  ];
  assertEqual(
    getContractQuotaRuleForTest(rules, 'CTR-1', 'EMP-1', 'ART-1'),
    { quota: 2, period: 'DAY' },
    'EMP-1 must have its own quota',
  );
  assertEqual(
    getContractQuotaRuleForTest(rules, 'CTR-1', 'EMP-2', 'ART-1'),
    { quota: 5, period: 'DAY' },
    'EMP-2 must have its own quota',
  );
}

function testMissingRuleMeansArticleNotCovered() {
  const rules = [
    { contractId: 'CTR-1', employeeId: 'EMP-1', articleId: 'ART-1', quota: 2, period: 'DAY' },
  ];
  assertEqual(
    getContractQuotaRuleForTest(rules, 'CTR-1', 'EMP-1', 'ART-2'),
    null,
    'An article without a rule must not be covered',
  );
}

function testZeroQuotaMeansNoConsumptionAllowed() {
  const rules = [
    { contractId: 'CTR-1', employeeId: 'EMP-1', articleId: 'ART-1', quota: 0, period: 'DAY' },
  ];
  assertEqual(
    getContractQuotaRuleForTest(rules, 'CTR-1', 'EMP-1', 'ART-1'),
    { quota: 0, period: 'DAY' },
    'Zero is a valid explicit quota',
  );
}

// Intentionally referenced before implementation: this is the RED phase.
