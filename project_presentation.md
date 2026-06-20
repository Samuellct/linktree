# Présentation du Projet - Agrégateur de Liens (Linktree)

Ce document présente l'état d'avancement, les choix techniques et la direction artistique actuelle du projet pour servir de base de réflexion et d'idéation design.

* **Dépôt GitHub du Projet :** [https://github.com/Samuellct/linktree](https://github.com/Samuellct/linktree)

---

## 1. Objectif du Projet

L'objectif est de créer un **agrégateur de liens personnel** (similaire à Linktree ou Linkinbio) auto-hébergé, ultra-rapide, respectueux de la vie privée, et doté d'une identité visuelle forte. 

Contrairement aux solutions commerciales saturées de publicités et de designs génériques, ce projet vise :
* **L'indépendance technologique** (hébergé sur Cloudflare Pages à coût nul, avec base de données SQLite D1).
* **Une esthétique soignée et haut de gamme**, s'éloignant des codes du SaaS standard.
* **Le contrôle des données** via un système de statistiques interne et une intégration Umami Analytics contournant les bloqueurs de publicité.

---

## 2. Direction Artistique Actuelle : "Galerie Éditoriale"

L'interface actuelle a été refondue selon le style **Galerie Éditoriale** (inspiré de la presse littéraire, des portfolios d'art contemporain et du minimalisme architectural).

### Principes Visuels Fondamentaux
* **Palette Chromatique :** Strictement monochrome et bicolore. Fond blanc pur pour le mode clair, noir/ardoise très sombre (`#0b0f19` ou noir pur) pour le mode sombre. Aucun dégradé coloré ni couleur d'accent vive (sauf configuration utilisateur spécifique sur un lien).
* **Typographie :**
  * **Titres :** *Playfair Display* (Serif à fort contraste, élégant et littéraire).
  * **Corps de texte & Descriptions :** *Lora* (Serif très lisible, style livre/journal).
  * **Métadonnées / Boutons :** Sans-serif fine ou police monospace technique (`font-mono`) pour les petits détails.
* **Absence d'arrondis (`rounded-none`) :** Tous les angles sont bruts (90°). Aucune boîte arrondie, aucun bouton ovale. Tout est rectiligne.
* **Bordures :** Fines lignes de `1px` (`border-current/15` ou `border-slate-800`), sans ombres portées diffuses (`shadow-none`) ni effets de flou de verre (glassmorphism).
* **Micro-animations (Framer Motion) :** Très légères et fluides. Par exemple, au survol d'un lien sur ordinateur, un aperçu visuel du site cible glisse discrètement vers le haut dans un cadre minimaliste.

---

## 3. Fonctionnalités Clés

Le projet se compose de deux espaces distincts :

### A. La Landing Page Publique (`/`)
* **Header de Profil :** Avatar carré noir et blanc, nom et courte biographie dans un style typographique épuré.
* **Barre de Réseaux Sociaux :** Liens discrets en haut de page séparés par des puces, avec suivi analytique.
* **Liste de Liens Dynamiques :** Chaque lien est représenté sous forme de carte à bordure fine. Au survol, il révèle un aperçu miniature de l'image liée.
* **Redirection & Comptage :** Le clic transite par une API interne (`/api/click`) pour enregistrer la statistique de clic de manière anonymisée avant de rediriger l'utilisateur vers sa destination.

### B. L'Espace d'Administration (`/admin/*`)
* **Authentification sécurisée :** Page de connexion épurée et sécurisée.
* **Tableau de Bord (`/admin/dashboard`) :**
  * Statistiques de visites et de clics globales.
  * Graphique d'évolution temporel minimaliste (SVG à lignes fines, sans remplissage flashy).
  * Classement des pays d'origine, des navigateurs et des appareils utilisés.
  * Liste des liens les plus cliqués.
* **Éditeur de Liens (`/admin/links`) :**
  * Ajouter, modifier, réordonner (par glisser-déposer) et désactiver des liens.
  * Associer un titre, une description, une icône Lucide, une image d'aperçu et une couleur de bordure personnalisée.
* **Éditeur de Configuration (`/admin/settings`) :**
  * Modification de l'avatar, du titre du site, de la biographie et des balises SEO (titre, description, Open Graph).
  * Activation/désactivation des micro-animations de l'interface.
  * Renseignement de l'ID de suivi Umami.

---

## 4. Architecture Technique & Performance

Pour un designer, les performances techniques dictent les limites créatives. Voici les détails de l'infrastructure :

* **Framework :** [Astro](https://astro.build/) (génération orientée performance, avec hydratation partielle des composants interactifs).
* **Librairie Interactive :** React pour l'espace d'administration et les composants animés de la Landing Page (avec `framer-motion`).
* **Base de Données :** Cloudflare D1 (Base SQLite distribuée en périphérie/edge de réseau).
* **Hébergement :** Cloudflare Pages (temps de chargement sous la barre des 200ms à travers le monde).
* **Solution d'Analytics Hybride :**
  * **Base locale :** Stockage simplifié des clics et pays dans D1 pour le dashboard admin.
  * **Umami Analytics :** Intégration avancée configurée avec un **proxy inverse local** (`/stats.js` et `/api/send`) qui redirige les requêtes de télémétrie. Cela permet de contourner les ad-blockers tout en préservant le RGPD.

---

## 5. Pistes de Réflexion Design (Pour le Designer)

Pour aider à affiner ou repenser l'expérience utilisateur, voici quelques axes de travail possibles :

1. **La mise en page des cartes de liens :** Actuellement présentées sous forme de liste verticale classique. Peut-on imaginer un agencement asymétrique, façon grille de magazine ou colonne de texte éditoriale ?
2. **Le comportement des aperçus d'images :** Actuellement, l'image d'aperçu apparaît au survol dans une infobulle flottante. Comment intégrer cette image de manière plus organique dans une grille typographique ?
3. **Le responsive mobile :** L'interface doit conserver son aspect "papier d'art" sur tous les ratios d'écran. Comment adapter les grands titres Serif sur mobile sans casser l'équilibre des blancs ?
4. **L'expérience de la zone d'administration :** Comment rendre la gestion des liens plus fluide visuellement tout en gardant cette charte noire et blanche stricte (notamment pour le glisser-déposer des cartes) ?
