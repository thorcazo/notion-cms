

const cloudinary = require('cloudinary').v2;
const { Client } = require('@notionhq/client');
require('dotenv').config();


cloudinary.config({
  cloud_name: 'dbzkjosxx',
  api_key: '753415155285294',
  api_secret: 'dENgGrdZ0fi9DPDtIBovBmFz0as'
});

const { NOTION_KEY, NOTION_DB } = process.env;

// Initializing a client
const notion = new Client({
  auth: NOTION_KEY,
});

async function retrieveBlockChildren(blockId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
    });
    let titulo = "";
    let contenido = "";
    let imagen = "";
    let mensajeError = "";

    // Cambiado de forEach a for...of para soportar await dentro del ciclo
    for (const block of response.results) {

      if (block.type === 'heading_1' && block.heading_1 && !titulo) {
        titulo = block.heading_1.text[0].plain_text;
      } else if (block.type === 'image' && block.image && block.image.file) {
        /* subir las imagenes a cloudinary */
        const { url } = block.image.file;

        try {
          // Aquí ya no necesitas el await dentro de un new Promise, usa la función asíncrona directamente
          const result = await cloudinary.uploader.upload(url, { folder: "notion_img" });
          imagen = result.secure_url ? result.secure_url : "no hay imagen";
          console.log("Imagen subida a Cloudinary:", imagen);
        } catch (error) {
          mensajeError = error.message; // Mejor capturar el mensaje de error
          console.error("Error al subir imagen a Cloudinary:", error);
        }

      } else if (block.type === 'paragraph' && block.paragraph) {
        contenido += block.paragraph.text.map(text => text.plain_text).join(' ');
      }

    }
    return { titulo, contenido, imagen, mensajeError };
  } catch (error) {
    console.error("Error al recuperar los bloques hijos:", error);
    throw error; // Lanzar el error para manejarlo en la función handler.
  }
}



exports.handler = async function (event, context) {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DB,
      filter: {
        property: "Status",
        status: {
          equals: "Public"
        }
      }
    });

    const pageDetails = await Promise.all(response.results.map(async (page) => {
      // Recuperar y esperar por los bloques hijos de cada página.
      const blocks = await retrieveBlockChildren(page.id);
      return {

        ...blocks // Esto extiende el objeto devuelto por retrieveBlockChildren.
      };
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ pages: pageDetails }),
    };

  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: e.toString(),
    };
  }
};


/* Funcion para subir imagenes a cloudinary */
async function subirImagenACloudinary(urlImagenNotion) {
  try {
    const resultado = await cloudinary.uploader.upload(urlImagenNotion, {
      folder: "notion_images" // Opcional: especifica una carpeta en Cloudinary
    });
    return resultado.secure_url; // Devuelve la URL permanente de Cloudinary
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    throw error;
  }
}