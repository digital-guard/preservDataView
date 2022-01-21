# preservDataViz

[Data Visualization](https://en.wikipedia.org/wiki/Data_visualization) tools for Preserv and preserv-country projects.

## Source code

Tools using "HTML + CSS + Javascript" standards and infraestructure.

* `/src`  General
* `/src/preservCutGeo`  Map visualization, CSV and GeoJSON data.
* `/src/preservLexGeo`  Law adn Government gazette data visualization

## Data

Direct and transparent, the data consumed by tools comes from all official `Digital-guard.org`'s gits: [preserv/data](http://git.digital-guard.org/preserv/tree/main/data), [preserv-BR/data](http://git.digital-guard.org/preserv-BR/tree/main/data), [preserv-CO/data](http://git.digital-guard.org/preserv-CO/tree/main/data), [preservCutGeo-BR2021/data](http://git.digital-guard.org/preservCutGeo-BR2021/data), etc.

## Tests and drafts

The sources will be used in the official `Digital-guard.org` site, but some tests can be performed directelly here, using Github's `https://digital-guard.github.io/preservDataViz/` and root `index.html`. Other HTML at `/tests/*.html`, and the assets are direct `/src` references; or extra files, images anb CSS at `/tests/assets`.

### Test 1: Using Leaflet for Data Visualization

See deplpyment [here](https://digital-guard.github.io/preservDataViz/src/preservCutGeo/)
