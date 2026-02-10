const fs = require('fs');
const https = require('https');

const VERIFIED_IDS = [
  'photo-1514888286974-6c03e2ca1dba',
  'photo-1537151608828-ea2b11777ee8',
  'photo-1591017403986-ed818cd530c2',
  'photo-1425082661705-18361f07d10d',
  'photo-1503777119540-ce54b422b91d',
  'photo-1517331156700-3c241d2b4d83',
  'photo-1543852786-1cf6624b9987',
  'photo-1592194996308-7b43878e84a6',
  'photo-1533738363-b7f9aef128ce',
  'photo-1548247416-ec66f4900b2e'
];

async function downloadAndEncode(id) {
  const url = `https://images.unsplash.com/${id}?q=80&w=800&auto=format&fit=crop`; 
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(`data:${res.headers['content-type']};base64,${buffer.toString('base64')}`);
      });
    });
  });
}

(async () => {
  const encoded = {};
  for (const id of VERIFIED_IDS) {
    console.log(`Encoding ${id} (High Res)...`);
    encoded[id] = await downloadAndEncode(id);
  }
  fs.writeFileSync('src/app/animalData.ts', `export const BASE64_IMAGES = ${JSON.stringify(encoded, null, 2)};`);
  console.log('src/app/animalData.ts updated with high-res images.');
})();
