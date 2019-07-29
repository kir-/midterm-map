$(() => {
  const loadMap = function(location, element) {
    let newMap = new google.maps.Map(element, {
      center: location,
      zoom: 16
    });
    new google.maps.Marker({
      position: location,
      map: newMap,
      title: 'Hello World!'
    });
  };

  const getGeolocation = function(callback) {
    $.ajax({
      method:'POST',
      url:'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM'
    }).done((location) => {
      callback(location.location)
    })
  }

  $showGeolocation = $('#showGeolocation');
  $showGeolocation.on('click', (event) => {
    event.preventDefault();
    getGeolocation((location) => {
      $(`<div>${'lat: ' + location.lat + ',' + 'lng: ' + location.lng}</div>`).appendTo('#toShowLoc')
    })
  })

  

  $showmap = $('#showmap');
  $showmap.on('click', (even) => {
    const mapElement = $('.map')[0];
    let myloc;
    // {lat: 49.2807762, lng: -123.022516000000}

    getGeolocation((location)=>{
      loadMap(location,mapElement);
    })
  })

})
