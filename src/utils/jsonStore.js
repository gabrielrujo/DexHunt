const fs = require('fs');
const path = require('path');

function readJson(filePath, defaultValue = {}) {
    try {
    if (!fs.existsSync(filePath)) return defaultValue
    const raw = fs.readFileSync(filePath, 'utf-8')
    if (!raw.trim()) return defaultValue
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[jsonStore] Falha ao ler ${filePath}:`, err)
    return defaultValue
  }
}

function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (err) {
        console.error(`[jsonStore] Falha ao escrever ${filePath}:`, err)
    }
}

module.exports = { readJson, writeJson }