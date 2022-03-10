/*
 * Main script, load and draw the GeoJSON features and prepare it interface.
 */
const baseMaps = {
  Grayscale: L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      // minZoom: 8,
      maxZoom: 25,
      id: "mapbox/light-v10",
      tileSize: 512,
      zoomOffset: -1,
      attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    }
  ),
  Satellite: L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      // minZoom: 8,
      maxZoom: 25,
      id: "mapbox/satellite-v9",
      tileSize: 512,
      zoomOffset: -1,
      attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    }
  ),
  Streets: L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      // minZoom: 8,
      maxZoom: 25,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    }
  ),
  "Satellite Streets": L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      // minZoom: 8,
      maxZoom: 25,
      id: "mapbox/satellite-streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    }
  ),
};
const LocationSearch = document.location.search.replace("?", "");
const ghs = LocationSearch || "geohashes";
const orange = chroma("orange").hex();
const colors = chroma.scale("YlGnBu");
const normalize = (val, max, min) => (val - min) / (max - min);
const ghs_prefix_len = 3;

const markers = L.layerGroup();
const mosaicL = L.layerGroup();
const addressesL = L.layerGroup();
const geohashes = new Set();
const overlayMaps = {
  Mosaic: mosaicL,
};

let data,
  minZoom = 10,
  isMosaic = true,
  hasAddresses = false,
  remember = true;

async function loadData(ghs) {
  let path = ghs === "geohashes" ? "geohashes" : `${prefix}_${ghs}`;
  const response = await fetch(`${baseURL + path}.geojson`);
  const geojson = await response.json();
  return geojson;
}

async function setMosaic() {
  data = await loadData("geohashes");
  mosaicLayer = mosaic(data);
  mosaicL.addLayer(mosaicLayer);
  mosaicL.addLayer(markers);
}

async function setAddresses(ghs) {
  if (!geohashes.has(ghs)) {
    row = document.getElementById(ghs);
    data = await loadData(ghs);
    if (!remember_tggl.checked) {
      // addressesL.clearLayers();
      // geohashes.clear();
      // clearSelectedRows();
      clearAddresses();
    }
    geohashes.add(ghs);
    row.setAttribute("class", "selected");
    addressesLayer = addresses(data);
    addressesL.addLayer(addressesLayer);
    recenterMap();
  } else {
    alert(`${ghs} is already plotted`);
  }
}

function ghsList(data) {
  const features = data.features;
  const ghsList_tBody = document.getElementById("ghs_table_body");
  ghsList_tBody.innerHTML = "";
  features.forEach((feature) => {
    let ghs = feature.properties.ghs;
    let ghs_bold =
      ghs.substring(0, ghs_prefix_len) +
      "<b>" +
      ghs.substring(ghs_prefix_len) +
      "</b>";
    ghsList_tBody.innerHTML += `<tr id="${ghs}" onclick='setAddresses("${ghs}");'><td><code>${ghs_bold}</code></td><td>${
      feature.properties.ghs_items
    }</td><td>${Math.round(feature.properties.ghs_itemsdensity)}</td></tr>`;
  });
  new Tablesort(document.getElementById("ghs_table"));
}

function clearSelectedRows() {
  let selected = document.getElementsByClassName("selected");
  for (let i = 0; i < selected.length; i++) {
    selected[i].classList.remove("selected");
  }
}

function clearAddresses() {
  addressesL.clearLayers();
  geohashes.clear();
  clearSelectedRows();
  hasAddresses = false;
}

