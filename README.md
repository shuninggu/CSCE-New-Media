# Snow White: A Tale Retold

An interactive text-based game built for **CSCE 656 — New Media** at Texas A&M University.

## Concept

A gender-swapped retelling of Snow White. The player is **Prince Alden**, a male "Snow White" who must flee his evil stepmother and find refuge with **three female dwarfs** — miners living deep in the Darkwood Forest. The game is a branching text-based narrative with 4 chapters, player-driven choices, and 3 distinct endings.

## How to Play

Open `index.html` in any modern browser. No build tools or dependencies required.

## Deployment

### GitHub Pages frontend

The game can be deployed directly as a static GitHub Pages site.

Important:
- Do **not** put the OpenRouter API key in the frontend
- `js/runtime-config.js` should contain only the public Cloudflare Worker URL
- The API key belongs only in the Worker secret store

### Cloudflare Worker backend

This repo includes a Worker template in [`proxy/`](./proxy) for `POST /api/mirror-chat`.

Deployment flow:
1. Deploy the frontend to GitHub Pages
2. Deploy the Worker with `wrangler`
3. Set `OPENROUTER_API_KEY` with `wrangler secret put OPENROUTER_API_KEY`
4. Update `js/runtime-config.js` to point to the deployed Worker URL
5. Recommended default model for better free-tier reliability: `nvidia/nemotron-3-super-120b-a12b:free`

## Characters

| Character | Role | Description |
|-----------|------|-------------|
| **Prince Alden** | Player | The late King's only son. Kind, sheltered, grows stronger through the story. |
| **Queen Ravenna** | Antagonist | The stepmother. Beautiful, ruthless, obsessed with power. Consults the Magic Mirror nightly. |
| **The Magic Mirror** | Oracle | An ancient relic that speaks only truth. It judges who the people will follow, not beauty. |
| **Rose** | Dwarf Leader | Red hair, green eyes, carries a pickaxe. Fierce, sharp-tongued, and protective. |
| **Fern** | Dwarf Healer | Dark hair, gentle and observant. Tends the herb garden. Sees through lies. |
| **Briar** | Dwarf Blacksmith | Blonde, stocky, blunt. Trusts no one, forges iron tools. Last to warm up, first to fight. |

## Story Structure

### Chapter 1 — "The Fairest" (Castle, Midnight)

Alden overhears the Queen asking the Mirror who is fairest. The Mirror names Alden. The Queen summons the Huntsman.

- **Choice A:** Seek help from nursemaid Marta (leaves prepared with knife + food)
- **Choice B:** Flee alone into the Darkwood (barefoot, nothing)

### Chapter 2 — "Into the Woods" (Forest, Dawn)

Both paths lead to the dwarfs' cottage. The three dwarfs return and find Alden. Rose confronts him at pickaxe-point.

- **Choice A:** Tell the truth — reveal everything (Queen, Mirror, Huntsman)
- **Choice B:** Hide identity — claim to be a lost traveler
- **Choice C:** Offer a deal — work in exchange for shelter

### Chapter 3 — "The Three" (Cottage, Evening)

Alden lives with the dwarfs. Each path has different dynamics:

- **Truth path:** The dwarfs accept him openly. Briar warns of danger.
- **Cautious path:** Fern quietly sees through the lie and gently confronts him.
- **Deal path:** Alden wins trust through cooking (Briar's terrible stew is a running joke).

All paths converge: Briar spots an old woman with a basket of apples approaching. Rose knows it must be the Queen in disguise.

- **Choice A:** Confront — face the Queen alone
- **Choice B:** Trap — work together to set a trap
- **Choice C:** Sacrifice — leave to draw the Queen away and protect the dwarfs

### Chapter 4 — "The Poisoned Apple" (Forest/Cottage, Morning)

- **Confront path:** Alden faces the Queen alone. She drops her disguise and reveals her true fear. The dwarfs appear from the treeline with weapons raised. The Queen drops the poisoned apple and flees.
- **Trap path:** Briar rigs an iron chain snare. Fern prepares blinding powder. Rose hides behind the door. Alden is the bait. The Queen is caught. Fern identifies the poison: Nightshade and Witchbane.
- **Sacrifice path:** Alden runs but the Queen finds him. She offers the apple. The three dwarfs come charging down the path. The Queen sees their loyalty and her composure breaks: "They would never do this for me. No one has ever..."

### Three Endings

| Ending | Path | Theme |
|--------|------|-------|
| **The Prince Who Stood** | Confront | Courage — Alden builds a forest community; the Queen's reign crumbles as people walk away |
| **The Queen Unmasked** | Trap | Unity — The poisoned apple becomes evidence; the kingdom turns against Ravenna with silence |
| **Home in the Darkwood** | Sacrifice | Belonging — Alden stays in the cottage and finds a chosen family |

### Branching Diagram

```
Chapter 1: The Fairest
  ├── A: Seek Marta's help
  └── B: Flee alone
          │
          ▼
Chapter 2: Into the Woods (2 variants)
  ├── A: Tell the truth
  ├── B: Hide identity
  └── C: Offer a deal
          │
          ▼
Chapter 3: The Three (3 variants)
  ├── A: Confront Queen ──► Ending: The Prince Who Stood
  ├── B: Set a trap     ──► Ending: The Queen Unmasked
  └── C: Sacrifice      ──► Ending: Home in the Darkwood
```

**Total playable paths: 2 x 3 x 3 = 18 unique combinations, leading to 3 endings.**

## Core Themes

- **Courage vs. fear** — the Queen fears being replaced
- **Honesty vs. self-protection** — the player chooses whether to be truthful with the dwarfs
- **Chosen family over birthright** — three strangers become family
- **"Fairest" means character, not appearance**

## Project Structure

```
CSCE-New-Media/
├── index.html          # Main game page
├── css/
│   └── style.css       # Fantasy-themed dark UI (Cinzel + Crimson Text fonts)
├── js/
│   ├── engine.js       # Game engine (state, scene transitions, Mirror gate flow)
│   ├── mirror.js       # Magic Mirror chat + analysis + choice gating
│   ├── runtime-config.js # Public Worker endpoint config
│   └── story.js        # All story data (scenes, dialogue, choices, endings)
├── proxy/
│   ├── cloudflare-worker.js # OpenRouter proxy for GitHub Pages
│   └── wrangler.toml   # Worker config template
└── README.md
```

## Tech Stack

- Pure HTML / CSS / JavaScript — no frameworks or build tools
- Typewriter text effect for immersion
- Responsive design for desktop and mobile
- Google Fonts: Cinzel (headings) + Crimson Text (body)

## Team

| Member | Role |
|--------|------|
| Praewa Pitiphat | Presentation slides and static game assets (characters, backgrounds) |
| Sueray Wang | Live2D model animation for LLM chat system |
| Shuning Gu | Text game storyline design and framework code |
| Xiangbo Gao | LLM deployment and agent interaction workflow |
| Siyuan Yang | Project report (writing, proofreading, editing) |
| Mingyang Wu | LLM engine for real-time conversation |


## LLM Chat Integration

The current version adds a `Magic Mirror` chatbox before major branch points.

- The player talks to one NPC: the Magic Mirror
- The Mirror analyzes the dialogue into trait scores
- Trait thresholds lock or unlock later choices
- The frontend is static and can run on GitHub Pages
- The real LLM call should go through the Cloudflare Worker proxy in [`proxy/`](./proxy)
