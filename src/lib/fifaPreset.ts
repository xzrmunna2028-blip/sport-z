import type { Match } from "./store";

// Quick FIFA World Cup 2026 pre-list. Admin can "import" these into matches.
export const FIFA_PRESET: Omit<Match, "id">[] = [
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Argentina", teamB: "Brazil", flagA: "🇦🇷", flagB: "🇧🇷", time: "21:00 14/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "France", teamB: "Germany", flagA: "🇫🇷", flagB: "🇩🇪", time: "18:00 15/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Spain", teamB: "Portugal", flagA: "🇪🇸", flagB: "🇵🇹", time: "21:00 15/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "England", teamB: "Netherlands", flagA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagB: "🇳🇱", time: "18:00 16/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Mexico", teamB: "USA", flagA: "🇲🇽", flagB: "🇺🇸", time: "21:00 16/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Canada", teamB: "Japan", flagA: "🇨🇦", flagB: "🇯🇵", time: "18:00 17/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Italy", teamB: "Belgium", flagA: "🇮🇹", flagB: "🇧🇪", time: "21:00 17/06/2026", status: "upcoming", servers: [] },
  { sport: "Football", league: "FIFA World Cup 2026", teamA: "Croatia", teamB: "Morocco", flagA: "🇭🇷", flagB: "🇲🇦", time: "18:00 18/06/2026", status: "upcoming", servers: [] },
];