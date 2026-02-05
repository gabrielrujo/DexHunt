const { rollRarity, catchChanceByRarity } = require('../game/rarity')

const counts = { common: 0, rare: 0, legendary: 0 }
const N = 10000

for (let i = 0; i < N; i++) {
  counts[rollRarity()]++
}

console.log('Counts:', counts)
console.log('Chances:', {
  common: catchChanceByRarity('common'),
  rare: catchChanceByRarity('rare'),
  legendary: catchChanceByRarity('legendary')
})

