import { Song } from '../types'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface SongEntry {
  title: string
  artist: string
  audioFile?: string
}

const songEntries: SongEntry[] = [
  // (G)I-DLE
  { title: 'LATATA', artist: '(G)I-DLE' },
  { title: 'Nxde', artist: '(G)I-DLE' },
  { title: 'Oh my god', artist: '(G)I-DLE' },
  { title: 'Queencard', artist: '(G)I-DLE' },
  { title: 'TOMBOY', artist: '(G)I-DLE' },
  // 2NE1
  { title: 'I AM THE BEST', artist: '2NE1' },
  // aespa
  { title: 'Armageddon', artist: 'aespa' },
  { title: 'Black Mamba', artist: 'aespa' },
  { title: 'Drama', artist: 'aespa' },
  { title: 'Hold On Tight', artist: 'aespa' },
  { title: 'Next Level', artist: 'aespa' },
  { title: 'Savage', artist: 'aespa' },
  { title: 'Supernova', artist: 'aespa' },
  { title: 'Whiplash', artist: 'aespa' },
  // ATEEZ
  { title: 'Adrenaline', artist: 'ATEEZ' },
  { title: 'Deja Vu', artist: 'ATEEZ' },
  // BABYMONSTER
  { title: 'BATTER UP', artist: 'BABYMONSTER' },
  { title: 'DRIP', artist: 'BABYMONSTER' },
  { title: 'FOREVER', artist: 'BABYMONSTER' },
  { title: 'PSYCHO', artist: 'BABYMONSTER' },
  { title: 'SHEESH', artist: 'BABYMONSTER' },
  // BLACKPINK
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
  // BTS
  { title: 'Butter', artist: 'BTS' },
  // CHUNG HA
  { title: 'Killing Me', artist: 'CHUNG HA' },
  // ENHYPEN
  { title: 'Bite Me', artist: 'ENHYPEN' },
  { title: 'Drunk-Dazed', artist: 'ENHYPEN' },
  { title: 'FEVER', artist: 'ENHYPEN' },
  // EVERGLOW
  { title: 'DUN DUN', artist: 'EVERGLOW' },
  { title: 'LA DI DA', artist: 'EVERGLOW' },
  // EXO
  { title: 'Growl', artist: 'EXO' },
  { title: 'Love Shot', artist: 'EXO' },
  // FIFTY FIFTY
  { title: 'Cupid', artist: 'FIFTY FIFTY' },
  // G-DRAGON
  { title: 'CROOKED', artist: 'G-DRAGON' },
  { title: 'HOME SWEET HOME (feat. TAEYANG & DAESUNG)', artist: 'G-DRAGON' },
  { title: 'POWER', artist: 'G-DRAGON' },
  // Hwa Sa
  { title: 'Maria', artist: 'Hwa Sa' },
  // iKON
  { title: 'Killing Me', artist: 'iKON' },
  // ILLIT
  { title: 'Magnetic', artist: 'ILLIT' },
  // ITZY
  { title: 'DALLA DALLA', artist: 'ITZY' },
  { title: 'ICY', artist: 'ITZY' },
  { title: 'In the morning', artist: 'ITZY' },
  { title: 'LOCO', artist: 'ITZY' },
  { title: 'Not Shy', artist: 'ITZY' },
  { title: 'ROCK & ROLL', artist: 'ITZY' },
  { title: 'SNEAKERS', artist: 'ITZY' },
  { title: "THAT'S A NO NO", artist: 'ITZY' },
  { title: 'WANNABE', artist: 'ITZY' },
  // IVE
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
  // IZ*ONE
  { title: 'LA VIE EN ROSE', artist: 'IZ*ONE' },
  { title: 'Panorama', artist: 'IZ*ONE' },
  { title: 'SECRET STORY OF THE SWAN', artist: 'IZ*ONE' },
  // JENNIE
  { title: 'ExtraL (feat. Doechii)', artist: 'JENNIE' },
  { title: 'Mantra', artist: 'JENNIE' },
  { title: 'SOLO', artist: 'JENNIE' },
  { title: 'like JENNIE', artist: 'JENNIE' },
  // JISOO
  { title: 'FLOWER', artist: 'JISOO' },
  { title: 'earthquake', artist: 'JISOO' },
  // KAI
  { title: 'Mmmh', artist: 'KAI' },
  { title: 'Rover', artist: 'KAI' },
  // KATSEYE
  { title: 'Debut', artist: 'KATSEYE' },
  { title: 'Gameboy', artist: 'KATSEYE' },
  { title: 'Gnarly', artist: 'KATSEYE' },
  { title: 'Internet Girl', artist: 'KATSEYE' },
  { title: 'M.I.A', artist: 'KATSEYE' },
  { title: 'Monster High Fright Song', artist: 'KATSEYE' },
  { title: 'My Way', artist: 'KATSEYE' },
  { title: 'Touch', artist: 'KATSEYE' },
  // KWON EUNBI
  { title: 'SABOTAGE', artist: 'KWON EUNBI' },
  // LE SSERAFIM
  { title: 'ANTIFRAGILE', artist: 'LE SSERAFIM' },
  { title: 'Ash', artist: 'LE SSERAFIM' },
  { title: 'CRAZY', artist: 'LE SSERAFIM' },
  { title: 'EASY', artist: 'LE SSERAFIM' },
  { title: 'FEARLESS', artist: 'LE SSERAFIM' },
  { title: 'SPAGHETTI (feat. j-hope)', artist: 'LE SSERAFIM' },
  // LISA
  { title: 'LALISA', artist: 'LISA' },
  { title: 'Rockstar', artist: 'LISA' },
  // MAMAMOO
  { title: 'HIP', artist: 'MAMAMOO' },
  // MEOVV
  { title: 'HANDS UP', artist: 'MEOVV' },
  // MOMOLAND
  { title: 'BAAM', artist: 'MOMOLAND' },
  { title: 'BBoom BBoom', artist: 'MOMOLAND' },
  // NCT DREAM
  { title: 'Candy', artist: 'NCT DREAM' },
  // NewJeans
  { title: 'Attention', artist: 'NewJeans' },
  { title: 'ETA', artist: 'NewJeans' },
  { title: 'Hype Boy', artist: 'NewJeans' },
  { title: 'OMG', artist: 'NewJeans' },
  { title: 'Super Shy', artist: 'NewJeans' },
  // Red Velvet
  { title: 'Bad Boy', artist: 'Red Velvet' },
  { title: 'Cosmic', artist: 'Red Velvet' },
  { title: 'Feel My Rhythm', artist: 'Red Velvet' },
  { title: 'ICE CREAM CAKE', artist: 'Red Velvet' },
  { title: 'Psycho', artist: 'Red Velvet' },
  { title: 'Red Flavor', artist: 'Red Velvet' },
  { title: 'Russian Roulette', artist: 'Red Velvet' },
  { title: 'TILT', artist: 'Red Velvet' },
  // SEVENTEEN
  { title: 'MAESTRO', artist: 'SEVENTEEN' },
  { title: 'Super', artist: 'SEVENTEEN' },
  { title: 'Very Nice', artist: 'SEVENTEEN' },
  // Stray Kids
  { title: "God's Menu", artist: 'Stray Kids' },
  { title: 'MIROH', artist: 'Stray Kids' },
  // SuperM
  { title: 'Jopping', artist: 'SuperM' },
  // TAEMIN
  { title: 'Advice', artist: 'TAEMIN' },
  // TOMORROW X TOGETHER
  { title: 'LO$ER=LO\u2661ER', artist: 'TOMORROW X TOGETHER' },
  // TWICE
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
  // XG
  { title: 'GALA', artist: 'XG' },
]

// Auto-generate IDs and audioFile names from artist + title
const songs: Song[] = songEntries
  .sort((a, b) => {
    const artistCmp = a.artist.toLowerCase().localeCompare(b.artist.toLowerCase())
    if (artistCmp !== 0) return artistCmp
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  })
  .map((entry) => {
    const id = `${toSlug(entry.artist)}-${toSlug(entry.title)}`
    return {
      id,
      title: entry.title,
      artist: entry.artist,
      audioFile: entry.audioFile ?? `${toSlug(entry.artist)}-${toSlug(entry.title)}.mp3`,
    }
  })

export default songs
