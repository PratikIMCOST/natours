/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoicHJhdGlrMTk5IiwiYSI6ImNtODlxaXo2bDE5MXgyanM4d3EzeDgwZ3UifQ.iwV8AAwDufeF_4iLfjNR1A';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/pratik199/cm89tzw6p00ew01sa9yu55i21', // style URL
    scrollZoom: false,
    //   center: [-74.5, 40], // starting position [lng, lat]
    //   zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create market
    const marker = document.createElement('div');
    marker.className = 'marker';

    //   add Marker
    new mapboxgl.Marker({
      el: marker,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({ offset: 40 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends map bounds to inclued bounds
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
