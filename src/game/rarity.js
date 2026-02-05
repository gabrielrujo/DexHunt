// src/game/rarity.js

const RARITY_WEIGHTS = [
  { rarity: 'legendary', weight: 2 }, // 2%
  { rarity: 'rare', weight: 18 },     // 18%
  { rarity: 'common', weight: 80 }    // 80%
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
