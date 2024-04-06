async function fetchDataFromAPIEndpoint() {
  try {
    const response = await fetch('/api/fetchNotion');
    const data = await response.json();
    console.log(data);
    
    // La estructura de tu objeto es { pages: [...] }
    const cards = data.pages;

    const container = document.getElementById('container');

    // Asegúrate de que cards es un array y tiene elementos.
    if (Array.isArray(cards) && cards.length > 0) {
      cards.forEach(card => {
        // Aquí debes crear nuevos elementos para cada card o clonar y modificar uno existente.
        // Si estás intentando clonar, deberías hacerlo dentro del forEach para clonar un nuevo elemento para cada card.
        const cardElement = document.querySelector('.container__card').cloneNode(true);
        const cardTitle = cardElement.querySelector('.card__title'); // Asegúrate de seleccionar dentro del clon, no del documento.
        
        // Aquí estás accediendo a la estructura de tu objeto de la respuesta de la API.
        cardTitle.textContent = card.titulo;
        cardElement.querySelector('.card__content').textContent = card.contenido;

        // Agrega el nuevo cardElement al container.
        container.appendChild(cardElement);
      });
    } else {
      console.error('No hay cards para mostrar.');
    }
  } catch (error) {
    console.error('Hubo un error al recuperar los datos:', error);
  }
}

fetchDataFromAPIEndpoint();
