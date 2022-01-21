window.onload = () => {
  const log = true;
  const pointZero = {
    type: "Point",
    coordinates: [0, 0],
  };
  const orange = chroma("orange").hex();
  // const baseURL = "https://raw.githubusercontent.com/elpbatista/afa-preserv/main/";
  const baseURL =
    "https://raw.githubusercontent.com/digital-guard/preservCutGeo-BR2021/main/data/MG/BeloHorizonte/_pk0008.01/geoaddress/";
  const colors = chroma.scale("YlGnBu");
  const normalize = (val, max, min) => (val - min) / (max - min);
  const addPoints = (ghs) =>
    fetch(`${baseURL}pts_${ghs}.geojson`).then(function (response) {
      return response.json();
    }).then(function (data) {
      var addresses = L.geoJSON(data, {
        // onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 3,
            fillColor: orange,
            color: "#000",
            weight: .15,
            opacity: 1,
            fillOpacity: 0.8,
          });
        },
      }).addTo(map);
    });
  
  const tiles = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      // maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }
  );
  const map = L.map("map", {
    layers: [tiles],
    center: L.LatLng(-23.550385, -46.633956),
    zoom: 10,
  });

  fetch(`${baseURL}geohahes.geojson`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let densities = data.features.map((a) => Math.round(a.properties.val_density_km2));
      let max = Math.max(...densities);
      let min = Math.min(...densities);

      // +++++++++++++++++++++++++++++++++++++++++++++++++++
      if (log) {
        console.log(chroma.brewer.YlGnBu); //9  colors
        console.log(densities);
        console.log(
          colors(
            normalize(
              Math.round(data.features[2].properties.val_density_km2),
              max,
              min
            )
          ).hex()
        );
        console.log(min);
        console.log(max);
        console.log(normalize(300, max, min));
        console.log(Math.round(data.features[2].properties.val_density_km2));
        console.log(chroma("orange").hex());
      }
      // +++++++++++++++++++++++++++++++++++++++++++++++++++
      geohashes = L.geoJSON(data, {
        style: (feature) => ({
          fillColor: colors(
            normalize(Math.round(feature.properties.val_density_km2), max, min)
          ).hex(),
          color: "#000",
          weight: 0.125,
          fillOpacity: 0.65,
        }),
        onEachFeature: (feature, layer) => {
          let center = layer.getBounds().getCenter();
          let label = L.marker(center, {
            icon: L.divIcon({
              html: "",
              iconSize: [0, 0],
            }),
          })
            .bindTooltip(feature.properties.ghs.substring(3), {
              permanent: true,
              opacity: 0.7,
              direction: "center",
              className: "label",
            })
            .addTo(map);
          layer
            .bindTooltip(`Clique para ver os pontos<br/>do Geohash <b>${feature.properties.ghs}</b>`, {
              sticky: true,
              opacity: 0.7,
              direction: "top",
              className: "tooltip",
            })
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
              map.setView(center, 18);
              addPoints(feature.properties.ghs);
            });
        },
      }).addTo(map);
      map.fitBounds(geohashes.getBounds());
    });
}; //window onload
