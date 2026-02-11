// ===== GAME ENGINE =====

const GameEngine = (() => {
  // --- State ---
  const state = {
    currentScene: null,
    choiceHistory: [],  // [{sceneId, choiceId, choiceText}]
    flags: {},          // arbitrary flags set by choices
  };

  // --- DOM References ---
  const dom = {
    titleScreen:   document.getElementById('title-screen'),
    gameScreen:    document.getElementById('game-screen'),
    endingScreen:  document.getElementById('ending-screen'),
    startBtn:      document.getElementById('start-btn'),
    restartBtn:    document.getElementById('restart-btn'),
    sceneTitle:    document.getElementById('scene-title'),
    sceneLocation: document.getElementById('scene-location'),
    characterLabel:document.getElementById('character-label'),
    storyText:     document.getElementById('story-text'),
    choicesArea:   document.getElementById('choices-area'),
    endingTitle:   document.getElementById('ending-title'),
    endingText:    document.getElementById('ending-text'),
    endingSummary: document.getElementById('ending-choices-summary'),
  };

  // --- Typewriter ---
  let typewriterTimer = null;
  const CHAR_DELAY = 20; // ms per character

  function typewrite(element, text, callback) {
    // Clear any running typewriter
    if (typewriterTimer) clearInterval(typewriterTimer);

    element.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    let i = 0;
    typewriterTimer = setInterval(() => {
      if (i < text.length) {
        // Handle newlines
        if (text[i] === '\n') {
          element.appendChild(document.createElement('br'));
        } else {
          element.appendChild(document.createTextNode(text[i]));
        }
        // Keep cursor at end
        if (element.contains(cursor)) element.removeChild(cursor);
        element.appendChild(cursor);
        i++;
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        // Remove cursor after a short pause
        setTimeout(() => {
          if (element.contains(cursor)) element.removeChild(cursor);
          if (callback) callback();
        }, 400);
      }
    }, CHAR_DELAY);
  }

  // --- Scene Rendering ---
  function showScreen(screen) {
    dom.titleScreen.classList.add('hidden');
    dom.gameScreen.classList.add('hidden');
    dom.endingScreen.classList.add('hidden');
    screen.classList.remove('hidden');
  }

  function renderScene(sceneId) {
    const scene = StoryData.scenes[sceneId];
    if (!scene) {
      console.error('Scene not found:', sceneId);
      return;
    }

    state.currentScene = sceneId;
    showScreen(dom.gameScreen);

    // Update top bar
    dom.sceneTitle.textContent = scene.title;
    dom.sceneLocation.textContent = scene.location;

    // Update character label
    dom.characterLabel.textContent = scene.character.toUpperCase();
    dom.characterLabel.className = scene.character;

    // Clear choices while typing
    dom.choicesArea.innerHTML = '';

    // Build full scene text from dialogue lines
    const fullText = buildSceneText(scene);

    // Typewrite the text, then show choices
    typewrite(dom.storyText, fullText, () => {
      renderChoices(scene.choices);
    });
  }

  function buildSceneText(scene) {
    if (typeof scene.text === 'string') {
      return scene.text;
    }
    // Support array of dialogue lines
    if (Array.isArray(scene.text)) {
      return scene.text.map(line => {
        if (line.speaker) {
          return `[${line.speaker.toUpperCase()}]: ${line.line}`;
        }
        return line.line || line;
      }).join('\n\n');
    }
    return '';
  }

  function renderChoices(choices) {
    dom.choicesArea.innerHTML = '';

    // If this is a dynamic scene, resolve the choices
    const resolvedChoices = resolveChoices(choices);

    resolvedChoices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      const keyLabel = String.fromCharCode(65 + index); // A, B, C...
      btn.innerHTML = `<span class="choice-key">[${keyLabel}]</span> ${choice.text}`;
      btn.addEventListener('click', () => makeChoice(choice));
      dom.choicesArea.appendChild(btn);
    });
  }

  function resolveChoices(choices) {
    // Filter choices based on conditions (if any)
    return choices.filter(choice => {
      if (!choice.condition) return true;
      return choice.condition(state.flags);
    });
  }

  // --- Choice Handling ---
  function makeChoice(choice) {
    // Record the choice
    state.choiceHistory.push({
      sceneId: state.currentScene,
      choiceId: choice.id,
      choiceText: choice.text,
    });

    // Set any flags
    if (choice.flag) {
      state.flags[choice.flag] = true;
    }

    // Determine next scene
    let nextScene = choice.next;

    // Support dynamic next (function)
    if (typeof nextScene === 'function') {
      nextScene = nextScene(state.flags);
    }

    // Check if it's an ending
    if (nextScene.startsWith('ending_')) {
      showEnding(nextScene);
    } else {
      renderScene(nextScene);
    }
  }

  // --- Endings ---
  function showEnding(endingId) {
    const ending = StoryData.endings[endingId];
    if (!ending) {
      console.error('Ending not found:', endingId);
      return;
    }

    showScreen(dom.endingScreen);
    dom.endingTitle.textContent = ending.title;
    dom.endingText.textContent = ending.text;

    // Show choice summary
    let summary = '<h3>YOUR PATH</h3>';
    state.choiceHistory.forEach(entry => {
      summary += `<div>&gt; ${entry.choiceText}</div>`;
    });
    dom.endingSummary.innerHTML = summary;
  }

  // --- Init ---
  function init() {
    dom.startBtn.addEventListener('click', () => {
      resetState();
      renderScene('scene_1');
    });

    dom.restartBtn.addEventListener('click', () => {
      resetState();
      showScreen(dom.titleScreen);
    });
  }

  function resetState() {
    state.currentScene = null;
    state.choiceHistory = [];
    state.flags = {};
  }

  // Start the engine
  init();

  // Public API (for debugging)
  return { state, renderScene };
})();
