/**
 * One-time script to generate the puzzle schedule as JSON.
 * Run: node scripts/generate-puzzle-schedule.mjs > api/KClip.Api/Data/puzzle-schedule.json
 */

// ── Song list (same as songs.ts) ──

function toSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const songEntries = [
  { title: 'LATATA', artist: '(G)I-DLE' },
  { title: 'Nxde', artist: '(G)I-DLE' },
  { title: 'Oh my god', artist: '(G)I-DLE' },
  { title: 'Queencard', artist: '(G)I-DLE' },
  { title: 'TOMBOY', artist: '(G)I-DLE' },
  { title: 'I AM THE BEST', artist: '2NE1' },
  { title: 'Armageddon', artist: 'aespa' },
  { title: 'Black Mamba', artist: 'aespa' },
  { title: 'Drama', artist: 'aespa' },
  { title: 'Hold On Tight', artist: 'aespa' },
  { title: 'Next Level', artist: 'aespa' },
  { title: 'Savage', artist: 'aespa' },
  { title: 'Supernova', artist: 'aespa' },
  { title: 'Whiplash', artist: 'aespa' },
  { title: 'Adrenaline', artist: 'ATEEZ' },
  { title: 'Deja Vu', artist: 'ATEEZ' },
  { title: 'BATTER UP', artist: 'BABYMONSTER' },
  { title: 'DRIP', artist: 'BABYMONSTER' },
  { title: 'FOREVER', artist: 'BABYMONSTER' },
  { title: 'PSYCHO', artist: 'BABYMONSTER' },
  { title: 'SHEESH', artist: 'BABYMONSTER' },
  { title: "AS IF IT'S YOUR LAST", artist: 'BLACKPINK' },
  { title: 'BOOMBAYAH', artist: 'BLACKPINK' },
  { title: 'DDU-DDU DDU-DU', artist: 'BLACKPINK' },
  { title: 'Forever Young', artist: 'BLACKPINK' },
  { title: 'GO', artist: 'BLACKPINK' },
  { title: 'How You Like That', artist: 'BLACKPINK' },
  { title: 'Ice Cream (with Selena Gomez)', artist: 'BLACKPINK' },
  { title: 'JUMP', artist: 'BLACKPINK' },
  { title: 'Kill This Love', artist: 'BLACKPINK' },
  { title: 'Lovesick Girls', artist: 'BLACKPINK' },
  { title: 'PLAYING WITH FIRE', artist: 'BLACKPINK' },
  { title: 'Pink Venom', artist: 'BLACKPINK' },
  { title: 'Shut Down', artist: 'BLACKPINK' },
  { title: 'WHISTLE', artist: 'BLACKPINK' },
  { title: 'Butter', artist: 'BTS' },
  { title: 'Killing Me', artist: 'CHUNG HA' },
  { title: 'Bite Me', artist: 'ENHYPEN' },
  { title: 'Drunk-Dazed', artist: 'ENHYPEN' },
  { title: 'FEVER', artist: 'ENHYPEN' },
  { title: 'DUN DUN', artist: 'EVERGLOW' },
  { title: 'LA DI DA', artist: 'EVERGLOW' },
  { title: 'Growl', artist: 'EXO' },
  { title: 'Love Shot', artist: 'EXO' },
  { title: 'Cupid', artist: 'FIFTY FIFTY' },
  { title: 'CROOKED', artist: 'G-DRAGON' },
  { title: 'HOME SWEET HOME (feat. TAEYANG & DAESUNG)', artist: 'G-DRAGON' },
  { title: 'POWER', artist: 'G-DRAGON' },
  { title: 'Maria', artist: 'Hwa Sa' },
  { title: 'Killing Me', artist: 'iKON' },
  { title: 'Magnetic', artist: 'ILLIT' },
  { title: 'DALLA DALLA', artist: 'ITZY' },
  { title: 'ICY', artist: 'ITZY' },
  { title: 'In the morning', artist: 'ITZY' },
  { title: 'LOCO', artist: 'ITZY' },
  { title: 'Not Shy', artist: 'ITZY' },
  { title: 'ROCK & ROLL', artist: 'ITZY' },
  { title: 'SNEAKERS', artist: 'ITZY' },
  { title: "THAT'S A NO NO", artist: 'ITZY' },
  { title: 'WANNABE', artist: 'ITZY' },
  { title: '8 (JANGWONYOUNG Solo)', artist: 'IVE' },
  { title: 'Accendio', artist: 'IVE' },
  { title: 'After LIKE', artist: 'IVE' },
  { title: 'BANG BANG', artist: 'IVE' },
  { title: 'BLACKHOLE', artist: 'IVE' },
  { title: 'ELEVEN', artist: 'IVE' },
  { title: 'Fireworks', artist: 'IVE' },
  { title: 'I AM', artist: 'IVE' },
  { title: 'Kitsch', artist: 'IVE' },
  { title: 'LOVE DIVE', artist: 'IVE' },
  { title: 'REBEL HEART', artist: 'IVE' },
  { title: 'Super ICY (LEESEO Solo)', artist: 'IVE' },
  { title: 'LA VIE EN ROSE', artist: 'IZ*ONE' },
  { title: 'Panorama', artist: 'IZ*ONE' },
  { title: 'SECRET STORY OF THE SWAN', artist: 'IZ*ONE' },
  { title: 'ExtraL (feat. Doechii)', artist: 'JENNIE' },
  { title: 'Mantra', artist: 'JENNIE' },
  { title: 'SOLO', artist: 'JENNIE' },
  { title: 'like JENNIE', artist: 'JENNIE' },
  { title: 'FLOWER', artist: 'JISOO' },
  { title: 'earthquake', artist: 'JISOO' },
  { title: 'Mmmh', artist: 'KAI' },
  { title: 'Rover', artist: 'KAI' },
  { title: 'Debut', artist: 'KATSEYE' },
  { title: 'Gameboy', artist: 'KATSEYE' },
  { title: 'Gnarly', artist: 'KATSEYE' },
  { title: 'Internet Girl', artist: 'KATSEYE' },
  { title: 'M.I.A', artist: 'KATSEYE' },
  { title: 'Monster High Fright Song', artist: 'KATSEYE' },
  { title: 'My Way', artist: 'KATSEYE' },
  { title: 'Touch', artist: 'KATSEYE' },
  { title: 'SABOTAGE', artist: 'KWON EUNBI' },
  { title: 'ANTIFRAGILE', artist: 'LE SSERAFIM' },
  { title: 'Ash', artist: 'LE SSERAFIM' },
  { title: 'CRAZY', artist: 'LE SSERAFIM' },
  { title: 'EASY', artist: 'LE SSERAFIM' },
  { title: 'FEARLESS', artist: 'LE SSERAFIM' },
  { title: 'SPAGHETTI (feat. j-hope)', artist: 'LE SSERAFIM' },
  { title: 'LALISA', artist: 'LISA' },
  { title: 'Rockstar', artist: 'LISA' },
  { title: 'HIP', artist: 'MAMAMOO' },
  { title: 'HANDS UP', artist: 'MEOVV' },
  { title: 'BAAM', artist: 'MOMOLAND' },
  { title: 'BBoom BBoom', artist: 'MOMOLAND' },
  { title: 'Candy', artist: 'NCT DREAM' },
  { title: 'Attention', artist: 'NewJeans' },
  { title: 'ETA', artist: 'NewJeans' },
  { title: 'Hype Boy', artist: 'NewJeans' },
  { title: 'OMG', artist: 'NewJeans' },
  { title: 'Super Shy', artist: 'NewJeans' },
  { title: 'Bad Boy', artist: 'Red Velvet' },
  { title: 'Cosmic', artist: 'Red Velvet' },
  { title: 'Feel My Rhythm', artist: 'Red Velvet' },
  { title: 'ICE CREAM CAKE', artist: 'Red Velvet' },
  { title: 'Psycho', artist: 'Red Velvet' },
  { title: 'Red Flavor', artist: 'Red Velvet' },
  { title: 'Russian Roulette', artist: 'Red Velvet' },
  { title: 'TILT', artist: 'Red Velvet' },
  { title: 'MAESTRO', artist: 'SEVENTEEN' },
  { title: 'Super', artist: 'SEVENTEEN' },
  { title: 'Very Nice', artist: 'SEVENTEEN' },
  { title: "God's Menu", artist: 'Stray Kids' },
  { title: 'MIROH', artist: 'Stray Kids' },
  { title: 'Jopping', artist: 'SuperM' },
  { title: 'Advice', artist: 'TAEMIN' },
  { title: 'LO$ER=LO\u2661ER', artist: 'TOMORROW X TOGETHER' },
  { title: 'Alcohol-Free', artist: 'TWICE' },
  { title: 'CHEER UP', artist: 'TWICE' },
  { title: 'CRY FOR ME', artist: 'TWICE' },
  { title: 'Dance The Night Away', artist: 'TWICE' },
  { title: 'FANCY', artist: 'TWICE' },
  { title: 'Feel Special', artist: 'TWICE' },
  { title: "I CAN'T STOP ME", artist: 'TWICE' },
  { title: 'KNOCK KNOCK', artist: 'TWICE' },
  { title: 'LIKEY', artist: 'TWICE' },
  { title: 'Like OOH-AHH', artist: 'TWICE' },
  { title: 'MORE & MORE', artist: 'TWICE' },
  { title: 'SIGNAL', artist: 'TWICE' },
  { title: 'THIS IS FOR', artist: 'TWICE' },
  { title: 'TT', artist: 'TWICE' },
  { title: 'What is Love?', artist: 'TWICE' },
  { title: 'YES or YES', artist: 'TWICE' },
  { title: 'GALA', artist: 'XG' },
]

// ── Sort (same as songs.ts) ──

const songs = songEntries
  .sort((a, b) => {
    const artistCmp = a.artist.toLowerCase().localeCompare(b.artist.toLowerCase())
    if (artistCmp !== 0) return artistCmp
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  })
  .map((e) => ({
    id: `${toSlug(e.artist)}-${toSlug(e.title)}`,
    title: e.title,
    artist: e.artist,
  }))

// ── Mulberry32 shuffle (same as puzzle.ts) ──

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const indices = songs.map((_, i) => i)
const rng = mulberry32(20260322)
for (let i = indices.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [indices[i], indices[j]] = [indices[j], indices[i]]
}

// ── Build schedule: day number → song ──

const schedule = indices.map((songIdx) => ({
  songId: songs[songIdx].id,
  title: songs[songIdx].title,
  artist: songs[songIdx].artist,
}))

console.log(JSON.stringify(schedule, null, 2))
