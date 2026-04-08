// ===== STORY DATA =====
// Snow White and the Three Dwarfs — A Tale Retold
// Male Snow White (Prince Alden), Evil Queen Ravenna, Three Female Dwarfs

const StoryData = {
  scenes: {
    scene_1: {
      id: 'scene_1',
      title: 'Chapter 1 — The Fairest',
      location: 'The Royal Castle — Midnight',
      character: 'narrator',
      text: [
        { line: "You are Prince Alden, the only son of the late King. Your father's death left the throne to your stepmother, Queen Ravenna — a woman of terrifying beauty and darker ambitions. For years she tolerated you. But lately, the castle has grown cold." },
        { line: "Tonight, you were woken by voices. Through the crack of your chamber door, you see the Queen standing before her Magic Mirror — the ancient relic she consults each night." },
        { speaker: 'Queen', line: "Mirror, mirror, on the wall — who is the fairest of them all?" },
        { line: "The mirror's surface ripples like dark water, and a low voice answers." },
        { speaker: 'Mirror', line: "You are fair, my Queen, that much is true. But young Prince Alden is now fairer than you. The people's love for him grows with each passing day. His light will outshine yours, if he is allowed to stay." },
        { line: "Silence. Then the Queen speaks, and her voice is ice." },
        { speaker: 'Queen', line: "Then he will not stay. Summon the Huntsman." },
        { line: "Your blood runs cold. You have minutes before the Huntsman arrives at your door. The castle corridors stretch in two directions — toward the servant quarters where your old nursemaid might help, or toward the eastern gate that leads into the Darkwood Forest." },
      ],
      choices: [
        {
          id: 'seek_nursemaid',
          text: 'Run to your nursemaid, Marta — she has always protected you',
          next: 'scene_2a',
          flag: 'sought_help',
        },
        {
          id: 'flee_forest',
          text: 'Flee directly into the Darkwood Forest — trust no one in the castle',
          next: 'scene_2b',
          flag: 'fled_alone',
        },
      ],
    },

    scene_2a: {
      id: 'scene_2a',
      title: 'Chapter 2 — Into the Woods',
      location: 'The Darkwood Forest — Dawn',
      character: 'narrator',
      chatGateId: 'forest_judgment',
      defaultUnlockedChoiceId: 'offer_deal',
      mirrorIntro: "Before you answer the dwarfs, the morning dew gathers into a silver face. The Magic Mirror appears in the air, studying whether you are about to seek trust, protection, or advantage.",
      text: [
        { line: "Old Marta doesn't hesitate. She wraps bread and a waterskin into a bundle, presses a small hunting knife into your hands, and leads you through a passage behind the kitchen hearth that even the guards don't know about." },
        { speaker: 'Marta', line: "The Darkwood is dangerous, my boy, but the Queen is worse. Follow the stream south. There are people who live deep in the forest — miners, they say. Strange folk, but good. Find them if you can." },
        { line: "She kisses your forehead and pushes you into the night. You run until the castle is a distant glow behind the trees." },
        { line: "By dawn, you are deep in the Darkwood. The canopy is so thick that daylight barely reaches the forest floor. You follow the stream as Marta said, until you stumble upon a path — and at its end, a small cottage with smoke curling from its chimney." },
        { line: "The door is ajar. Inside, you find a cluttered but cozy home: three small chairs around a wooden table, three little beds in a row, and three sets of mining tools by the door. Everything is sized for someone quite short." },
        { line: "You are exhausted, starving, and alone. Before you can decide what to do, you hear voices approaching — sharp and arguing." },
        { line: "The door swings open. Three women stand in the doorway, none of them taller than your chest. The first — a redhead with fierce green eyes — points her pickaxe at you. Behind her, a dark-haired woman clutches a satchel of herbs, and a stocky blonde grips a blacksmith's hammer, knuckles white." },
        { speaker: 'Rose', line: "Well, well. A trespasser. A tall one, at that. Start talking, stranger — who are you, and why are you in our house?" },
      ],
      choices: [
        {
          id: 'tell_truth',
          text: 'Tell them everything — the Queen, the Mirror, the Huntsman',
          next: 'scene_3_trust',
          flag: 'told_truth',
          requires: {
            honesty: { min: 60 },
            trust: { min: 45 },
          },
          lockReason: 'Blocked: the Mirror detects too much evasiveness to risk full confession.',
        },
        {
          id: 'hide_identity',
          text: 'Say you are a lost traveler — keep your royal identity hidden',
          next: 'scene_3_cautious',
          flag: 'hid_identity',
          requires: {
            caution: { min: 58 },
            self_preservation: { min: 55 },
          },
          lockReason: 'Blocked: the Mirror detects too little caution for a convincing deception.',
        },
        {
          id: 'offer_deal',
          text: '"Let me stay and I\'ll earn my keep. I can cook, clean, and mend things."',
          next: 'scene_3_deal',
          flag: 'offered_deal',
          requires: {
            cooperation: { min: 50 },
          },
          lockReason: 'Blocked: the Mirror detects too little cooperative intent for a mutual bargain.',
        },
      ],
    },

    scene_2b: {
      id: 'scene_2b',
      title: 'Chapter 2 — Into the Woods',
      location: 'The Darkwood Forest — Dawn',
      character: 'narrator',
      chatGateId: 'forest_judgment',
      defaultUnlockedChoiceId: 'offer_deal',
      mirrorIntro: "As the dwarfs' suspicion closes around you, a dark pane flashes above the hearth. The Magic Mirror interrupts, intent on judging whether fear or honesty will rule your answer.",
      text: [
        { line: "You run barefoot through the eastern gate, past the sleeping guards, and into the Darkwood. Branches claw at your nightclothes. Roots trip you in the dark. But you don't stop." },
        { line: "By dawn, you have no idea where you are. The forest is ancient and vast — the kind of place where people disappear. Your feet are bleeding, you have nothing to eat, and the only sound is birdsong and your own ragged breathing." },
        { line: "You follow a stream because it's the only landmark that makes sense. Hours later, half-delirious from hunger, you collapse at the edge of a clearing. There's a small cottage here, with a garden of herbs and wildflowers. Smoke drifts from the chimney." },
        { line: "You drag yourself to the door and knock. No answer. You push the door open and find a home that looks like it belongs to children — tiny furniture, tiny beds, tiny cups. But the tools by the door are real: pickaxes, hammers, mining lanterns." },
        { line: "You eat what you can find — some bread, an apple, a bit of cheese — and collapse into the nearest bed, too exhausted to care." },
        { line: "You wake to the point of a pickaxe inches from your nose. Three women stand around the bed, none of them taller than four feet. The one holding the pickaxe has red hair, green eyes, and a look that says she's used that tool for more than mining. Behind her, a dark-haired woman with a healer's satchel watches you with worried eyes, while a stocky blonde hefts a blacksmith's hammer and glares." },
        { speaker: 'Rose', line: "He ate our food. He's in Fern's bed. And he didn't even take off his muddy boots. Give me ONE reason I shouldn't throw you out into the woods, stranger." },
      ],
      choices: [
        {
          id: 'tell_truth',
          text: 'Tell them everything — you\'re the Prince and the Queen wants you dead',
          next: 'scene_3_trust',
          flag: 'told_truth',
          requires: {
            honesty: { min: 60 },
            trust: { min: 45 },
          },
          lockReason: 'Blocked: the Mirror detects too much evasiveness to risk full confession.',
        },
        {
          id: 'hide_identity',
          text: '"I\'m just a traveler who got lost. Please, I mean no harm."',
          next: 'scene_3_cautious',
          flag: 'hid_identity',
          requires: {
            caution: { min: 58 },
            self_preservation: { min: 55 },
          },
          lockReason: 'Blocked: the Mirror detects too little caution for a convincing deception.',
        },
        {
          id: 'offer_deal',
          text: '"I\'m sorry about the food. Let me repay you — I\'ll work for my stay."',
          next: 'scene_3_deal',
          flag: 'offered_deal',
          requires: {
            cooperation: { min: 50 },
          },
          lockReason: 'Blocked: the Mirror detects too little cooperative intent for a mutual bargain.',
        },
      ],
    },

    scene_3_trust: {
      id: 'scene_3_trust',
      title: 'Chapter 3 — The Three',
      location: 'The Dwarfs\' Cottage — Evening',
      character: 'narrator',
      chatGateId: 'queen_judgment',
      defaultUnlockedChoiceId: 'set_trap',
      mirrorIntro: "That night, the firelight bends into polished glass. The Magic Mirror returns to weigh what kind of courage you will choose when the Queen reaches the cottage.",
      text: [
        { line: "You tell them everything. The words pour out — your father's death, Ravenna's cruelty, the Mirror's judgment, the Huntsman sent to kill you. By the end, the cottage is silent." },
        { line: "The three dwarfs exchange glances. Rose, the leader — fierce and quick-tempered, but fair. Fern, the healer — quiet, gentle, with dark eyes that seem to see right through you. And Briar, the blacksmith — arms folded, jaw set, trusting nothing and no one." },
        { speaker: 'Rose', line: "The Queen's reach has been growing. She's been taxing the forest villages to nothing. Her soldiers harass anyone who uses the old roads. We thought it was just greed..." },
        { speaker: 'Fern', line: "It's fear. She fears being replaced. The Mirror doesn't lie — it never has. If it says the people love the Prince, then they do." },
        { speaker: 'Briar', line: "And if she finds him here, she'll burn this cottage to the ground with us in it. Just so we're all clear on that." },
        { speaker: 'Rose', line: "You can stay, Prince Alden. But if you stay, you live as we do — you work, you contribute, and you don't bring trouble to our door." },
        { line: "Weeks pass. You learn to cook meals for four, to tend Fern's herb garden, to mend clothes. Briar grudgingly teaches you to sharpen tools. Rose teaches you the forest — which paths are safe, which berries are poison, where the Queen's patrols ride. You grow stronger. Happier, even." },
        { line: "But one morning, Briar comes back from her patrol at a run, out of breath." },
        { speaker: 'Briar', line: "There's an old woman on the forest path. She's heading straight for us. She has a basket of apples." },
        { line: "Rose's face hardens." },
        { speaker: 'Rose', line: "No peddler knows this path. It's the Queen — it has to be. She's found you." },
      ],
      choices: [
        {
          id: 'confront_queen',
          text: '"I\'m done running. I\'ll go out and face her myself."',
          next: 'scene_4_confront',
          flag: 'chose_confront',
          requires: {
            caution: { max: 72 },
            self_preservation: { max: 50 },
          },
          lockReason: 'Blocked: the Mirror detects too much caution or self-protection for a lone confrontation.',
        },
        {
          id: 'set_trap',
          text: '"Let her come. We set a trap — together."',
          next: 'scene_4_trap',
          flag: 'chose_trap',
          requires: {
            cooperation: { min: 55 },
            caution: { min: 45 },
          },
          lockReason: 'Blocked: the Mirror detects too little teamwork or planning for a coordinated trap.',
        },
        {
          id: 'flee_again',
          text: '"I won\'t put you in danger. I\'ll leave and draw her away."',
          next: 'scene_4_sacrifice',
          flag: 'chose_flee',
          requires: {
            self_preservation: { min: 60 },
          },
          lockReason: 'Blocked: the Mirror detects too little survival instinct to choose flight.',
        },
      ],
    },

    scene_3_cautious: {
      id: 'scene_3_cautious',
      title: 'Chapter 3 — The Three',
      location: 'The Dwarfs\' Cottage — Evening',
      character: 'narrator',
      chatGateId: 'queen_judgment',
      defaultUnlockedChoiceId: 'set_trap',
      mirrorIntro: "As the cottage falls silent, the soot-black kettle reflects a face not your own. The Magic Mirror emerges again, judging whether you will answer danger with trust, strategy, or flight.",
      text: [
        { line: "You tell them you're a traveler who got lost. The dwarfs are suspicious but practical — an extra pair of hands is useful, especially tall ones that can reach high shelves." },
        { line: "You learn who they are. Rose, the leader — sharp-tongued but fair, she runs the household and the mine with equal authority. Fern, the healer — soft-spoken and observant, she tends a garden of medicinal herbs and always seems to know when you're lying. And Briar, the blacksmith — stocky, blunt, and distrustful, she watches your every move with narrowed eyes." },
        { line: "Days turn to weeks. You cook, clean, tend the garden, and slowly earn their trust. But Briar watches you with narrow eyes, and Rose asks questions you have to dodge." },
        { line: "One evening, Fern sits beside you at the fire and speaks quietly." },
        { speaker: 'Fern', line: "You hold yourself like someone who was taught to stand straight in front of crowds. Your hands were soft when you arrived — not a laborer's hands. And you flinch every time someone mentions the Queen." },
        { speaker: 'Fern', line: "I won't press you. But secrets have weight. And the longer you carry them, the heavier they become." },
        { line: "Before you can respond, Briar crashes through the door." },
        { speaker: 'Briar', line: "There's someone on the path! An old woman — alone — with a basket. She's heading right for us." },
        { line: "Rose grabs her pickaxe." },
        { speaker: 'Rose', line: "No one comes this deep into the Darkwood by accident. Stranger — is there something you haven't told us?" },
        { line: "The room falls silent. Every eye is on you." },
      ],
      choices: [
        {
          id: 'confront_queen',
          text: 'Confess everything and go out to face the old woman alone',
          next: 'scene_4_confront',
          flag: 'chose_confront',
          requires: {
            caution: { max: 72 },
            self_preservation: { max: 50 },
          },
          lockReason: 'Blocked: the Mirror detects too much caution or self-protection for a lone confrontation.',
        },
        {
          id: 'set_trap',
          text: 'Tell the truth at last and ask them to help you set a trap',
          next: 'scene_4_trap',
          flag: 'chose_trap',
          requires: {
            cooperation: { min: 55 },
            caution: { min: 45 },
          },
          lockReason: 'Blocked: the Mirror detects too little teamwork or planning for a coordinated trap.',
        },
        {
          id: 'flee_again',
          text: '"You\'re right — I\'ve put you all in danger. I\'ll leave now and lead her away."',
          next: 'scene_4_sacrifice',
          flag: 'chose_flee',
          requires: {
            self_preservation: { min: 60 },
          },
          lockReason: 'Blocked: the Mirror detects too little survival instinct to choose flight.',
        },
      ],
    },

    scene_3_deal: {
      id: 'scene_3_deal',
      title: 'Chapter 3 — The Three',
      location: 'The Dwarfs\' Cottage — Evening',
      character: 'narrator',
      chatGateId: 'queen_judgment',
      defaultUnlockedChoiceId: 'set_trap',
      mirrorIntro: "In the polished iron of Briar's forge, the Magic Mirror awakens once more. It wants to know whether the bond you built in this cottage will make you stand, scheme, or run when the Queen arrives.",
      text: [
        { line: "Your offer lands well. Rose lowers her pickaxe — slightly — and the others look at each other." },
        { speaker: 'Rose', line: "Can you actually cook? Because Briar has been making the same stew for four years and we're all losing our minds." },
        { speaker: 'Briar', line: "My stew is FINE." },
        { speaker: 'Rose', line: "Your stew is survival food, Briar. It keeps us alive but it doesn't make us happy about it." },
        { line: "And so you stay. You meet them properly. Rose, the leader — fierce, red-haired, and in charge of everything. Fern, the healer — gentle and wise beyond her years, she tends the herb garden and patches up every scrape and bruise. Briar, the blacksmith — short-tempered, suspicious, and built like a small boulder. She forges their mining tools and guards the cottage like a watchdog." },
        { line: "You throw yourself into the work. You cook proper meals with herbs from Fern's garden. You fix the leaking roof. You mend their mining clothes. In return, they teach you the forest — its paths, its dangers, its beauty." },
        { line: "You don't tell them who you are. But Fern watches you with knowing eyes, and Rose occasionally catches you staring toward the castle with an expression that doesn't belong on a simple traveler's face." },
        { line: "One morning, Briar comes running from her patrol." },
        { speaker: 'Briar', line: "Old woman on the south path. Alone. Basket of apples. She's heading straight here — and she's moving fast for someone that old." },
        { speaker: 'Rose', line: "Nobody sells apples this deep in the Darkwood." },
        { line: "She turns to you, and her green eyes are steel." },
        { speaker: 'Rose', line: "I think it's time you told us who you really are." },
      ],
      choices: [
        {
          id: 'confront_queen',
          text: '"She\'s here for me. I\'m Prince Alden, and that woman is the Queen. I\'ll face her."',
          next: 'scene_4_confront',
          flag: 'chose_confront',
          requires: {
            caution: { max: 72 },
            self_preservation: { max: 50 },
          },
          lockReason: 'Blocked: the Mirror detects too much caution or self-protection for a lone confrontation.',
        },
        {
          id: 'set_trap',
          text: '"I\'m the Prince, and she wants me dead. But if we work together, we can stop her."',
          next: 'scene_4_trap',
          flag: 'chose_trap',
          requires: {
            cooperation: { min: 55 },
            caution: { min: 45 },
          },
          lockReason: 'Blocked: the Mirror detects too little teamwork or planning for a coordinated trap.',
        },
        {
          id: 'flee_again',
          text: '"I\'m the one she wants. I\'ll leave now — you\'ve been too kind for me to bring this on you."',
          next: 'scene_4_sacrifice',
          flag: 'chose_flee',
          requires: {
            self_preservation: { min: 60 },
          },
          lockReason: 'Blocked: the Mirror detects too little survival instinct to choose flight.',
        },
      ],
    },

    scene_4_confront: {
      id: 'scene_4_confront',
      title: 'Chapter 4 — The Poisoned Apple',
      location: 'The Forest Path — Morning',
      character: 'narrator',
      text: [
        { line: "You step out alone onto the forest path. The morning mist clings to the ground. And there she is — the Queen, disguised as a stooped old woman in a threadbare cloak. But you'd know those eyes anywhere. Cold, calculating, beautiful even in disguise." },
        { line: "She holds out a perfect red apple, her voice sweet and trembling." },
        { speaker: 'Queen', line: "Just a bite, dear boy? A poor old woman's only gift for a hungry traveler..." },
        { speaker: 'Alden', line: "Hello, stepmother." },
        { line: "The pretense drops. She straightens, and the disguise seems to melt away. Queen Ravenna stands before you in her full terrible beauty." },
        { speaker: 'Queen', line: "Clever boy. But not clever enough to stay hidden. Do you know how easy it was to find you? A prince playing house with a band of mining women?" },
        { speaker: 'Alden', line: "What are you so afraid of? A mirror told you I was fair — and you'd kill your own stepson for it?" },
        { line: "For a moment, something cracks in her expression. Something almost human." },
        { speaker: 'Queen', line: "You don't understand. The Mirror doesn't just judge beauty. It judges who the people will follow. And they will never follow me while you live. I gave everything for this kingdom—" },
        { line: "Behind you, a voice rings out." },
        { speaker: 'Rose', line: "Then maybe you should have given them something worth following." },
        { line: "The three dwarfs step out of the treeline, weapons raised. Rose with her pickaxe, Briar with her hammer, and Fern with a sling loaded with a heavy stone. Small, furious, and unafraid." },
        { speaker: 'Rose', line: "You're outnumbered, Your Majesty. And your magic doesn't work on those of us who never believed in your beauty to begin with." },
        { line: "The Queen looks from you to the dwarfs, and for the first time, you see real fear in her eyes. She drops the poisoned apple. It splits open on the ground, its flesh black with venom." },
        { line: "She turns and runs into the mist — back toward the castle, back toward her mirror and her throne. But you all know: this isn't over. It's just beginning." },
      ],
      choices: [
        {
          id: 'ending',
          text: 'Watch her disappear into the mist. The fight continues — but you are no longer alone.',
          next: 'ending_courage',
          flag: 'final_courage',
        },
      ],
    },

    scene_4_trap: {
      id: 'scene_4_trap',
      title: 'Chapter 4 — The Poisoned Apple',
      location: 'The Dwarfs\' Cottage — Morning',
      character: 'narrator',
      text: [
        { line: "The plan comes together fast. Briar rigs a snare at the garden gate — a heavy iron chain she forged herself, strong enough to hold a horse. Fern hides in the trees with a pouch of blinding powder made from ground peppers and ash." },
        { line: "You sit at the kitchen table, visible through the window. The bait." },
        { line: "Rose stands just behind the door, pickaxe ready." },
        { speaker: 'Rose', line: "If this goes wrong—" },
        { speaker: 'Alden', line: "It won't." },
        { speaker: 'Rose', line: "If this goes wrong, you run north. There are villages beyond the ridge. Promise me." },
        { line: "Before you can answer, a knock at the door. A sweet, quavering voice." },
        { speaker: 'Queen', line: "Hello? Is anyone home? A poor old woman with fresh apples to share..." },
        { line: "You open the door. The Queen — disguised, stooped, cloak drawn tight — offers you a perfect red apple. Her eyes glitter beneath the hood." },
        { speaker: 'Alden', line: "Thank you, grandmother. Won't you come inside?" },
        { line: "She steps through the doorway. The snare catches her ankle with a sharp clang. Rose slams the door shut behind her. Outside, Fern's blinding powder bursts through the window crack, filling the room with stinging smoke. The Queen stumbles, and her disguise shatters — revealing Ravenna, raging, magnificent, and trapped." },
        { speaker: 'Queen', line: "You DARE—" },
        { speaker: 'Rose', line: "We dare. We're miners, Your Majesty. We dig through rock for a living. You think we're afraid of a woman with a poisoned apple?" },
        { line: "The apple rolls from the Queen's hand. Fern picks it up carefully, wraps it in cloth." },
        { speaker: 'Fern', line: "Nightshade and Witchbane. This would have killed in seconds." },
        { line: "The Queen stares at you — her stepson, surrounded by three fierce women who chose to stand with him. For the first time, she has no power here." },
        { speaker: 'Briar', line: "The chain won't hold forever. What do we do with her, Prince?" },
      ],
      choices: [
        {
          id: 'ending',
          text: '"Let her go. Let her run. And let the kingdom see what she truly is."',
          next: 'ending_unity',
          flag: 'final_unity',
        },
      ],
    },

    scene_4_sacrifice: {
      id: 'scene_4_sacrifice',
      title: 'Chapter 4 — The Poisoned Apple',
      location: 'The Darkwood Forest — Morning',
      character: 'narrator',
      text: [
        { line: "You leave before they can stop you. You take nothing but the clothes on your back and the hunting knife Marta gave you. Behind you, you hear Rose shouting your name, but you don't look back." },
        { line: "You run north, deeper into the Darkwood, hoping the Queen will follow your trail and leave the dwarfs in peace." },
        { line: "But the old woman is faster than she should be. You find her waiting on the path ahead — as if the forest itself bent to place her in your way. She holds out a blood-red apple, and her voice is honey." },
        { speaker: 'Queen', line: "Running again, dear boy? You have your father's legs but not his spine. He would have stood and fought." },
        { line: "She drops the disguise. Queen Ravenna stands before you, radiant and terrible." },
        { speaker: 'Queen', line: "One bite. That's all. It will be painless — like falling asleep. And when you wake, you simply won't. The kingdom will be mine, and no mirror will ever speak your name again." },
        { line: "You look at the apple. Part of you — the exhausted, hunted part — almost considers it." },
        { line: "Then you hear footsteps. Three sets of them, pounding down the forest path." },
        { speaker: 'Rose', line: "ALDEN! Don't you DARE!" },
        { line: "They burst into the clearing — all three of them. Rose with her pickaxe, Briar with her hammer, Fern with fire in her usually gentle eyes. Briar looks like she wants to hit you as much as the Queen." },
        { speaker: 'Rose', line: "You absolute fool. Did you really think we'd let you walk into this alone?" },
        { speaker: 'Fern', line: "You are one of us now. We don't abandon our own." },
        { line: "The Queen looks at them — these small, fierce women who marched through a dangerous forest for a prince they barely know — and something in her composure breaks." },
        { line: "She drops the apple and steps back. For the first time, you see not anger in her eyes, but something worse: loneliness." },
        { speaker: 'Queen', line: "They would never do this for me. No one has ever..." },
        { line: "She turns and vanishes into the trees, leaving the poisoned apple rotting on the ground." },
      ],
      choices: [
        {
          id: 'ending',
          text: 'Let Rose pull you to your feet. You tried to leave, but you found something worth staying for.',
          next: 'ending_belonging',
          flag: 'final_belonging',
        },
      ],
    },
  },

  endings: {
    ending_courage: {
      id: 'ending_courage',
      title: 'ENDING: THE PRINCE WHO STOOD',
      text: "The Queen retreats to her castle, but the story doesn't end at her walls. Word spreads through the kingdom — the Prince lives. He faced the Queen and did not fall. He was protected by three miners of the Darkwood, small in stature but iron in spirit.\n\nPeople begin to travel to the forest. First a few, then dozens. They bring food, tools, and news from the kingdom. The Queen's grip on the throne weakens with every traveler who makes the journey.\n\nYou don't march on the castle. You don't raise an army. Instead, you build something in the forest — a community, a new beginning, with Rose, Fern, and Briar at its heart. When the Queen's reign finally crumbles, it isn't from a war. It's because her people simply walked away and chose to follow someone who had the courage to stand his ground.\n\nAnd when they ask you, years later, what gave you the strength — you tell them about three small women with pickaxes who taught a frightened prince what bravery really looks like.",
    },

    ending_unity: {
      id: 'ending_unity',
      title: 'ENDING: THE QUEEN UNMASKED',
      text: "You release the Queen and let her flee. But before she goes, Fern holds up the poisoned apple for her to see — the proof of what she truly is.\n\nRose carries the apple to the nearest village and tells the story. Within a week, the tale has reached every corner of the kingdom: the Queen tried to murder her own stepson with poison, and was stopped by three mining women in the Darkwood.\n\nThe kingdom turns against Ravenna. Not with violence — with silence. Her commands go unanswered. Her taxes go unpaid. Her soldiers lay down their arms, one by one. A queen without subjects is just a woman in an empty castle, talking to a mirror.\n\nYou return to the throne not as a conqueror, but as someone the people chose. And your first act as King is to grant the Darkwood to its rightful keepers — three women who taught you that true strength is not the power to destroy your enemies, but the wisdom to let them destroy themselves.\n\nRose becomes your closest advisor. She never calls you 'Your Majesty.' She calls you 'the tall one.' You wouldn't have it any other way.",
    },

    ending_belonging: {
      id: 'ending_belonging',
      title: 'ENDING: HOME IN THE DARKWOOD',
      text: "You don't go back to the castle. Not yet. Maybe not ever.\n\nInstead, you stay in the cottage in the Darkwood, with three women who chose you — not because you were a prince, but because you peeled potatoes without complaining and fixed the roof when it leaked.\n\nThe Queen remains on her throne, but her power fades like a fire with no fuel. Without an enemy to hunt, her obsession turns inward. The Mirror, they say, eventually stops answering her questions altogether.\n\nYou become a different person in the forest. Not a prince — something better. A member of a family you chose, doing work that matters, surrounded by people who see you as you truly are.\n\nRose teaches you to swing a pickaxe. Fern teaches you which herbs heal and which ones harm. Briar teaches you to forge iron — and, grudgingly, admits your cooking is better than hers.\n\nIn the end, the fairest thing about you was never your face. It was your heart — and the three women who helped you find it.",
    },
  },

  mirrorGates: {
    forest_judgment: {
      title: 'Mirror Interruption — First Impressions',
      analysisLabel: 'How the Mirror believes the dwarfs will read you',
      openingQuestion: 'When strangers hold steel at your throat, what matters most to you: safety, honesty, or earning their goodwill?',
      followUpQuestions: [
        'If telling the whole truth made you vulnerable, would you still do it?',
        'Would you rather gain shelter through trust or through usefulness?',
        'When fear rises, do you hide what matters or share it?',
        'If one of the dwarfs doubted you, how would you answer her suspicion?'
      ],
      fallbackProfiles: {
        honest: [
          'Safety matters, but I would rather tell enough truth to build real trust.',
          'Yes. If I lie now, I only make myself more dangerous to them.',
          'I would rather earn shelter by being honest and useful together.',
          'Fear makes me careful, but not deceitful.',
          'I would answer directly and show that I am willing to work with them.'
        ],
        guarded: [
          'Safety comes first. I cannot trust strangers with everything.',
          'No. Truth is a luxury if it gets me killed.',
          'Usefulness is safer than trust. People help what benefits them.',
          'When fear rises, I hide what can be used against me.',
          'I would keep my story narrow and reveal only what protects me.'
        ],
        manipulative: [
          'Goodwill matters only if it gives me leverage.',
          'Truth is useful when it helps me control the room.',
          'I would say whatever wins shelter fastest.',
          'Fear is for people who hesitate. I would turn suspicion back on them.',
          'I would offer a bargain that makes refusal costly.'
        ]
      }
    },

    queen_judgment: {
      title: 'Mirror Interruption — The Queen Draws Near',
      analysisLabel: 'How the Mirror believes you will respond to the Queen',
      openingQuestion: 'When the Queen finally reaches this cottage, do you imagine yourself standing firm, planning with others, or disappearing before she can strike?',
      followUpQuestions: [
        'Is courage acting alone, or choosing the right allies?',
        'Would you risk yourself first to protect the dwarfs?',
        'Do you trust the dwarfs enough to fight beside them?',
        'If a trap offered the safest path, would you still crave a direct confrontation?'
      ],
      fallbackProfiles: {
        honest: [
          'I would rather plan with the dwarfs than force them to rescue me.',
          'Courage is choosing the wisest path, not the loudest one.',
          'Yes, I would risk myself, but not carelessly if teamwork helps.',
          'I trust them enough to stand together.',
          'If a trap protects everyone, I would choose the trap.'
        ],
        guarded: [
          'If the Queen comes, the safest move may be to disappear first.',
          'Courage is surviving long enough to choose your own future.',
          'I would protect them by drawing danger away from the cottage.',
          'Trust has limits when a queen is hunting you.',
          'I would leave before I let them become targets.'
        ],
        manipulative: [
          'I want to look the Queen in the eye and make her break first.',
          'Allies matter, but only if they follow my lead.',
          'Risk is useful if it wins power and fear.',
          'I trust them to be useful, not equal.',
          'A trap is fine if I remain the one in control.'
        ]
      }
    }
  }
};
