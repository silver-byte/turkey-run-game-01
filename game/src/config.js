export const FINISH = 500;
export const LANES = [-2.65, 0, 2.65];
export const MAX_LIVES = 3;
export const ROAD_EDGE = 4.65;
export const PALETTE = {
  ink: '#2d1e28', wheat: '#ffc76a', garden: '#a69a43', road: '#b96e49',
  barn: '#a63c40', cream: '#ffdfac', wood: '#6b392f', copper: '#e26d3c',
  fog: '#efad79', canopy: ['#ad393f', '#e36032', '#f79c34', '#d47825', '#f6b94d'],
};
export const HAZARDS = {
  oven: { width: .91, height: 1.16 },
  crate: { width: .93, height: .77 },
  fence: { width: 1.06, height: .95 },
  knife: { width: 1.08, height: Infinity },
};
export const SECTORS = [
  { start: 0, name: 'The Barnyard', number: '01' },
  { start: 150, name: 'Cider Hollow', number: '02' },
  { start: 315, name: 'Blackberry Ridge', number: '03' },
  { start: 466, name: 'The Wild Gate', number: '04' },
];
export const pace = distance => 13.6 + Math.min(distance, FINISH) * .013;
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const sectorAt = distance => SECTORS.findLast(sector => distance >= sector.start) || SECTORS[0];
