//Czekamy aż załaduje się strona, jeśli się załaduje uruchamiamy to co jest w środku
document.addEventListener('DOMContentLoaded', (event) =>{
    //znalezienie obiektu mapy w Leaflet (folium wykorzystuje Leaflet)
    var map = Object.values(window).find(obj => obj instanceof L.Map);

    if (map) {
        console.log("Mamy użytkownika, pozyskujemy ich dane")

        var points = [];
        var tempMarkers = [];
        var currentRoute = null;
        var startMarker = null;
        var endMarker = null;

        //Obsługa kliknięcia (e zawiera informacje o współrzędnych zatem
        map.on('click', function(e) {
            //Utworzenie punktu na podstawie funkcji Leafletowych
            var latlon = [e.latlng.lat, e.latlng.lng];
            points.push(latlon);
            //Utworzenie markera w celu pokazania gdzie klikneliśmy
            var marker = L.marker(latlon).addTo(map);
            tempMarkers.push(marker);

            console.log("Pumkcik: ", latlon);
            if (points.length === 2) {
                console.log("2 punkty")
                //Gdy mamy 2 punkty wysyłamy dane do funkcji liczącej trasę
                fetch('/calculate', {
                    method: 'POST', //typ POST - wysyłanie danych
                    headers: {'Content-Type': 'application/json'}, // określenie typu JSON
                    //Zmiana obiektu JSON na tekst
                    body: JSON.stringify({
                        point1: points[0],
                        point2: points[1]
                    })
                })
                    .then(response => response.json()) //Gdy odbierze odpowiedz konwertuje na typ JSON
                    .then(data => { //Obsługa odebranych danych
                        console.log("Trasa:", data.route);
                        //Usunięcie pozostałości (wcześniejszych tras)
                        if (currentRoute) {
                            map.removeLayer(currentRoute);}
                        if (startMarker) {
                            map.removeLayer(startMarker);}
                        if (endMarker) {
                            map.removeLayer(endMarker);}
                        // Dodanie drogi na mapie
                        currentRoute = L.polyline(data.route, {color: 'red'}).addTo(map);
                        //utworzenie ikony markera dla początka i końca drogi
                        var startIcon = L.AwesomeMarkers.icon({
                        icon: 'flag',
                        prefix: 'fa',
                        markerColor: 'black'});

                        var endIcon = L.AwesomeMarkers.icon({
                        icon: 'flag',
                        prefix: 'fa',
                        markerColor: 'blue'});
                        //Dodanie markerów na mapę
                        startMarker = L.marker(data.start_marker, {icon: startIcon}).addTo(map);
                        endMarker = L.marker(data.end_marker, {icon: endIcon}).addTo(map);
                        //Czyszczenie
                        points = [];
                        tempMarkers.forEach(m => map.removeLayer(m));
                        tempMarkers = [];
                    })
                    .catch(error => {
                        console.error('Błąd:', error);
                        //Czyszczenie w przypadku błędu
                        points = [];
                        tempMarkers.forEach(m => map.removeLayer(m));
                        tempMarkers = [];
                    });
            }
        });
    } else {
        console.error("Użytkownik się nie poddaje. NIE CHCE ODDAĆ DANYCH");
    }
});