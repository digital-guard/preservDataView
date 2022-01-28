window.onload = () => {
  const LocationSearch = document.location.search.replace("?", "");
  console.log(document.location);
  const ghs = LocationSearch || "geohashes";
  const mapStyle = ghs === "geohashes" ? "light-v10" : "streets-v11";
  const orange = chroma("orange").hex();
  const baseURL =
    "https://raw.githubusercontent.com/digital-guard/preservCutGeo-BR2021/main/data/MG/BeloHorizonte/_pk0008.01/geoaddress/";
  const colors = chroma.scale("YlGnBu");
  const normalize = (val, max, min) => (val - min) / (max - min);
  const ghsList = document.getElementById("geohashes");

  let minZoom = 10;
  let isMosaic = true;
  let dataLayer, label;

  const map = L.map("map").setView([-23.550385, -46.633956], 10);
  map.attributionControl.setPrefix(
    '<a title="© tile data" target="_copyr" href="https://www.OSM.org/copyright">OSM</a>'
  ); // no Leaflet advertisement!

  map.on("zoom", function () {
    if (map.getZoom() <= minZoom && !isMosaic) {
      console.log(minZoom);
      loadGeoJson("geohashes");
    }
  });
  const tiles = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      minZoom: minZoom,
      maxZoom: 25,
      id: `mapbox/${mapStyle}`,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    }
  ).addTo(map);

  const markers = L.layerGroup();
  const loadGeoJson = (ghs) => {
    let path = ghs === "geohashes" ? "geohashes" : `pts_${ghs}`;
    if (dataLayer) {
      if (label) {
        if (map.hasLayer(markers)) {
          markers.clearLayers();
        }
      }
      map.removeLayer(dataLayer);
    }
    fetch(`${baseURL + path}.geojson`)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (ghs === "geohashes") {
          /*****************************************************************************
           * Load Mosaic
           *****************************************************************************/
          let densities = data.features.map((a) =>
            Math.round(a.properties.val_density_km2)
          );
          let max = Math.max(...densities);
          let min = Math.min(...densities);
          ghsList.innerHTML = "";
          dataLayer = L.geoJSON(data, {
            style: (feature) => ({
              fillColor: colors(
                normalize(
                  Math.round(feature.properties.val_density_km2),
                  max,
                  min
                )
              ).hex(),
              color: "#000",
              weight: 0.125,
              fillOpacity: 0.65,
            }),
            onEachFeature: (feature, layer) => {
              let center = layer.getBounds().getCenter();
              let ghs = feature.properties.ghs;
              let li = document.createElement("li");
              li.innerHTML = `<a href="?${ghs}">${ghs}</a>`;
              ghsList.appendChild(li);

              label = L.marker(center, {
                icon: L.divIcon({
                  html: "",
                  iconSize: [0, 0],
                }),
              }).bindTooltip(ghs.substring(3), {
                permanent: true,
                opacity: 0.7,
                direction: "center",
                className: "label",
              });
              markers.addLayer(label);
              layer
                .bindTooltip(
                  `Densidade: <b>${Math.round(
                    feature.properties.val_density_km2
                  )} pts/km²</b><br/>Volumetria: <b>${
                    feature.properties.val
                  } pts</b><br/>... Clique para ver os pontos<br/>do Geohash <b>${
                    feature.properties.ghs
                  }</b>`,
                  {
                    sticky: true,
                    opacity: 0.7,
                    direction: "top",
                    className: "tooltip",
                  }
                )
                .on("mouseover", () => {
                  layer.setStyle({
                    fillColor: "#ffa500",
                  });
                })
                .on("mouseout", () => {
                  layer.setStyle({
                    fillColor: colors(
                      normalize(
                        Math.round(feature.properties.val_density_km2),
                        max,
                        min
                      )
                    ).hex(),
                  });
                })
                .on("mouseup", () => {
                  // window.location.href = `?${ghs}`;
                  loadGeoJson(ghs);
                });
            },
          });
          map.addLayer(markers);
        } else {
          /*****************************************************************************
           * Load Points
           *****************************************************************************/
          isMosaic = false;
          ghsList.innerHTML = `<li><a href="${document.location.origin}${document.location.pathname}">Back to Mosaic</a></li>`;
          dataLayer = L.geoJSON(data, {
            // onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, {
                radius: 4,
                fillColor: orange,
                color: "#000",
                weight: 0.15,
                opacity: 1,
                fillOpacity: 0.8,
              }).bindTooltip(feature.properties.address, {
                opacity: 0.7,
                direction: "top",
                className: "tooltip",
              });
            },
          });
        }
        dataLayer.addTo(map);
        map.fitBounds(dataLayer.getBounds());
        // map.setMaxBounds(map.getBounds());
        minZoom = map.getZoom() - 2;
        map.options.minZoom = minZoom;
      });
  };
  loadGeoJson(ghs);
}; //window onload
