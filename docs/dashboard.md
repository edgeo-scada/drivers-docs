---
slug: /dashboard
sidebar_position: 20
---

# Dashboard

Le dashboard est l'interface principale de visualisation temps réel d'Edgeo. Il permet de créer des écrans personnalisés avec des widgets liés aux tags du système.

## Concepts

- **Dashboard** — Un écran de visualisation contenant des widgets disposés sur une grille
- **Widget** — Un composant visuel lié à un ou plusieurs tags (valeur temps réel, courbe, indicateur, etc.)
- **Layout** — La disposition des widgets sur une grille de 12 colonnes, redimensionnable

## Modes

### Mode Visualisation

Mode par défaut. Les widgets affichent les valeurs en temps réel, les courbes se mettent à jour automatiquement, et les contrôles (switch, power) permettent d'interagir avec les tags.

### Mode Edition

Activable via le bouton crayon. Permet de :

- Ajouter des widgets depuis le menu d'ajout
- Déplacer les widgets par drag & drop (poignée en haut à gauche)
- Redimensionner les widgets (poignée en bas à droite)
- Configurer chaque widget (bouton engrenage)
- Supprimer des widgets

## Grille de layout

Le dashboard utilise une grille CSS de **12 colonnes** avec un espacement de 8px. La hauteur des lignes s'adapte dynamiquement à la taille du conteneur.

Chaque widget est positionné par :

| Propriété | Description |
|-----------|-------------|
| `x` | Position en colonne (0-11) |
| `y` | Position en ligne |
| `w` | Largeur en unités de grille |
| `h` | Hauteur en unités de grille |
| `minW`, `minH` | Dimensions minimales |

## Gestion des dashboards

Plusieurs dashboards peuvent coexister. Un dashboard par défaut est créé automatiquement au premier lancement.

| Action | Description |
|--------|-------------|
| Créer | Nouveau dashboard avec nom et description |
| Editer | Modifier le nom et la description |
| Supprimer | Supprimer un dashboard (au moins un doit rester) |
| Naviguer | Basculer entre les dashboards |

## Plage de temps

Le sélecteur de plage de temps dans l'en-tête du dashboard contrôle les widgets historiques (Historical, Sparkline) :

**Plages rapides :** 5m, 15m, 30m, 1h, 3h, 6h, 12h, 24h, 2d, 7d

**Plage personnalisée :** Sélection libre de date/heure de début et fin

**Rafraîchissement automatique :** Off, 5s, 10s, 30s, 1m, 5m, 15m, 30m, 1h

## Qualité des données

Les widgets affichent la qualité des tags visuellement :

| Qualité | Affichage |
|---------|-----------|
| `GOOD` | Couleur normale |
| `BAD` | Texte rouge, pulsation dans l'en-tête du widget |
| `UNCERTAIN` | Texte jaune |

## Persistance

Les dashboards, widgets et layouts sont persistés dans le localStorage du navigateur. Chaque utilisateur a ses propres dashboards.
