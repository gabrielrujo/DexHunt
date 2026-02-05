// src/game/rarity.js

const RARITY_WEIGHTS = [
  { rarity: 'legendary', weight: 5 }, // 5%
  { rarity: 'rare', weight: 25 },     // 25%
  { rarity: 'common', weight: 70 }    // 70%
]

function rollRarity() {
  const total = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0)
  const roll = Math.random() * total

  let acc = 0
  for (const item of RARITY_WEIGHTS) {
    acc += item.weight
    if (roll < acc) return item.rarity
  }

  return 'common' // fallback
}

function catchChanceByRarity(rarity) {
  switch (rarity) {
    case 'legendary':
      return 0.08
    case 'rare':
      return 0.35
    default:
      return 0.65
  }
}

module.exports = { rollRarity, catchChanceByRarity }
