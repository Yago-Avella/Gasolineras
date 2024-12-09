const API_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
let mapa; // Variable global para el mapa
let usuarioLatitud, usuarioLongitud; // Guardar ubicación del usuario

// Inicialización del mapa
function inicializarMapa() {
    if (!mapa) {
        mapa = L.map('mapa', {
            center: [40.416775, -3.703790], // Coordenadas iniciales (Madrid)
            zoom: 6,
            scrollWheelZoom: true,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap',
        }).addTo(mapa);
    }
}

// Función para calcular la distancia entre dos puntos geográficos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna la distancia en kilómetros
}

// Función principal para buscar gasolineras
function buscarGasolinerasCercanas() {
    inicializarMapa();

    const rango = parseInt(document.getElementById('rango').value, 10);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            usuarioLatitud = latitude;
            usuarioLongitud = longitude;
            mapa.setView([latitude, longitude], 13);

            // Marcador del usuario (con una flecha)
            const marcadorUsuario = L.marker([latitude, longitude], {
                title: 'Tu ubicación',
                icon: L.icon({
                    iconUrl: 'https://example.com/user-arrow.png', // Reemplaza con la URL de tu icono de flecha
                    iconSize: [32, 32], // Tamaño del icono
                    iconAnchor: [16, 32], // Ajustar anclaje al centro de la base de la flecha
                    popupAnchor: [0, -32], // Ajustar la posición del popup
                }),
            }).addTo(mapa);

            fetch(API_URL)
                .then((response) => response.json())
                .then((data) => {
                    const estaciones = data.ListaEESSPrecio.filter((estacion) => {
                        const lat = parseFloat(estacion.Latitud.replace(',', '.'));
                        const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));
                        const precioGasoleo = parseFloat(estacion['Precio Gasoleo A']?.replace(',', '.'));
                        const precioGasolina = parseFloat(estacion['Precio Gasolina 95 E5']?.replace(',', '.'));

                        if (!lat || !lon || isNaN(precioGasoleo) || isNaN(precioGasolina)) {
                            return false; // Excluir estaciones sin datos válidos
                        }

                        const distancia = calcularDistancia(latitude, longitude, lat, lon);
                        return distancia <= rango; // Solo estaciones dentro del rango
                    });

                    // Ordenar las estaciones por rentabilidad (distancia y precio)
                    const estacionesOrdenadas = estaciones.map((estacion) => {
                        const lat = parseFloat(estacion.Latitud.replace(',', '.'));
                        const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));
                        const precioGasoleo = parseFloat(estacion['Precio Gasoleo A']?.replace(',', '.'));
                        const precioGasolina = parseFloat(estacion['Precio Gasolina 95 E5']?.replace(',', '.'));
                        const distancia = calcularDistancia(latitude, longitude, lat, lon);

                        return {
                            ...estacion,
                            distancia,
                            precioGasoleo,
                            precioGasolina,
                            rentabilidad: (distancia + Math.min(precioGasoleo, precioGasolina)) / 2, // Media entre distancia y precio
                        };
                    });

                    mostrarResultados(estacionesOrdenadas);
                });
        },
        () => {
            alert('No se pudo obtener tu ubicación.');
        }
    );
}

// Función para mostrar los resultados en las tablas
function mostrarResultados(estaciones) {
    const tablaPrecio = document.getElementById('tablaPrecio').querySelector('.gasolinera');
    const tablaDistancia = document.getElementById('tablaDistancia').querySelector('.gasolinera');
    const tablaDistanciaPrecio = document.getElementById('tablaDistanciaPrecio').querySelector('.gasolinera');

    tablaPrecio.innerHTML = '';
    tablaDistancia.innerHTML = '';
    tablaDistanciaPrecio.innerHTML = '';

    // Ordenar las estaciones según el criterio adecuado para cada tabla
    const estacionesOrdenadasPorPrecio = [...estaciones].sort((a, b) => {
        return Math.min(a.precioGasoleo, a.precioGasolina) - Math.min(b.precioGasoleo, b.precioGasolina);
    });

    const estacionesOrdenadasPorDistancia = [...estaciones].sort((a, b) => {
        return a.distancia - b.distancia;
    });

    const estacionesOrdenadasPorDistanciaPrecio = [...estaciones].sort((a, b) => {
        return a.rentabilidad - b.rentabilidad;
    });

    // Función para agregar estaciones a la tabla
    function agregarEstaciones(tabla, estacionesOrdenadas) {
        estacionesOrdenadas.forEach((estacion) => {
            const lat = parseFloat(estacion.Latitud.replace(',', '.'));
            const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));
            const precioGasoleo = parseFloat(estacion['Precio Gasoleo A']?.replace(',', '.'));
            const precioGasolina = parseFloat(estacion['Precio Gasolina 95 E5']?.replace(',', '.'));
            const distancia = estacion.distancia.toFixed(2);

            const precio = Math.min(precioGasoleo, precioGasolina).toFixed(2);
            const tipoGasolina = precioGasoleo < precioGasolina ? 'Gasóleo A' : 'Gasolina 95 E5';
            const enlaceGoogleMaps = `https://www.google.com/maps?saddr=${usuarioLatitud},${usuarioLongitud}&daddr=${lat},${lon}&directionsmode=driving`;

            // Agregar marcador de gasolinera en el mapa
            L.marker([lat, lon]).addTo(mapa)
                .bindPopup(`
                    <b>${estacion.Dirección}</b><br>
                    Precio: ${precio} €/L<br>
                    Tipo: ${tipoGasolina}<br>
                    Distancia: ${distancia} km
                `);

            tabla.innerHTML += `
                <div class="recuadro-gasolineras">
                    <p><strong>Dirección:</strong> ${estacion.Dirección}</p>
                    <p><strong>Precio:</strong> ${precio} €/L</p>
                    <p><strong>Tipo:</strong> ${tipoGasolina}</p>
                    <p><strong>Distancia:</strong> ${distancia} km</p>
                    <button onclick="window.open('${enlaceGoogleMaps}', '_blank')">Ver en Google Maps</button>
                </div>
            `;
        });
    }

    // Mostrar las estaciones ordenadas en cada tabla
    agregarEstaciones(tablaPrecio, estacionesOrdenadasPorPrecio);
    agregarEstaciones(tablaDistancia, estacionesOrdenadasPorDistancia);
    agregarEstaciones(tablaDistanciaPrecio, estacionesOrdenadasPorDistanciaPrecio);
}

// Evento para ejecutar la función de buscar gasolineras al hacer click
document.getElementById('buscarCercanas').addEventListener('click', buscarGasolinerasCercanas);

// Evento para ejecutar la búsqueda al presionar "Enter" en el campo de rango
document.getElementById('rango').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar el envío del formulario si está dentro de uno
        buscarGasolinerasCercanas(); // Llamar a la función de búsqueda
    }
});
