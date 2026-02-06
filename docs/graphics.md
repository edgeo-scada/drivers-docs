---
slug: /graphics
sidebar_position: 11
---

# SVG Graphics

Edgeo supports synoptic graphics — SVG diagrams with dynamic elements bound to tag values. This allows you to create process visualizations that update in real time.

## How It Works

1. Upload or create an SVG graphic
2. Define bindings between SVG element IDs and tag paths
3. The frontend renders the SVG and applies live tag values to bound elements

## Creating a Graphic

```json
POST /api/graphics
{
  "name": "Process Overview",
  "description": "Main production line synoptic",
  "width": 1200,
  "height": 800,
  "svg_content": "<svg>...</svg>",
  "bindings": [
    {
      "element_id": "temp-display",
      "tag_path": "Line1/Reactor/Temperature",
      "property": "text",
      "expression": "{value} °C"
    },
    {
      "element_id": "pump-indicator",
      "tag_path": "Line1/Pump/Running",
      "property": "fill",
      "expression": "{value} ? '#00ff00' : '#ff0000'"
    }
  ]
}
```

## Bindings

Each binding maps an SVG element to a tag value:

| Field | Description |
|-------|-------------|
| `element_id` | SVG element `id` attribute |
| `tag_path` | Tag path within a provider |
| `property` | SVG property to update (`text`, `fill`, `stroke`, `opacity`, etc.) |
| `expression` | Expression to transform the tag value |

## Importing SVG

Upload an existing SVG file:

```
POST /api/graphics/:id/import
Content-Type: multipart/form-data

file: process-diagram.svg
```

## Exporting SVG

Download the SVG content:

```
GET /api/graphics/:id/export
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/graphics` | List graphics |
| `POST /api/graphics` | Create graphic |
| `GET /api/graphics/:id` | Get graphic |
| `PUT /api/graphics/:id` | Update graphic |
| `DELETE /api/graphics/:id` | Delete graphic |
| `POST /api/graphics/:id/import` | Import SVG file |
| `GET /api/graphics/:id/export` | Export as SVG |
