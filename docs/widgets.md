---
slug: /widgets
sidebar_position: 21
---

# Widgets

Les widgets sont les composants visuels du dashboard. Chaque widget est lié à un tag et affiche sa valeur en temps réel via WebSocket.

## Types de widgets

### Realtime

Affichage simple de la valeur courante d'un tag avec indicateur de qualité.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 6 x 2 |
| Types de tags | Tous |
| Écriture | Non |

### Historical

Courbe historique (LineChart) affichant l'évolution d'un tag sur la plage de temps sélectionnée.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 12 x 4 |
| Types de tags | int, float |
| Données | Historian (requête API) |

Caractéristiques :
- Axes X (temps) et Y (valeur) avec grille
- Tooltip avec horodatage, valeur et qualité
- Couleur de la courbe selon la qualité (bleu = GOOD, orange = UNCERTAIN, rouge = BAD)
- Padding automatique sur l'axe Y

### Sparkline

Courbe compacte (AreaChart) avec la valeur numérique superposée et unité optionnelle.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 2 |
| Types de tags | int, float |
| Données | Historian |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `color` | Couleur de la courbe |
| `showValue` | Afficher la valeur numérique |
| `decimals` | Nombre de décimales |
| `unit` | Unité affichée (ex: °C, bar) |
| `historyPoints` | Nombre de points historiques |

### Switch

Interrupteur toggle pour les tags booléens. Permet la lecture et l'écriture de valeurs.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 2 |
| Types de tags | bool |
| Écriture | Oui |

### Power

Bouton circulaire on/off pour les tags booléens. Style bouton poussoir.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 2 |
| Types de tags | bool |
| Écriture | Oui |

### State Indicator

Affichage multi-états avec badges colorés. Chaque état est défini par une valeur, un libellé et une couleur.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 6 x 2 |
| Types de tags | Tous |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `states` | Liste d'états : `{ value, label, color }` |
| `defaultState` | État par défaut si aucune correspondance |

Exemple de configuration :
```json
{
  "states": [
    { "value": "0", "label": "Arrêté", "color": "#ef4444" },
    { "value": "1", "label": "En marche", "color": "#22c55e" },
    { "value": "2", "label": "Défaut", "color": "#f59e0b" }
  ]
}
```

### Bit Indicator

Affichage bit par bit d'une valeur entière (16 ou 32 bits). Chaque bit est affiché individuellement avec son état on/off.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 2 |
| Types de tags | int |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `lsbFirst` | Ordre des bits (LSB ou MSB en premier) |
| `byteSpacing` | Espacement visuel entre octets |

### Progress Bar

Barre de progression avec min/max configurables.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 2 |
| Types de tags | int, float |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `min` | Valeur minimale de l'échelle |
| `max` | Valeur maximale de l'échelle |
| `color` | Couleur de la barre |
| `showValue` | Afficher la valeur numérique |
| `showPercentage` | Afficher le pourcentage |

### IP Camera

Flux MJPEG ou image statique avec rafraîchissement automatique.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 4 x 3 |
| Types de tags | — (pas de tag) |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `url` | URL du flux MJPEG ou de l'image |
| `name` | Nom de la caméra |
| `aspectRatio` | Ratio d'affichage : `16:9`, `4:3`, `1:1` |
| `refreshInterval` | Intervalle de rafraîchissement en ms |

### SVG Graphic

Synoptique SVG avec liaison de données en temps réel. Les éléments SVG sont liés à des tags et mis à jour dynamiquement.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 6 x 4 |
| Types de tags | Multiples (via bindings) |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `graphicId` | ID du graphique SVG (depuis l'API Graphics) |
| `backgroundColor` | Couleur de fond |
| `svgFit` | Mode d'ajustement : `contain`, `cover`, `fill`, `none` |

#### Propriétés SVG liables

Les éléments SVG identifiés par `data-element-id` peuvent être liés aux tags sur les propriétés suivantes :

| Propriété | Description |
|-----------|-------------|
| `fill` | Couleur de remplissage |
| `stroke` | Couleur de contour |
| `opacity` | Opacité (0-1) |
| `visible` | Visibilité |
| `text` | Contenu texte |
| `rotation` | Rotation en degrés |
| `scaleX` / `scaleY` | Échelle |
| `translateX` / `translateY` | Translation |

#### Types d'expressions

| Type | Description | Exemple |
|------|-------------|---------|
| `direct` | Valeur directe | `value` |
| `conditional` | Condition ternaire | `value > 50 ? '#ff0000' : '#00ff00'` |
| `range` | Plages de valeurs | `0-50 → vert, 50-100 → rouge` |
| `formula` | Expression mathématique | `value * 3.6`, `100 - value` |

#### Qualité dans les SVG

| Paramètre | Description |
|-----------|-------------|
| `showBadQualityOverlay` | Afficher un overlay pour la mauvaise qualité |
| `badQualityColor` | Couleur de l'overlay (défaut : rouge) |
| `badQualityOpacity` | Opacité de l'overlay |

Les éléments en qualité BAD sont affichés en niveaux de gris avec opacité réduite.

### Group

Conteneur pour organiser des widgets enfants. Permet de regrouper des widgets liés dans une section repliable.

| Propriété | Valeur |
|-----------|--------|
| Taille par défaut | 6 x 3 |
| Types de tags | — (conteneur) |
| Écriture | Non |

Configuration :

| Paramètre | Description |
|-----------|-------------|
| `title` | Titre du groupe |
| `collapsed` | État replié/déplié |
| `direction` | Disposition : `horizontal` ou `vertical` |
| `childIds` | IDs des widgets enfants |
| `expandedHeight` | Hauteur en mode déplié |

Les widgets peuvent être glissés dans un groupe en mode édition. Les widgets enfants sont rendus à l'intérieur du groupe et non dans la grille principale.

## Tailles par défaut

| Widget | Largeur | Hauteur |
|--------|---------|---------|
| Realtime | 6 | 2 |
| Historical | 12 | 4 |
| Sparkline | 4 | 2 |
| Switch | 4 | 2 |
| Power | 4 | 2 |
| State Indicator | 6 | 2 |
| Bit Indicator | 4 | 2 |
| Progress Bar | 4 | 2 |
| IP Camera | 4 | 3 |
| SVG Graphic | 6 | 4 |
| Group | 6 | 3 |
