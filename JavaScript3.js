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

            // Marcador del usuario
            L.marker([latitude, longitude], { title: 'Tu ubicación' }).addTo(mapa);

            fetch(API_URL)
                .then((response) => response.json())
                .then((data) => {
                    const estaciones = data.ListaEESSPrecio.filter((estacion) => {
                        const lat = parseFloat(estacion.Latitud.replace(',', '.'));
                        const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));

                        if (isNaN(lat) || isNaN(lon)) {
                            console.warn(`Coordenadas inválidas para la estación: ${estacion.Dirección}`);
                            return false;
                        }

                        const distancia = calcularDistancia(latitude, longitude, lat, lon);

                        return distancia <= rango; // Solo estaciones dentro del rango
                    });

                    const estacionesOrdenadas = estaciones.map((estacion) => {
                        const lat = parseFloat(estacion.Latitud.replace(',', '.'));
                        const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));
                        const precioGasoleo = parseFloat(estacion['Precio Gasoleo A']?.replace(',', '.'));
                        const precioGasolina = parseFloat(estacion['Precio Gasolina 95 E5']?.replace(',', '.'));
                        const distancia = calcularDistancia(latitude, longitude, lat, lon);

                        return {
                            ...estacion,
                            distancia,
                            municipio: estacion.Municipio || 'Desconocido',
                            precioGasoleo: isNaN(precioGasoleo) ? null : precioGasoleo,
                            precioGasolina: isNaN(precioGasolina) ? null : precioGasolina,
                            rentabilidad: (distancia + Math.min(precioGasoleo || Infinity, precioGasolina || Infinity)) / 2,
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

    const estacionesOrdenadasPorPrecio = [...estaciones].sort((a, b) => {
        return Math.min(a.precioGasoleo || Infinity, a.precioGasolina || Infinity) -
               Math.min(b.precioGasoleo || Infinity, b.precioGasolina || Infinity);
    });

    const estacionesOrdenadasPorDistancia = [...estaciones].sort((a, b) => {
        return a.distancia - b.distancia;
    });

    const estacionesOrdenadasPorDistanciaPrecio = [...estaciones].sort((a, b) => {
        return a.rentabilidad - b.rentabilidad;
    });

    function agregarEstaciones(tabla, estacionesOrdenadas) {
        estacionesOrdenadas.forEach((estacion) => {
            const lat = parseFloat(estacion.Latitud.replace(',', '.'));
            const lon = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));
            const distancia = estacion.distancia.toFixed(2);

            let preciosHTML = '';
            if (estacion.precioGasoleo !== null) {
                preciosHTML += `<p><strong>Gasóleo A:</strong> ${estacion.precioGasoleo.toFixed(2)} €/L</p>`;
            }
            if (estacion.precioGasolina !== null) {
                preciosHTML += `<p><strong>Gasolina 95 E5:</strong> ${estacion.precioGasolina.toFixed(2)} €/L</p>`;
            }

            const enlaceGoogleMaps = `https://www.google.com/maps?saddr=${usuarioLatitud},${usuarioLongitud}&daddr=${lat},${lon}&directionsmode=driving`;

            const marcador = L.marker([lat, lon]).addTo(mapa);
            marcador.bindPopup(`
                <a href="${enlaceGoogleMaps}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
                    <div style="padding: 10px; text-align: left;">
                        <b>${estacion.Dirección}</b><br>
                        <p><strong>Municipio:</strong> ${estacion.municipio}</p>
                        ${preciosHTML}
                        <p>Distancia: ${distancia} km</p>
                    </div>
                </a>
            `);

            marcador.on('dblclick', () => {
                window.open(enlaceGoogleMaps, '_blank');
            });

            tabla.innerHTML += `
                <a href="${enlaceGoogleMaps}" target="_blank" class="recuadro-gasolineras">
                    <p><strong>Dirección:</strong> ${estacion.Dirección}</p>
                    <p><strong>Municipio:</strong> ${estacion.municipio}</p>
                    ${preciosHTML}
                    <p><strong>Distancia:</strong> ${distancia} km</p>
                </a>
            `;
        });
    }

    agregarEstaciones(tablaPrecio, estacionesOrdenadasPorPrecio);
    agregarEstaciones(tablaDistancia, estacionesOrdenadasPorDistancia);
    agregarEstaciones(tablaDistanciaPrecio, estacionesOrdenadasPorDistanciaPrecio);
}

document.getElementById('buscarCercanas').addEventListener('click', buscarGasolinerasCercanas);

document.getElementById('rango').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        buscarGasolinerasCercanas();
    }
});
