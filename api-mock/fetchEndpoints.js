import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';

async function fetchJSONEndpointData(url, fileName) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    await writeFile(`./endpoints/${fileName}`, JSON.stringify(data));

    return true;
  } catch (error) {
    console.error(error);
  }

  return false;
}

async function main() {
  if (!existsSync('endpoints')) await mkdir('endpoints');

  Promise.all(
    ['getActiveData', 'getDonators', 'getSceneries', 'getVehicles'].map((endpointName) =>
      fetchJSONEndpointData(
        `https://stacjownik.spythere.eu/api/${endpointName}`,
        `${endpointName}.json`
      )
    )
  ).then(() => {
    console.log('Endpoints downloaded!');
  });
}

main();
