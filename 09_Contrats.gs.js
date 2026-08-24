function getClientById(clientId) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Clients");

  if (!sheet) {
    return null;
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(clientId)) {
      return {
        id: values[i][0],
        nom: values[i][1],
        entreprise: values[i][2],
        email: values[i][3],
        telephone: values[i][4],
        adresse: values[i][5],
        actif: values[i][6]
      };
    }
  }

  return null;
}

function getContratActif(clientId) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Contrats");

  if (!sheet) {
    return null;
  }

  const values = sheet.getDataRange().getValues();
  const maintenant = new Date();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    const id = row[0];
    const contratClientId = row[1];
    const actif = row[9];
    const dateDebut = row[7];
    const dateFin = row[8];

    if (
      String(contratClientId) !== String(clientId) ||
      actif !== true
    ) {
      continue;
    }

    if (
      dateDebut instanceof Date &&
      maintenant < dateDebut
    ) {
      continue;
    }

    if (
      dateFin instanceof Date &&
      maintenant > dateFin
    ) {
      continue;
    }

    return {
      id: id,
      clientId: contratClientId,
      type: row[2],
      reduction: Number(row[3]) || 0,
      limiteArdoise: Number(row[4]) || 0,
      limiteCommandes: Number(row[5]) || 0,
      dureeJours: Number(row[6]) || 0,
      dateDebut: dateDebut,
      dateFin: dateFin,
      actif: actif,
      notes: row[10] || ""
    };
  }

  return null;
}

function getDroitsContrat(clientId) {
  const contrat = getContratActif(clientId);

  if (!contrat) {
    return {
      contrat: null,
      reductionAutorisee: false,
      ardoiseAutorisee: false,
      reduction: 0,
      limiteArdoise: 0
    };
  }

  const type = String(
    contrat.type || ""
  ).toLowerCase();

  const reductionAutorisee =
    contrat.reduction > 0;

  const ardoiseAutorisee =
    type.includes("ardoise");

  return {
    contrat: contrat,
    reductionAutorisee: reductionAutorisee,
    ardoiseAutorisee: ardoiseAutorisee,
    reduction: contrat.reduction,
    limiteArdoise: contrat.limiteArdoise
  };
}

function calculerReductionClient(
  sousTotal,
  clientId
) {
  const droits = getDroitsContrat(clientId);

  if (!droits.reductionAutorisee) {
    return {
      montant: 0,
      taux: 0,
      contrat: droits.contrat
    };
  }

  const taux = droits.reduction / 100;

  const montant =
    Number(sousTotal || 0) * taux;

  return {
    montant: Number(montant.toFixed(2)),
    taux: droits.reduction,
    contrat: droits.contrat
  };
}

function verifierAutorisationArdoise(
  clientId,
  montant
) {
  const droits =
    getDroitsContrat(clientId);

  if (!droits.contrat) {
    return {
      autorisee: false,
      raison: "Aucun contrat actif pour ce client."
    };
  }

  if (!droits.ardoiseAutorisee) {
    return {
      autorisee: false,
      raison:
        "Le contrat client n'autorise pas les ardoises."
    };
  }

  const limite =
    Number(droits.limiteArdoise || 0);

  if (limite <= 0) {
    return {
      autorisee: false,
      raison:
        "Aucune limite d'ardoise n'est définie pour ce contrat."
    };
  }

  const solde =
    getSoldeArdoise(clientId);

  const nouveauSolde =
    solde + Number(montant || 0);

  if (nouveauSolde > limite) {
    return {
      autorisee: false,
      raison:
        "La limite d'ardoise serait dépassée.",
      soldeActuel: solde,
      limite: limite,
      nouveauSolde: nouveauSolde
    };
  }

  return {
    autorisee: true,
    soldeActuel: solde,
    limite: limite,
    nouveauSolde: nouveauSolde
  };
}

function getSoldeArdoise(clientId) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Ardoises");

  if (!sheet || sheet.getLastRow() < 2) {
    return 0;
  }

  const values =
    sheet.getDataRange().getValues();

  let solde = 0;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (
      String(row[2]) !== String(clientId)
    ) {
      continue;
    }

    const montant =
      Number(row[4]) || 0;

    const statut =
      String(row[6] || "");

    if (statut === "À régler") {
      solde += montant;
    }
  }

  return Number(solde.toFixed(2));
}