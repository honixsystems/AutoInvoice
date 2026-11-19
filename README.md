# AutoInvoice

AutoInvoice est un logiciel de facturation de bureau pour les professionnels de l'automobile : factures de vente et de transport de véhicules, gestion des clients et des services, export PDF et CSV.

L'application fonctionne entièrement en local : aucun compte, aucune activation, aucune connexion à un serveur n'est nécessaire. Les données (clients, factures, paramètres) restent sur la machine.

## Téléchargement

Les installeurs sont publiés sur la page [Releases](https://github.com/honixsystems/AutoInvoice/releases/latest).

- **Windows** : `AutoInvoice_<version>_x64-setup.exe` (ou `AutoInvoice_<version>_x64_en-US.msi`)

Une fois installée, l'application se met à jour automatiquement à partir des releases GitHub.

## Développement

Prérequis : Node.js (voir `.nvmrc`), pnpm 10, Rust stable et les [dépendances système de Tauri 2](https://v2.tauri.app/start/prerequisites/).

```bash
pnpm install
pnpm tauri:dev     # lance l'application en mode développement
pnpm tauri:build   # construit les installeurs dans src-tauri/target/release/bundle
```

Stack : [Tauri 2](https://v2.tauri.app/) (Rust), [Nuxt 3](https://nuxt.com/) + [Nuxt UI](https://ui.nuxt.com/), SQLite et [Typst](https://typst.app/) pour la génération des PDF.

## Publier une version

1. Incrémenter la version (`pnpm bump`, qui met à jour `package.json`, `src-tauri/tauri.conf.json` et `src-tauri/Cargo.toml`).
2. Ajouter une section `## [x.y.z] - AAAA-MM-JJ` dans `CHANGELOG.md` : elle devient le texte de la release.
3. Pousser sur `main`. Le workflow `release` construit l'application, la signe pour l'auto-update et publie la release `autoinvoice-vx.y.z` avec son `latest.json`.

Les secrets `TAURI_SIGNING_PRIVATE_KEY` et `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` doivent être configurés dans le dépôt. Ils signent les mises à jour, et l'application refuse toute mise à jour qui ne porte pas cette signature.

## Licence

[MIT](LICENSE)
