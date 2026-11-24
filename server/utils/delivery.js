// Simulated delivery estimate by district. Kathmandu valley is fastest; remote districts have no COD.
const { VALLEY, HUBS, REMOTE, DISTRICT_TO_PROVINCE } = require('../data/nepal');

function estimateDelivery(district, from = new Date()) {
  const name = Object.keys(DISTRICT_TO_PROVINCE).find((k) => k.toLowerCase() === String(district || '').trim().toLowerCase());
  if (!name) return null;
  const tier = VALLEY.includes(name) ? 'valley' : HUBS.includes(name) ? 'hub' : REMOTE.includes(name) ? 'remote' : 'standard';
  const days = { valley: 1, hub: 3, standard: 5, remote: 8 }[tier];
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  date.setHours(19, 0, 0, 0);
  return { district: name, province: DISTRICT_TO_PROVINCE[name], days, date, codAvailable: tier !== 'remote', express: tier === 'valley', tier };
}

module.exports = { estimateDelivery };
