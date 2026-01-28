<p align="center">
  <img src"./img/Gemini_Generated_Image_ux1y2oux1y2oux1y.png" alt="DexHunt Pokéball" alt="DexHunt Pokéball" width="350" />
</p>

<p align="center">
  <em>DexHunt — um bot de Discord para caçar Pokémon</em>
</p>

# DexHunt 

DexHunt é um bot de Discord em **JavaScript (Node.js)** que transforma o servidor em um **minigame de Pokémon**.

O projeto nasceu com o objetivo de **aprender JavaScript na prática**, construindo algo divertido e evolutivo, passo a passo.

---

## 🎮 O que é o DexHunt?
- Pokémon selvagens aparecem no servidor
- Usuários podem interagir usando **Slash Commands**
- O jogo evolui com captura, raridade, cooldown e inventário

---

## ✅ Status atual
- [x] Bot online
- [x] Slash Commands funcionando
- [x] Integração com a PokéAPI
- [x] `/ping`
- [x] `/spawn` (versão inicial)

---

## 🧰 Tecnologias
- **Node.js**
- **discord.js**
- **PokéAPI**

---

## 📁 Estrutura do projeto
src/
commands/ # comandos slash (ex: /ping, /spawn)
events/ # eventos do discord (ex: interactionCreate)
services/ # integrações externas (ex: pokeapi)
game/ # regras do jogo (spawn, raridade, captura)
utils/ # funções utilitárias (random, cooldown)
data/ # dados locais (users.json, servers.json)


---

## ⚙️ Configuração
1. Instale as dependências:
```bash
npm install


2. Crie um arquivo .env na raiz do projeto:


token=SEU_TOKEN_DO_DISCORD
clientId=SEU_APPLICATION_ID
GUILD_ID=ID_DO_SEU_SERVIDOR_DE_TESTE


Dica: Com GUILD_ID os slash commands aparecem quase instantaneamente no servidor de teste.

Rode o bot:

node src/index.js