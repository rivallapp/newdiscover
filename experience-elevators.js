// Standalone configuration for Experience Elevators
// Priority order: top to bottom; update freely without touching app code
// Each item can include aliases to match incoming dataset feature strings.
// color: HEX code for pill background
// icon: logical icon name (see renderer mapping in index.html)

const experienceElevators = [
  { key: 'glow', label: 'GLOW', color: '#8B5CF6', icon: 'sparkles', aliases: ['GLOW', 'Glow'] },
  { key: 'tailgates', label: 'Tailgates', color: '#F59E0B', icon: 'flag', aliases: ['Tailgates', 'Tailgate'] },
  { key: 'flip-cup', label: 'Flip Cup Counts', color: '#F97316', icon: 'cup', aliases: ['Flip Cup Counts', 'Flip Cup', 'Flipcup'] },
  { key: 'happy-hour', label: 'Happy Hour', color: '#EF4444', icon: 'beer', aliases: ['Happy Hour'] },
  { key: 'happy-hour-league', label: 'Happy Hour League', color: '#3B82F6', icon: 'beer-alt', aliases: ['Happy Hour League'] },
  { key: 'bar-on-site', label: 'Bar On Site', color: '#10B981', icon: 'beer', aliases: ['Bar On Site', 'Bar on Site'] },
  { key: 'dj-on-site', label: 'DJ on Site', color: '#06B6D4', icon: 'music', aliases: ['DJ on Site', 'DJ at the Bar'] },
  { key: 'free-pickup', label: 'Free Pickup', color: '#22C55E', icon: 'ticket', aliases: ['Free Pickup'] },
  { key: 'volo-solo', label: 'Volo Solo', color: '#A855F7', icon: 'user', aliases: ['Volo Solo', 'Singles Events (Volo Solo)'] },
  { key: 'volo-pass-exclusive', label: 'Volo Pass Exclusive', color: '#0EA5E9', icon: 'badge', aliases: ['Volo Pass Exclusive', 'Free for Volo Pass Members'] },
  { key: 'player-appreciation', label: 'Player Appreciation Event', color: '#EC4899', icon: 'heart', aliases: ['Player Appreciation Event', 'Player Appreciation'] },
  { key: 'player-party', label: 'Player Party', color: '#F43F5E', icon: 'party', aliases: ['Player Party'] },
  { key: 'lgbtq-plus', label: 'LGBTQ+', color: '#9333EA', icon: 'heart', aliases: ['LGBTQ+', 'LGBTQ'] },
  { key: 'city-championship', label: 'City Championship', color: '#F59E0B', icon: 'trophy', aliases: ['City Championship'] },
  { key: 'big-tv', label: 'Big TV', color: '#4F46E5', icon: 'tv', aliases: ['Big TV', 'BigTV'] },
  { key: 'watch-parties', label: 'Watch Parties', color: '#1F2937', icon: 'tv', aliases: ['Watch Parties', 'Watch Party'] },
  { key: 'concerts', label: 'Concerts', color: '#7C3AED', icon: 'music', aliases: ['Concerts', 'Concert'] },
  { key: 'pro-sport', label: 'Professional Sporting Event', color: '#111827', icon: 'ball', aliases: ['Professional Sporting Event'] },
  { key: 'volo-kids', label: 'Volo Kids Fundraiser', color: '#16A34A', icon: 'heart-star', aliases: ['Volo Kids Fundraiser'] },
  { key: 'bar-tab', label: 'Bar Tab Challenge', color: '#9CA3AF', icon: 'receipt', aliases: ['Bar Tab Challenge'] },
  { key: 'club-volo', label: 'Club Volo Tournament Series', color: '#DC2626', icon: 'shield', aliases: ['Club Volo Tournament Series'] },
  { key: 'waterfront', label: 'Waterfront View', color: '#06B6D4', icon: 'water', aliases: ['Waterfront View'] },
];

// Expose globally (no module system in static page)
window.experienceElevators = experienceElevators;
