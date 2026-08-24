function discordEnvoyerEmbed(embed) {
  const webhook = getDiscordWebhook();

  if (!webhook) {
    console.warn("Webhook Discord non configuré.");
    return false;
  }

  const payload = {
    username: "Horny's POS",
    embeds: [embed]
  };

  const response = UrlFetchApp.fetch(webhook, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();

  if (code < 200 || code >= 300) {
    console.error(
      "Discord HTTP " +
      code +
      " : " +
      response.getContentText()
    );

    return false;
  }

  return true;
}

function discordEmbedBase(title, description, color) {
  return {
    title: title,
    description: description,
    color: color || 5793266,
    timestamp: new Date().toISOString(),
    footer: {
      text: "Horny's POS"
    }
  };
}

function discordLogConnexion(vendeur) {
  const embed = discordEmbedBase(
    "Connexion au POS",
    "Un vendeur vient de se connecter au terminal."
  );

  embed.fields = [
    {
      name: "Vendeur",
      value: String(vendeur.nom || "Inconnu"),
      inline: true
    },
    {
      name: "Email",
      value: String(vendeur.email || "Non renseigné"),
      inline: true
    },
    {
      name: "ID",
      value: String(vendeur.id || "Inconnu"),
      inline: true
    },
    {
      name: "Statut",
      value: String(vendeur.statut || "Inconnu"),
      inline: true
    }
  ];

  discordEnvoyerEmbed(embed);
}

function discordLogDeconnexion(vendeur) {
  const embed = discordEmbedBase(
    "Déconnexion du POS",
    "Un vendeur vient de se déconnecter du terminal."
  );

  embed.fields = [
    {
      name: "Vendeur",
      value:
      String(
        vendeur.prenom && vendeur.nom
          ? `${vendeur.prenom} ${vendeur.nom}`
          : vendeur.nom ||
            vendeur.prenom ||
            "Inconnu"
      ),
      inline: true
    },
    {
      name: "Email",
      value: String(vendeur.email || "Non renseigné"),
      inline: true
    },
    {
      name: "ID",
      value: String(vendeur.id || "Inconnu"),
      inline: true
    }
  ];

  discordEnvoyerEmbed(embed);
}

function envoyerLogDiscordVente(data) {
  const embed = discordEmbedBase(
    "Nouvelle vente",
    "Une nouvelle vente vient d'être enregistrée."
  );

  const lignesArticles = (data.articles || [])
    .map(function(item) {
      const nom =
        item.nomComplet ||
        item.article?.nom ||
        "Article inconnu";

      const quantite = Number(item.quantity || 1);

      const prix = Number(
        item.prix ||
        item.article?.prix ||
        0
      );

      return `${quantite} × ${nom} — ${(prix * quantite).toFixed(2)} €`;
    })
    .join("\n");

  const entreprise =
    data.client?.entreprise ||
    data.client?.nom ||
    "Client comptoir";

  const reductionPourcentage =
    Number(data.droitsContrat?.reduction || 0);

  embed.fields = [
    {
      name: "Vente",
      value: "#" + String(data.id),
      inline: true
    },
    {
      name: "Vendeur",
      value:
        String(data.vendeur?.nom || "Inconnu"),
      inline: true
    },
    {
      name: "Paiement",
      value:
        String(data.paiement || "Inconnu"),
      inline: true
    },
    {
      name: "Entreprise / Client",
      value: String(entreprise),
      inline: true
    },
    {
      name: "Réduction contrat",
      value:
        reductionPourcentage > 0
          ? reductionPourcentage + " %"
          : "Aucune",
      inline: true
    },
    {
      name: "Articles",
      value:
        lignesArticles || "Aucun article",
      inline: false
    },
    {
      name: "Sous-total",
      value:
        Number(data.sousTotal || 0).toFixed(2) + " €",
      inline: true
    },
    {
      name: "Réduction",
      value:
        Number(data.reduction || 0).toFixed(2) + " €",
      inline: true
    },
    {
      name: "Total",
      value:
        "**" +
        Number(data.total || 0).toFixed(2) +
        " €**",
      inline: true
    }
  ];

  discordEnvoyerEmbed(embed);
}

function discordLogArdoiseCreation(data) {
  const embed = discordEmbedBase(
    "Nouvelle ardoise",
    "Une nouvelle dette client vient d'être enregistrée."
  );

  embed.fields = [
    {
      name: "Client",
      value:
        String(
          data.client.entreprise ||
          data.client.nom ||
          "Inconnu"
        ),
      inline: true
    },
    {
      name: "Montant",
      value:
        "**" +
        Number(data.montant || 0).toFixed(2) +
        " €**",
      inline: true
    },
    {
      name: "Vendeur",
      value:
        String(data.employe || "Inconnu"),
      inline: true
    },
    {
      name: "ID Ardoise",
      value:
        "#" + String(data.id),
      inline: false
    }
  ];

  discordEnvoyerEmbed(embed);
}

function discordLogArdoiseReglement(data) {
  const embed = discordEmbedBase(
    "Ardoise réglée",
    "Une ardoise client vient d'être réglée."
  );

  embed.fields = [
    {
      name: "Client",
      value:
        String(
          data.client?.entreprise ||
          data.client?.nom ||
          "Inconnu"
        ),
      inline: true
    },
    {
      name: "Montant réglé",
      value:
        "**" +
        Number(data.montant || 0).toFixed(2) +
        " €**",
      inline: true
    },
    {
      name: "ID Ardoise",
      value:
        "#" + String(data.id),
      inline: true
    }
  ];

  discordEnvoyerEmbed(embed);
}

function discordLogTentativeConnexionEchouee() {
  const embed = discordEmbedBase(
    "Tentative de connexion échouée",
    "Un code d'accès incorrect a été saisi sur le POS."
  );

  embed.fields = [
    {
      name: "Statut",
      value: "Code d'accès incorrect",
      inline: true
    },
    {
      name: "Terminal",
      value: "Horny's POS",
      inline: true
    }
  ];

  discordEnvoyerEmbed(embed);
}