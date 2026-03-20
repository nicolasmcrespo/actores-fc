import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const API_TOKEN = process.env.APIFY_API_TOKEN;
if (!API_TOKEN) { console.error('Set APIFY_API_TOKEN env var'); process.exit(1); }
const OUT_DIR = path.resolve('public/players');

// All Instagram handles from players.ts
const handles = [
  // Actores
  'agustinbernasconi', 'lautygramm', 'yeyitodegregorio', 'tyagogriffo',
  'gonzagravano', 'cofla', 'rodrigonoya', 'juanidelca', 'pichierbes',
  'faustibo', 'nicope', 'kitoshelby', 'falke', 'emagarcia', 'elwandi',
  'franpizarro', 'ezeantonini', 'nicomaccari', 'martinpepa', 'giulimontepaone',
  // DT
  'rolfimontenegro',
  // Actrices
  'celepamio', 'moreeandrade1', 'canedevoto', 'chiarimancuso', 'yosoybrisaa',
  'catigorostidi', 'camii_lattanzio', 'biandipasquale', 'sofib.oficial',
  'julypenaa', 'gabrielagianatassio', 'sofifernandez', 'renatablasevich',
  'milimansiilla', 'danuguerrero', 'ariadna_leyes', 'candejauregui_',
  'kitarealig', 'camilitaferrr', 'danacabreraa',
];

async function fetchProfilePhoto(username) {
  const outPath = path.join(OUT_DIR, `${username}.jpg`);
  if (existsSync(outPath)) {
    console.log(`  ✓ ${username} (cached)`);
    return;
  }

  try {
    // Use Apify Instagram Profile Scraper
    const runUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${API_TOKEN}`;

    const res = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 1,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${username} - API error: ${res.status} ${text.slice(0, 100)}`);
      return;
    }

    const data = await res.json();
    const profile = data[0];

    if (!profile || !profile.profilePicUrlHD && !profile.profilePicUrl) {
      console.error(`  ✗ ${username} - No profile pic found`);
      return;
    }

    const picUrl = profile.profilePicUrlHD || profile.profilePicUrl;
    console.log(`  ↓ ${username} - downloading from ${picUrl.slice(0, 60)}...`);

    const imgRes = await fetch(picUrl);
    if (!imgRes.ok) {
      console.error(`  ✗ ${username} - Image download failed: ${imgRes.status}`);
      return;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await writeFile(outPath, buffer);
    console.log(`  ✓ ${username} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`  ✗ ${username} - ${err.message}`);
  }
}

async function main() {
  console.log(`Fetching ${handles.length} profile photos...\n`);

  // Process in batches of 3 to avoid rate limits
  for (let i = 0; i < handles.length; i += 3) {
    const batch = handles.slice(i, i + 3);
    await Promise.all(batch.map(fetchProfilePhoto));
  }

  // Count results
  const { readdirSync } = await import('fs');
  const files = readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`\nDone! ${files.length}/${handles.length} photos downloaded.`);
}

main();
