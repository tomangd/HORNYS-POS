function getClients() {
  const values = getSheetData(CONFIG.SHEETS.CLIENTS);

  return values
    .slice(1)
    .filter(row => row[6] !== false)
    .map(row => ({
      id: row[0],
      nom: row[1],
      entreprise: row[2],
      email: row[3],
      telephone: row[4],
      adresse: row[5],
      actif: row[6]
    }));
}

function getClientById(id) {
  const values = getSheetData(CONFIG.SHEETS.CLIENTS);

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (String(row[0]) === String(id)) {
      return {
        id: row[0],
        nom: row[1],
        entreprise: row[2],
        email: row[3],
        telephone: row[4],
        adresse: row[5],
        actif: row[6]
      };
    }
  }

  return null;
}