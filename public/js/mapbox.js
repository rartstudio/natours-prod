

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVkaWFucCIsImEiOiJja2l1OHBkaHQyeHljMzFxajVoZzR2ejM2In0.JMWaCqKMaNvrASHDORk4Sw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/rudianp/ckiu8tdv92nm519rpd8iri3kb',
        scrollZoom: false
        // center: [-118.113492,34.111745],
        // zoom: 4
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
        //create marker
        const el = document.createElement('div');
        el.className = 'marker';
    
        //add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
            //loc.coordinates is object we our loop in our data
        }).setLngLat(loc.coordinates).addTo(map)
    
        //add popup
        new mapboxgl.Popup({
            //options to style information
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);
    
        //extends map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}
