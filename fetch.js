const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const database_id = process.env.NOTION_DB;

async function listDatabases() {
  const response = await notion.databases.query({
    database_id: database_id,
    filter: {
      property: "Status",
      status: {
        equals: "Borrador",
      },
    },
  });

  const pages = response.results
    pages.forEach(pagesId => {

    retrieveBlockChildren(pagesId.id)
  })
}

listDatabases();

async function retrieveBlockChildren(blockId) {
  try {
    // Realiza la llamada a la API para obtener los bloques hijos
    const response = await notion.blocks.children.list({
      block_id: blockId,

    });
    const pages = response.results;
    pages.forEach(page => {
      console.log(page.heading_1.text[0])
    })
    return response;
  } catch (error) {
    // Maneja los errores que puedan ocurrir
    console.error("Error al recuperar los bloques hijos:", error);
  }
}

