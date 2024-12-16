He creado una web la cual se utiliza para buscar las gasolineras a X km de cercanía tuya en linea recta, itroduces los kilometros que quieres y te ordena según diferentes valores como precio y Distancia las gasolineras con el precio de la gasolina. 
Además tienes un mapa en el que puedes ver donde estan estas gasolineras con enlaces a google maps para poder llegar a estas.

HTML3.html

Define la estructura de la página web y los elementos visuales principales:

Encabezado:
  Título de la página: "Buscar Gasolineras Cercanas".
  Incluye los enlaces a la hoja de estilos CSS y a la biblioteca Leaflet para los mapas.
  Formulario:
  Un cuadro de entrada para el rango en kilómetros.
  Botón para buscar gasolineras cercanas.
  Mapa:
  Una sección donde se renderiza un mapa interactivo usando Leaflet.
  Tablas de resultados:
  Tres secciones para mostrar gasolineras ordenadas por:
  Precio.
  Distancia.
  Combinación de distancia y precio.
HojaEstilos3.css
Aplica estilos visuales para mejorar el diseño y la experiencia del usuario:

Colores y tipografía:
  Fondo claro (#e8f4f8) para la página.
  Fuente estándar (Arial, sans-serif).
  Mapa y contenedores:
  Tamaño del mapa definido como 500px de altura con bordes redondeados.
  Las tablas de resultados tienen bordes suaves y sombras para destacar.
  Formulario:
  Centra el texto y el cuadro de entrada.
  Botones con colores (#00796b) y efectos al pasar el ratón.
  Hover y animaciones:
  Las casillas de gasolineras cambian de color y tamaño al pasar el ratón.
  Responsividad:
  Asegura que los elementos se vean bien organizados en diferentes tamaños de pantalla.
JavaScript3.js
Controla toda la lógica y la interacción de la página:

Mapa interactivo:
  Inicializa un mapa centrado en España (Leaflet).
  Muestra la ubicación del usuario en el mapa.
  Añade marcadores para cada gasolinera.
  Cálculo de distancias:
  Usa la fórmula de Haversine para calcular distancias entre dos puntos geográficos (usuario y gasolineras).
  Conexión con la API:
  Obtiene la lista de gasolineras y sus datos (ubicación, precios, etc.) desde una API pública.
  Filtrado y ordenamiento:
  Filtra gasolineras dentro del rango especificado por el usuario.
  Ordena los resultados por precio, distancia o combinación de ambos.
  Resultados:
  Muestra información detallada de las gasolineras:
  Dirección.
  Municipio.
  Distancia.
  Precio de los combustibles disponibles.
  Toda la casilla y los marcadores tienen enlaces a Google Maps.
  Eventos del usuario:
  Botón para buscar gasolineras.
  Presionar "Enter" activa el botón de búsqueda automáticamente.
  Doble clic en los marcadores lleva directamente a la dirección en Google Maps.

  En mi opinión, mi nota deberia ser un 8 ya que pese a algunos fallos se ve bastante bien
