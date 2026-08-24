function getArticles() {
  const values = getSheetData(CONFIG.SHEETS.ARTICLES);

  return values
    .slice(1)
    .filter(row => row[6] !== false)
    .map(row => ({
      id: row[0],
      nom: row[1],
      categorie: row[2],
      prix: Number(row[3]) || 0,
      stock: Number(row[4]) || 0,
      stockMin: Number(row[5]) || 0,
      actif: row[6],
      variants: row[7]
    }));
}

function getArticleById(id) {
  const values = getSheetData(CONFIG.SHEETS.ARTICLES);

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (String(row[0]) === String(id)) {
      return {
        id: row[0],
        nom: row[1],
        categorie: row[2],
        prix: Number(row[3]) || 0,
        stock: Number(row[4]) || 0,
        stockMin: Number(row[5]) || 0,
        actif: row[6],
        variants: row[7]
      };
    }
  }

  return null;
}

function modifierStock(articleId, nouvelleQuantite) {
  const sheet = getSheet(CONFIG.SHEETS.ARTICLES);
  const values = sheet.getDataRange().getValues();

  const quantite = Number(nouvelleQuantite);

  if (!Number.isFinite(quantite) || quantite < 0) {
    throw new Error("Quantité de stock invalide.");
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(articleId)) {
      sheet.getRange(i + 1, 5).setValue(quantite);

      verifierStockArticle(
        values[i][0],
        values[i][1],
        quantite,
        Number(values[i][5]) || 0
      );

      return {
        success: true,
        articleId: values[i][0],
        stock: quantite
      };
    }
  }

  throw new Error("Article introuvable.");
}

function diminuerStock(articleId, quantite) {
  const sheet = getSheet(CONFIG.SHEETS.ARTICLES);
  const values = sheet.getDataRange().getValues();

  const quantiteDemandee = Number(quantite);

  if (!Number.isFinite(quantiteDemandee) || quantiteDemandee <= 0) {
    throw new Error("Quantité à retirer invalide.");
  }

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (String(row[0]) !== String(articleId)) {
      continue;
    }

    const stockActuel = Number(row[4]) || 0;
    const stockMin = Number(row[5]) || 0;

    if (stockActuel < quantiteDemandee) {
      throw new Error(
        "Stock insuffisant pour l'article : " + row[1]
      );
    }

    const nouveauStock = stockActuel - quantiteDemandee;

    sheet.getRange(i + 1, 5).setValue(nouveauStock);

    verifierStockArticle(
      row[0],
      row[1],
      nouveauStock,
      stockMin
    );

    return {
      success: true,
      articleId: row[0],
      ancienStock: stockActuel,
      nouveauStock: nouveauStock
    };
  }

  throw new Error("Article introuvable.");
}

function verifierStockArticle(
  articleId,
  nom,
  stock,
  stockMin
) {
  if (stock <= stockMin) {
    console.warn(
      "Stock faible : " +
      nom +
      " (" +
      stock +
      " restant)"
    );

    return true;
  }

  return false;
}