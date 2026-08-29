# HORNYS-POS V3 — findings de sécurité

## Critique

### Webhook Discord présent dans le code source
Le code historique contient une URL de webhook Discord directement dans `Code.js` via les paramètres par défaut. Cette valeur doit être considérée comme compromise dès lors que le dépôt est accessible à plusieurs personnes.

**Action recommandée :** révoquer/régénérer immédiatement le webhook concerné, puis stocker le nouveau secret dans `PropertiesService.getScriptProperties()` ou dans un mécanisme de secrets externe. Ne jamais remettre le secret dans Git.

## Important

### Confiance excessive dans `vendeurId`
Plusieurs fonctions serveur historiques prennent `vendeurId` en argument et vérifient ensuite le rôle correspondant. Cela permet au client de tenter de se présenter comme un autre vendeur si l'identifiant est connu.

La branche V3 introduit `SessionService.gs` pour permettre une migration vers un jeton serveur temporaire. Les fonctions sensibles devront être migrées progressivement vers `verifierSessionVendeur(token, feature)`.

### Double soumission
Le flux historique utilise déjà `LockService` dans `enregistrerVenteFormule`, ce qui protège les écritures concurrentes, mais ne fournit pas une vraie clé d'idempotence de requête. V3 ajoute `Idempotency.gs` et `TransactionService.gs` pour empêcher la répétition d'une même opération côté serveur.

## Architecture

La BDD Google Sheets reste compatible avec le fonctionnement actuel. V3 ajoute une couche d'accès et de validation sans modifier immédiatement les onglets existants, afin de permettre une migration progressive et réversible.
