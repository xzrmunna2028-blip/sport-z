// Maps team / country names (and common short codes / nicknames) to a flag emoji.
// Lookups are case-insensitive and tolerant of extra whitespace / common suffixes
// like "-W" (women), "U-19", or "(A)".

const RAW: Record<string, string> = {
  // ===== AFC =====
  afghanistan: "🇦🇫", bangladesh: "🇧🇩", bhutan: "🇧🇹", "brunei": "🇧🇳",
  cambodia: "🇰🇭", china: "🇨🇳", "chinese taipei": "🇹🇼", taiwan: "🇹🇼",
  "hong kong": "🇭🇰", india: "🇮🇳", indonesia: "🇮🇩", iran: "🇮🇷", iraq: "🇮🇶",
  japan: "🇯🇵", jordan: "🇯🇴", kazakhstan: "🇰🇿", kuwait: "🇰🇼", kyrgyzstan: "🇰🇬",
  laos: "🇱🇦", lebanon: "🇱🇧", macau: "🇲🇴", malaysia: "🇲🇾", maldives: "🇲🇻",
  mongolia: "🇲🇳", myanmar: "🇲🇲", nepal: "🇳🇵", "north korea": "🇰🇵", "dpr korea": "🇰🇵",
  oman: "🇴🇲", pakistan: "🇵🇰", palestine: "🇵🇸", philippines: "🇵🇭", qatar: "🇶🇦",
  "saudi arabia": "🇸🇦", singapore: "🇸🇬", "south korea": "🇰🇷", korea: "🇰🇷",
  "sri lanka": "🇱🇰", syria: "🇸🇾", tajikistan: "🇹🇯", thailand: "🇹🇭",
  "timor-leste": "🇹🇱", turkmenistan: "🇹🇲", uae: "🇦🇪", "united arab emirates": "🇦🇪",
  uzbekistan: "🇺🇿", vietnam: "🇻🇳", yemen: "🇾🇪",

  // ===== UEFA =====
  albania: "🇦🇱", andorra: "🇦🇩", armenia: "🇦🇲", austria: "🇦🇹", azerbaijan: "🇦🇿",
  belarus: "🇧🇾", belgium: "🇧🇪", "bosnia and herzegovina": "🇧🇦", bosnia: "🇧🇦",
  bih: "🇧🇦", bulgaria: "🇧🇬", croatia: "🇭🇷", cyprus: "🇨🇾",
  "czech republic": "🇨🇿", czechia: "🇨🇿", denmark: "🇩🇰", england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  estonia: "🇪🇪", "faroe islands": "🇫🇴", finland: "🇫🇮", france: "🇫🇷",
  georgia: "🇬🇪", germany: "🇩🇪", greece: "🇬🇷", hungary: "🇭🇺", iceland: "🇮🇸",
  ireland: "🇮🇪", israel: "🇮🇱", italy: "🇮🇹", kosovo: "🇽🇰", latvia: "🇱🇻",
  liechtenstein: "🇱🇮", lithuania: "🇱🇹", luxembourg: "🇱🇺", malta: "🇲🇹",
  moldova: "🇲🇩", montenegro: "🇲🇪", netherlands: "🇳🇱", holland: "🇳🇱",
  "north macedonia": "🇲🇰", "northern ireland": "🇮🇪", norway: "🇳🇴",
  poland: "🇵🇱", portugal: "🇵🇹", romania: "🇷🇴", russia: "🇷🇺",
  "san marino": "🇸🇲", scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", serbia: "🇷🇸", slovakia: "🇸🇰",
  slovenia: "🇸🇮", spain: "🇪🇸", sweden: "🇸🇪", switzerland: "🇨🇭",
  turkey: "🇹🇷", "türkiye": "🇹🇷", ukraine: "🇺🇦", wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",

  // ===== CONMEBOL =====
  argentina: "🇦🇷", bolivia: "🇧🇴", brazil: "🇧🇷", chile: "🇨🇱",
  colombia: "🇨🇴", ecuador: "🇪🇨", paraguay: "🇵🇾", peru: "🇵🇪",
  uruguay: "🇺🇾", venezuela: "🇻🇪",

  // ===== CONCACAF =====
  "antigua and barbuda": "🇦🇬", aruba: "🇦🇼", bahamas: "🇧🇸", barbados: "🇧🇧",
  belize: "🇧🇿", bermuda: "🇧🇲", canada: "🇨🇦", "cayman islands": "🇰🇾",
  "costa rica": "🇨🇷", cuba: "🇨🇺", curacao: "🇨🇼", dominica: "🇩🇲",
  "dominican republic": "🇩🇴", "el salvador": "🇸🇻", grenada: "🇬🇩",
  guatemala: "🇬🇹", guyana: "🇬🇾", haiti: "🇭🇹", honduras: "🇭🇳",
  jamaica: "🇯🇲", mexico: "🇲🇽", nicaragua: "🇳🇮", panama: "🇵🇦",
  "puerto rico": "🇵🇷", suriname: "🇸🇷", "trinidad and tobago": "🇹🇹",
  usa: "🇺🇸", "united states": "🇺🇸", "us": "🇺🇸",

  // ===== CAF =====
  algeria: "🇩🇿", angola: "🇦🇴", benin: "🇧🇯", botswana: "🇧🇼",
  "burkina faso": "🇧🇫", burundi: "🇧🇮", cameroon: "🇨🇲", "cape verde": "🇨🇻",
  "central african republic": "🇨🇫", chad: "🇹🇩", comoros: "🇰🇲",
  congo: "🇨🇬", "dr congo": "🇨🇩", "ivory coast": "🇨🇮", "cote d'ivoire": "🇨🇮",
  djibouti: "🇩🇯", egypt: "🇪🇬", "equatorial guinea": "🇬🇶", eritrea: "🇪🇷",
  eswatini: "🇸🇿", ethiopia: "🇪🇹", gabon: "🇬🇦", gambia: "🇬🇲", ghana: "🇬🇭",
  guinea: "🇬🇳", "guinea-bissau": "🇬🇼", kenya: "🇰🇪", lesotho: "🇱🇸",
  liberia: "🇱🇷", libya: "🇱🇾", madagascar: "🇲🇬", malawi: "🇲🇼", mali: "🇲🇱",
  mauritania: "🇲🇷", mauritius: "🇲🇺", morocco: "🇲🇦", mozambique: "🇲🇿",
  namibia: "🇳🇦", niger: "🇳🇪", nigeria: "🇳🇬", rwanda: "🇷🇼",
  "sao tome and principe": "🇸🇹", senegal: "🇸🇳", seychelles: "🇸🇨",
  "sierra leone": "🇸🇱", somalia: "🇸🇴", "south africa": "🇿🇦",
  "south sudan": "🇸🇸", sudan: "🇸🇩", tanzania: "🇹🇿", togo: "🇹🇬",
  tunisia: "🇹🇳", uganda: "🇺🇬", zambia: "🇿🇲", zimbabwe: "🇿🇼",

  // ===== OFC =====
  "american samoa": "🇦🇸", "cook islands": "🇨🇰", fiji: "🇫🇯",
  "new caledonia": "🇳🇨", "new zealand": "🇳🇿", "papua new guinea": "🇵🇬",
  samoa: "🇼🇸", "solomon islands": "🇸🇧", tahiti: "🇵🇫", tonga: "🇹🇴",
  vanuatu: "🇻🇺", australia: "🇦🇺",

  // ===== Cricket shortcodes =====
  ind: "🇮🇳", pak: "🇵🇰", ban: "🇧🇩", sl: "🇱🇰", afg: "🇦🇫",
  aus: "🇦🇺", nz: "🇳🇿", eng: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sa: "🇿🇦", wi: "🏴‍☠️",
  "west indies": "🏴‍☠️", zim: "🇿🇼", ire: "🇮🇪", sco: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  ned: "🇳🇱", nep: "🇳🇵", uae2: "🇦🇪", oma: "🇴🇲", nam: "🇳🇦", png: "🇵🇬",

  // ===== Football short codes =====
  arg: "🇦🇷", bra: "🇧🇷", esp: "🇪🇸", ger: "🇩🇪", fra: "🇫🇷",
  por: "🇵🇹", ita: "🇮🇹", bel: "🇧🇪", ned2: "🇳🇱", uru: "🇺🇾",
  col: "🇨🇴", chi: "🇨🇱", mex: "🇲🇽", jpn: "🇯🇵", kor: "🇰🇷",
  ksa: "🇸🇦", qat: "🇶🇦", mar: "🇲🇦", egy: "🇪🇬", ngn: "🇳🇬",
  cmr: "🇨🇲", sen: "🇸🇳", civ: "🇨🇮", cro: "🇭🇷", srb: "🇷🇸",
  pol: "🇵🇱", den: "🇩🇰", swe: "🇸🇪", nor: "🇳🇴", sui: "🇨🇭",
  aut: "🇦🇹", tur: "🇹🇷", ukr: "🇺🇦", rus: "🇷🇺", gre: "🇬🇷",
  cze: "🇨🇿", scr: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", wal: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\b(u-?\d+|under\s*\d+|men|women|a|b|xi|fc|national team|nt)\b/g, "")
    .replace(/-(w|m|u\d+)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns the flag emoji for a team / country name, or null if unknown. */
export function flagForTeam(name: string): string | null {
  if (!name) return null;
  const key = normalize(name);
  if (!key) return null;
  if (RAW[key]) return RAW[key];
  // try strict word match (e.g. "Brazil U-19" → brazil)
  for (const word of key.split(" ")) {
    if (RAW[word]) return RAW[word];
  }
  // last resort: substring match
  for (const k of Object.keys(RAW)) {
    if (key.includes(k) && k.length > 3) return RAW[k];
  }
  return null;
}