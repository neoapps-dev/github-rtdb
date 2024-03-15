// api/data.ts

import { ServerRequest } from 'https://deno.land/std/http/server.ts';

async function saveData(loc: string, data: any): Promise<boolean> {
  try {
    await Deno.writeTextFile(`${loc}.json`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function loadData(loc: string): Promise<any> {
  try {
    const data = await Deno.readTextFile(`${loc}.json`);
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function handler(req: ServerRequest) {
  const { method, url } = req;
  const queryParams = new URLSearchParams(url.split('?')[1] ?? '');
  const loc = queryParams.get('loc');

  if (!loc) {
    return req.respond({ status: 400, body: 'Missing "loc" query parameter' });
  }

  switch (method) {
    case 'POST':
      const body = await req.json();
      if (await saveData(loc, body)) {
        req.respond({ status: 200, body: 'Data saved successfully' });
      } else {
        req.respond({ status: 500, body: 'Error saving data' });
      }
      break;

    case 'GET':
      const data = await loadData(loc);
      if (data !== null) {
        req.respond({ status: 200, body: JSON.stringify(data) });
      } else {
        req.respond({ status: 500, body: 'Error retrieving data' });
      }
      break;

    default:
      req.respond({ status: 405, body: `Method ${method} Not Allowed` });
  }
}
