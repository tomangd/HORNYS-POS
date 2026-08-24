function enregistrerVente(data) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!data) {
      throw new Error("Données de vente manquantes.");
    }

    const vendeurId = data.vendeurId || data.vendeurID;
    const clientId = data.clientId || data.clientID || "";
    const articles = Array.isArray(data.articles) ? data.articles : [];
    const paiement = String(data.paiement || "Cash");
    const employe = String(data.employe || "");

    if (!vendeurId) {
      throw new Error("Vendeur non sélectionné.");
    }

    if (!articles.length) {
      throw new Error("La commande est vide.");
    }

    let client = null;
    let droitsContrat = null;

    if (clientId) {
      client = getClientById(clientId);

      if (!client) {
        throw new Error("Client introuvable.");
      }

      droitsContrat =
        getDroitsContrat(clientId);
    }

    const vendeur = getVendeurById(vendeurId);

    if (!vendeur) {
      throw new Error("Vendeur introuvable.");
    }

    if (vendeur.statut.toLowerCase() !== "actif") {
      throw new Error("Ce vendeur n'est pas actif.");
    }

    const sousTotal =
      calculerSousTotal(articles);

    let reductionManuelle =
      Number(data.reduction || 0);

    if (
      !Number.isFinite(reductionManuelle) ||
      reductionManuelle < 0
    ) {
      reductionManuelle = 0;
    }

    let reductionContrat = 0;

    if (clientId) {
      const calcul =
        calculerReductionClient(
          sousTotal,
          clientId
        );

      reductionContrat = calcul.montant;
    }

    const reduction =
      Math.min(
        sousTotal,
        reductionManuelle +
        reductionContrat
      );

    const total =
      Math.max(
        0,
        sousTotal - reduction
      );
    verifierStockCommande(articles);

    let autorisationArdoise = null;

    if (paiement === "Ardoise") {
      if (!clientId) {
        throw new Error(
          "Un client est obligatoire pour un paiement par ardoise."
        );
      }

      autorisationArdoise =
        verifierAutorisationArdoise(
          clientId,
          total
        );

      if (!autorisationArdoise.autorisee) {
        throw new Error(
          autorisationArdoise.raison
        );
      }
    }

    const id = new Date().getTime();

    const sheet =
      getSheet(CONFIG.SHEETS.VENTES);

    sheet.appendRow([
      id,
      new Date(),
      vendeurId,
      clientId,
      JSON.stringify(articles),
      sousTotal,
      reduction,
      total,
      paiement,
      employe || vendeur.nom,
      "Payée"
    ]);

    articles.forEach(article => {
      diminuerStock(
        article.article.id,
        Number(article.quantity || 1)
      );
    });

    if (paiement === "Ardoise") {
      const ardoise =
        enregistrerArdoise({
          clientId: clientId,
          employe: employe || vendeur.nom,
          montant: total,
          vendeurId: vendeurId
        });

      if (!ardoise || !ardoise.success) {
        throw new Error(
          "Impossible d'enregistrer l'ardoise."
        );
      }
    }

    envoyerLogDiscordVente({
      id: id,
      vendeur: vendeur,
      client: client,
      clientId: clientId,
      droitsContrat: droitsContrat,
      articles: articles,
      sousTotal: sousTotal,
      reduction: reduction,
      total: total,
      paiement: paiement
    });

    return {
      success: true,
      id: id,
      total: total,
      message: "Vente enregistrée avec succès."
    };

  } catch (error) {

    console.error("Erreur vente :", error);

    return {
      success: false,
      message: error.message || "Erreur lors de l'enregistrement."
    };

  } finally {

    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function calculerSousTotal(articles) {
  return Number(
    articles.reduce(function(total, item) {
      const prix =
        Number(item.prix || 0);

      const quantite =
        Number(item.quantity || 1);

      return total + prix * quantite;
    }, 0).toFixed(2)
  );
}

function verifierStockCommande(articles) {
  articles.forEach(item => {
    if (!item.article || !item.article.id) {
      throw new Error("Article invalide dans la commande.");
    }

    const article = getArticleById(item.article.id);

    if (!article) {
      throw new Error(
        "Article introuvable : " + item.article.id
      );
    }

    const quantite = Number(item.quantity || 1);

    if (quantite <= 0) {
      throw new Error(
        "Quantité invalide pour : " + article.nom
      );
    }

    if (article.stock < quantite) {
      throw new Error(
        "Stock insuffisant pour : " + article.nom +
        " (" + article.stock + " disponible)"
      );
    }
  });
}

function getVendeurNom(vendeurId) {
  const vendeur =
    obtenirVendeur(vendeurId);

  if (!vendeur) {
    return "Inconnu";
  }

  return [
    vendeur.prenom,
    vendeur.nom
  ]
    .filter(Boolean)
    .join(" ");
}

function formaterArticlesDiscord(articles) {
  if (!articles || !articles.length) {
    return "Aucun article";
  }

  return articles.map(function(item) {
    const nom =
      item.nomComplet ||
      item.article?.nom ||
      "Article";

    const quantite =
      Number(item.quantity || 1);

    const prix =
      Number(item.prix || 0);

    return `${quantite} × ${nom} — ${(
      prix * quantite
    ).toFixed(2)} €`;
  }).join("\n");
}

function testVenteContratReduction() {
  const result = enregistrerVente({
    vendeurId: 1,
    clientId: 1,

    articles: [
      {
        article: {
          id: 1,
          nom: "Burger Classic",
          prix: 12.90
        },
        prix: 12.90,
        quantity: 1
      }
    ],

    reduction: 0,
    paiement: "Cash"
  });

  Logger.log(
    JSON.stringify(result)
  );
}