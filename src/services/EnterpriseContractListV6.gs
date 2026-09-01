/** Canonical contract reader for the CONTRATS sheet. */
function contratsEntreprisesV6() {
  const sheet = obtenirFeuille("Contrats");
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = (values[0] || []).map(normaliserEntete);
  const col = (names, fallback) => {
    for (const name of names) {
      const i = headers.indexOf(normaliserEntete(name));
      if (i >= 0) return i;
    }
    return fallback;
  };
  const c = {
    id: col(["id", "contract id"], 0),
    clientId: col(["client id"], 1),
    type: col(["type", "type contrat"], 2),
    active: col(["actif", "active"], 9),
    status: col(["status", "statut"], 12),
    companyId: col(["company id"], 13),
    companyName: col(["company name"], 14),
    responsibleName: col(["responsible name"], 15),
    responsiblePhone: col(["responsible phone"], 16),
    discordWebhook: col(["discord webhook"], 17),
    startDate: col(["start date", "date début", "date debut"], 18),
    endDate: col(["end date", "date fin"], 19),
    companyPercent: col(["company percent"], 20),
    employeePercent: col(["employee percent"], 21),
    includedQuantity: col(["included quantity"], 22),
    frequency: col(["frequency"], 23),
    allowedOverage: col(["allowed overage"], 24),
    overagePricing: col(["overage pricing"], 25),
    allowedProducts: col(["allowed products"], 26),
    forbiddenProducts: col(["forbidden products"], 27),
    allowedEmployees: col(["allowed employees"], 28),
    createdAt: col(["created at"], 32),
    updatedAt: col(["updated at"], 33),
    createdBy: col(["created by"], 34),
  };
  const truthy = v => {
    if (typeof v === "boolean") return v;
    const s = String(v == null ? "" : v).trim().toUpperCase();
    return ["TRUE", "VRAI", "1", "ACTIF", "ACTIVE", "OUI", "YES"].includes(s);
  };
  return values.slice(1).filter(row => row && row.some(v => String(v ?? "").trim() !== "")).map(row => ({
    id: String(row[c.id] ?? "").trim(),
    contractId: String(row[c.id] ?? "").trim(),
    clientId: row[c.clientId] ?? "",
    type: row[c.type] ?? "",
    contractType: row[c.type] ?? "",
    actif: truthy(row[c.active]) || truthy(row[c.status]),
    status: row[c.status] ?? (truthy(row[c.active]) ? "ACTIF" : "INACTIF"),
    companyId: row[c.companyId] ?? "",
    companyName: row[c.companyName] ?? "",
    responsibleName: row[c.responsibleName] ?? "",
    responsiblePhone: row[c.responsiblePhone] ?? "",
    discordWebhook: row[c.discordWebhook] ?? "",
    startDate: row[c.startDate] ?? "",
    endDate: row[c.endDate] ?? "",
    companyPercent: Number(row[c.companyPercent]) || 0,
    employeePercent: Number(row[c.employeePercent]) || 0,
    includedQuantity: Number(row[c.includedQuantity]) || 0,
    frequency: row[c.frequency] ?? "",
    allowedOverage: truthy(row[c.allowedOverage]),
    overagePricing: row[c.overagePricing] ?? "",
    allowedProducts: row[c.allowedProducts] ?? "",
    forbiddenProducts: row[c.forbiddenProducts] ?? "",
    allowedEmployees: row[c.allowedEmployees] ?? "",
    createdAt: row[c.createdAt] ?? "",
    updatedAt: row[c.updatedAt] ?? "",
    createdBy: row[c.createdBy] ?? ""
  })).filter(contract => contract.id || contract.contractId);
}
