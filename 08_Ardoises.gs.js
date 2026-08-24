function getArdoises() {
  const values = getSheetData(CONFIG.SHEETS.ARDOISES);

  return values
    .slice(1)
    .map(row => ({
      id: row[0],
      date: row[1],
      clientId: row[2],
      employe: row[3],
      montant: Number(row[4]) || 0,
      vendeurId: row[5],
      statut: row[6]
    }));
}

function getArdoisesByClient(clientId) {
  return getArdoises()
    .filter(
      ardoise =>
        String(ardoise.clientId) === String(clientId)
    );
}

function getSoldeClient(clientId) {
  const ardoises = getArdoisesByClient(clientId);

  return ardoises
    .filter(ardoise => ardoise.statut !== "Réglée")
    .reduce(
      (total, ardoise) =>
        total + Number(ardoise.montant || 0),
      0
    );
}

function enregistrerArdoise(data) {
  if (!data) {
    throw new Error("Données d'ardoise manquantes.");
  }

  if (!data.clientId) {
    throw new Error(
      "Un client est obligatoire pour une ardoise."
    );
  }

  const montant = Number(data.montant || 0);

  if (!Number.isFinite(montant) || montant <= 0) {
    throw new Error("Montant d'ardoise invalide.");
  }

  const client = getClientById(data.clientId);

  if (!client) {
    throw new Error("Client introuvable.");
  }

  const autorisation =
    verifierAutorisationArdoise(
      data.clientId,
      montant
    );

  if (!autorisation.autorisee) {
    throw new Error(
      autorisation.raison
    );
  }

  const sheet = getSheet(CONFIG.SHEETS.ARDOISES);

  const id = new Date().getTime();

  sheet.appendRow([
    id,
    new Date(),
    client.id,
    data.employe || "",
    montant,
    data.vendeurId || "",
    "À régler"
  ]);

  discordLogArdoiseCreation({
    id: id,
    client: client,
    montant: montant,
    vendeurId: data.vendeurId || "",
    employe: data.employe || ""
  });

  return {
    success: true,
    id: id,
    montant: montant
  };
}

function reglerArdoise(ardoiseId) {
  const sheet = getSheet(CONFIG.SHEETS.ARDOISES);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (String(row[0]) !== String(ardoiseId)) {
      continue;
    }

    const statut = String(row[6] || "");

    if (statut === "Réglée") {
      throw new Error(
        "Cette ardoise est déjà réglée."
      );
    }

    sheet.getRange(i + 1, 7).setValue("Réglée");

    const client = getClientById(row[2]);

    discordLogArdoiseReglement({
      id: row[0],
      client: client,
      montant: Number(row[4]) || 0
    });

    return {
      success: true,
      id: row[0],
      message: "Ardoise réglée."
    };
  }

  throw new Error("Ardoise introuvable.");
}

function testArdoise() {
  const result = enregistrerArdoise({
    clientId: 1,
    employe: "Alice",
    vendeurId: 1,
    montant: 25
  });

  Logger.log(JSON.stringify(result));
}

function testReglementArdoise() {
  const ardoises = getArdoisesByClient(1);

  if (!ardoises.length) {
    throw new Error("Aucune ardoise trouvée.");
  }

  const derniere =
    ardoises[ardoises.length - 1];

  const result =
    reglerArdoise(derniere.id);

  Logger.log(
    JSON.stringify(result)
  );
}