const mosaic = (data) => {
  isMosaic = true;
  let densities = data.features.map((a) => a.properties.ghs_itemsdensity);
  let max = Math.max(...densities);
  let min = Math.min(...densities);
  return L.geoJSON(data, {
    style: (feature) => ({
      fillColor: colors(
        normalize(Math.round(feature.properties.ghs_itemsdensity), max, min)
      ).hex(),
      color: "#000",
      weight: 0.125,
      fillOpacity: 0.65,
    }),
    onEachFeature: (feature, layer) => {
      let center = layer.getBounds().getCenter();
      let ghs = feature.properties.ghs;
      label = L.marker(center, {
        icon: L.divIcon({
          html: "",
          size: [0, 0],
        }),
      }).bindTooltip(ghs.substring(ghs_prefix_len), {
        permanent: true,
        opacity: 0.7,
        direction: "center",
        className: "label",
      });
      markers.addLayer(label);
      layer
        .bindTooltip(
          `Densidade: <b>${Math.round(
            feature.properties.ghs_itemsdensity
          )} pts/km²</b><br/>Volumetria: <b>${
            feature.properties.ghs_items
          } pts</b><hr/>Clique para ver os pontos<br/>do Geohash <b>${
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
                Math.round(feature.properties.ghs_itemsdensity),
                max,
                min
              )
            ).hex(),
          });
        })
        .on("mouseup", () => {
          setAddresses(ghs).then(function () {});
        });
    },
  });
};


const addresses = (data) => {
  hasAddresses = true;
  return L.geoJSON(data, {

    pointToLayer: (feature,latlng)=> {
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: orange,
        color: "#000",
        weight: 0.15,
        opacity: 1,
        fillOpacity: 0.8,
      })
    }, // \pointToLayer

    onEachFeature: function (feature, layer) {
        layer.bindTooltip(feature.properties.address, {
        opacity: 0.7,
        direction: "top",
        className: "tooltip",
      });
    } // \onEachFeature

  }); // \geoJSON()
}; // \addresses()


window.onload = () => {
  const map = L.map("map", {
    center: [-23.550385, -46.633956],
    zoom: 10,
    layers: [baseMaps.Grayscale, addressesL, mosaicL],
  });

  const layersControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
  const remember_tggl = document.getElementById("remember_tggl");

  remember_tggl.onchange = () => {
    remember = !remember_tggl.checked;
  };

  map.attributionControl.setPrefix(
    '<a title="© tile data" target="_copyr" href="https://www.OSM.org/copyright">OSM</a>'
  ); // no Leaflet advertisement!

  map.on("zoom", function () {
    let currentZoom = map.getZoom();
    if (currentZoom <= 10) {
      if (hasAddresses) {
        clearAddresses();
        if (!map.hasLayer(mosaicL)) { map.addLayer(mosaicL); } // best? into clearAddresses()
      }
      //show mosaic if it is hidden??
      if (currentZoom <= minZoom) {
        recenterMap();
      }
      markers.eachLayer(function (layer) {
        if (layer.isTooltipOpen()) {
          layer.closeTooltip();
        }
      });
    } else {
      if (currentZoom>15 && hasAddresses) {
        map.removeLayer(mosaicL);
      }
      markers.eachLayer(function (layer) {
        if (!layer.isTooltipOpen()) {
          layer.toggleTooltip();
        }
      });
    }
  });

  map.on({
    overlayadd: e=> {
      addressesL.eachLayer(function (layer) {
        layer.bringToFront();
      });
      // if (e.name === 'Mosaic') alert('Mosaic added, z='+map.getZoom());
    }
    // , overlayremove: function(e) {if (e.name === 'Mosaic') alert('Mosaic removed, z='+map.getZoom());}
  });  // \on

  setMosaic().then(function () {
    let bbox = mosaicLayer.getBounds();
    minZoom = map.getZoom() - 2;
    map.fitBounds(bbox);
    map.setMaxBounds(bbox);
    map.options.minZoom = minZoom;
    ghsList(data);
  });

  recenterMap = function () {
    if (hasAddresses) {
      layers = addressesL.getLayers();
      lastAdded = layers[layers.length - 1];
      map.fitBounds(lastAdded.getBounds());
    } else {
      map.fitBounds(mosaicLayer.getBounds());
    }
  };

  // check hasLayer for sync external use.

}; //window onload
