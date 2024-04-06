const { Client } = require('@notionhq/client');
require('dotenv').config();

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

    // Iterar sobre los bloques para construir el título y el contenido.
    response.results.forEach(block => {

      if (block.type === 'heading_1' && block.heading_1 && !titulo) {
        titulo = block.heading_1.text[0].plain_text;
      } else if (block.type === 'image') {
        imagen = block.image.caption[0].plain_text;
      }



    });
    return { response, titulo, imagen }; // Eliminar espacios al inicio y final del contenido.
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
        id: page.id,
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
