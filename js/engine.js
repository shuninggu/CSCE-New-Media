// ===== GAME ENGINE =====

const GameEngine = (() => {
  const state = {
    currentScene: null,
    choiceHistory: [],
    flags: {},
    chatPhaseActive: false,
    currentGateId: null,
    chatHistory: [],
    analysisResultByGate: {},
    mirrorBusy: false,
    mirrorError: '',
  };

  const dom = {
    titleScreen: document.getElementById('title-screen'),
    gameScreen: document.getElementById('game-screen'),
    endingScreen: document.getElementById('ending-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    sceneTitle: document.getElementById('scene-title'),
    sceneLocation: document.getElementById('scene-location'),
    characterLabel: document.getElementById('character-label'),
    storyText: document.getElementById('story-text'),
    choicesArea: document.getElementById('choices-area'),
    endingTitle: document.getElementById('ending-title'),
    endingText: document.getElementById('ending-text'),
    endingSummary: document.getElementById('ending-choices-summary'),
    mirrorPanel: document.getElementById('mirror-panel'),
    mirrorGateTitle: document.getElementById('mirror-gate-title'),
    mirrorStatus: document.getElementById('mirror-status'),
    mirrorChatLog: document.getElementById('mirror-chat-log'),
    mirrorInput: document.getElementById('mirror-input'),
    mirrorSendBtn: document.getElementById('mirror-send-btn'),
    mirrorJudgment: document.getElementById('mirror-judgment'),
    mirrorPersona: document.getElementById('mirror-persona'),
    mirrorReasoning: document.getElementById('mirror-reasoning'),
    mirrorTraits: document.getElementById('mirror-traits'),
  };

  let typewriterTimer = null;
  const CHAR_DELAY = 20;

  function typewrite(element, text, callback) {
    if (typewriterTimer) clearInterval(typewriterTimer);

    element.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    let i = 0;
    typewriterTimer = setInterval(() => {
      if (i < text.length) {
        if (text[i] === '\n') {
          element.appendChild(document.createElement('br'));
        } else {
          element.appendChild(document.createTextNode(text[i]));
        }
        if (element.contains(cursor)) element.removeChild(cursor);
        element.appendChild(cursor);
        i++;
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        setTimeout(() => {
          if (element.contains(cursor)) element.removeChild(cursor);
          if (callback) callback();
        }, 400);
      }
    }, CHAR_DELAY);
  }

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
    state.chatPhaseActive = false;
    state.currentGateId = null;
    state.chatHistory = [];
    state.mirrorBusy = false;
    state.mirrorError = '';

    showScreen(dom.gameScreen);
    hideMirrorPanel();

    dom.sceneTitle.textContent = scene.title;
    dom.sceneLocation.textContent = scene.location;
    dom.characterLabel.textContent = scene.character.toUpperCase();
    dom.characterLabel.className = scene.character;
    dom.choicesArea.innerHTML = '';

    const fullText = buildSceneText(scene);

    typewrite(dom.storyText, fullText, () => {
      if (scene.chatGateId) {
        beginMirrorGate(scene);
      } else {
        renderChoices(scene);
      }
    });
  }

  function buildSceneText(scene) {
    if (typeof scene.text === 'string') return scene.text;
    if (Array.isArray(scene.text)) {
      return scene.text.map((line) => {
        if (line.speaker) return `[${line.speaker.toUpperCase()}]: ${line.line}`;
        return line.line || line;
      }).join('\n\n');
    }
    return '';
  }

  function beginMirrorGate(scene) {
    const gateId = scene.chatGateId;
    const gate = StoryData.mirrorGates[gateId];

    state.chatPhaseActive = true;
    state.currentGateId = gateId;
    state.chatHistory = MirrorOracle.createOpeningConversation(scene);
    state.mirrorError = '';

    dom.choicesArea.innerHTML = '';
    dom.mirrorGateTitle.textContent = gate.title;
    dom.mirrorInput.value = '';
    dom.mirrorInput.disabled = false;
    dom.mirrorSendBtn.disabled = false;
    dom.mirrorJudgment.classList.add('hidden');
    updateMirrorStatus('Speak with the Mirror. Five replies will trigger its judgment.');
    renderMirrorChat();
    showMirrorPanel();
    MirrorLive2D.onMirrorOpen();
  }

  function showMirrorPanel() {
    dom.mirrorPanel.classList.remove('hidden');
  }

  function hideMirrorPanel() {
    MirrorLive2D.onMirrorClose();
    dom.mirrorPanel.classList.add('hidden');
    dom.mirrorJudgment.classList.add('hidden');
    dom.mirrorChatLog.innerHTML = '';
    dom.mirrorStatus.textContent = '';
    dom.mirrorInput.value = '';
    dom.mirrorInput.disabled = false;
    dom.mirrorSendBtn.disabled = false;
  }

  function renderMirrorChat() {
    dom.mirrorChatLog.innerHTML = '';
    state.chatHistory.forEach((entry) => {
      const item = document.createElement('div');
      item.className = `mirror-message ${entry.role}`;
      item.innerHTML = `
        <div class="mirror-speaker">${entry.role === 'assistant' ? 'Magic Mirror' : 'Alden'}</div>
        <div>${entry.content}</div>
      `;
      dom.mirrorChatLog.appendChild(item);
    });
    dom.mirrorChatLog.scrollTop = dom.mirrorChatLog.scrollHeight;
  }

  function updateMirrorStatus(text, isError = false) {
    dom.mirrorStatus.textContent = text;
    dom.mirrorStatus.classList.toggle('error', isError);
  }

  async function handleMirrorSend() {
    if (state.mirrorBusy || !state.chatPhaseActive) return;

    const input = dom.mirrorInput.value.trim();
    if (!input) return;

    state.chatHistory.push({ role: 'user', content: input });
    dom.mirrorInput.value = '';
    renderMirrorChat();

    const userReplyCount = state.chatHistory.filter((entry) => entry.role === 'user').length;
    if (userReplyCount >= MirrorOracle.maxPlayerReplies) {
      await finalizeMirrorJudgment();
      return;
    }

    state.mirrorBusy = true;
    MirrorLive2D.onThinking();
    dom.mirrorSendBtn.disabled = true;
    dom.mirrorInput.disabled = true;
    updateMirrorStatus('The Mirror studies your words...');

    const scene = StoryData.scenes[state.currentScene];

    try {
      const nextQuestion = await MirrorOracle.getNextQuestion({
        gateId: state.currentGateId,
        scene,
        conversation: state.chatHistory,
      });
      state.chatHistory.push({ role: 'assistant', content: nextQuestion.message });
      MirrorLive2D.onResponse();
      if (nextQuestion.source === 'llm') {
        updateMirrorStatus('The Mirror answers with a brighter silver than before.');
      } else {
        updateMirrorStatus('The Mirror is silent. Falling back to its old riddles.', true);
      }
    } catch (error) {
      console.error('Mirror question failed:', error);
      state.mirrorError = 'The Mirror is silent. Falling back to its old riddles.';
      const fallbackQuestion = MirrorOracle.getFallbackQuestion(state.currentGateId, state.chatHistory);
      state.chatHistory.push({ role: 'assistant', content: fallbackQuestion });
      MirrorLive2D.onResponse();
      updateMirrorStatus(state.mirrorError, true);
    } finally {
      state.mirrorBusy = false;
      dom.mirrorSendBtn.disabled = false;
      dom.mirrorInput.disabled = false;
      dom.mirrorInput.focus();
      renderMirrorChat();
    }
  }

  async function finalizeMirrorJudgment() {
    state.mirrorBusy = true;
    dom.mirrorSendBtn.disabled = true;
    dom.mirrorInput.disabled = true;
    updateMirrorStatus('The Mirror is judging your nature...');

    try {
      const analysis = await MirrorOracle.analyzeConversation({
        gateId: state.currentGateId,
        conversation: state.chatHistory,
      });
      state.analysisResultByGate[state.currentGateId] = analysis;
      renderJudgment(analysis);
      MirrorLive2D.onJudgment();
      state.chatPhaseActive = false;
      renderChoices(StoryData.scenes[state.currentScene]);
      if (analysis.source === 'llm') {
        updateMirrorStatus('The Mirror speaks in a clearer voice, as if the glass remembered you.');
      } else {
        updateMirrorStatus('Judgment complete via fallback analysis.', true);
      }
    } catch (error) {
      console.error('Mirror analysis failed:', error);
      const fallback = MirrorOracle.getFallbackAnalysis({
        gateId: state.currentGateId,
        conversation: state.chatHistory,
      });
      state.analysisResultByGate[state.currentGateId] = fallback;
      renderJudgment(fallback);
      MirrorLive2D.onJudgment();
      state.chatPhaseActive = false;
      renderChoices(StoryData.scenes[state.currentScene]);
      updateMirrorStatus('Judgment complete via fallback analysis.', true);
    } finally {
      state.mirrorBusy = false;
      dom.mirrorSendBtn.disabled = true;
      dom.mirrorInput.disabled = true;
    }
  }

  function renderJudgment(analysis) {
    const gate = StoryData.mirrorGates[state.currentGateId];
    dom.mirrorPersona.textContent = `${gate.analysisLabel}: ${formatPersona(analysis.persona)}`;
    dom.mirrorReasoning.textContent = analysis.reasoning;
    dom.mirrorTraits.innerHTML = '';

    Object.entries(analysis.traits).forEach(([trait, value]) => {
      const row = document.createElement('div');
      row.className = 'trait-row';
      row.innerHTML = `
        <span>${formatTraitName(trait)}</span>
        <div class="trait-bar"><div class="trait-fill" style="width: ${value}%"></div></div>
        <strong>${value}</strong>
      `;
      dom.mirrorTraits.appendChild(row);
    });

    dom.mirrorJudgment.classList.remove('hidden');
  }

  function resolveChoices(scene) {
    const baseChoices = scene.choices.filter((choice) => {
      if (!choice.condition) return true;
      return choice.condition(state.flags);
    });

    const analysis = scene.chatGateId ? state.analysisResultByGate[scene.chatGateId] : null;
    const resolved = baseChoices.map((choice) => {
      if (!analysis) {
        return { ...choice, isAvailable: true, gateReason: '' };
      }
      const result = MirrorOracle.evaluateChoice(choice, analysis);
      return { ...choice, isAvailable: result.allowed, gateReason: result.reason };
    });

    if (analysis && !resolved.some((choice) => choice.isAvailable)) {
      const fallbackChoiceId = scene.defaultUnlockedChoiceId || resolved[0]?.id;
      return resolved.map((choice) => {
        if (choice.id === fallbackChoiceId) {
          return {
            ...choice,
            isAvailable: true,
            gateReason: 'Unlocked by fallback to keep the story moving.',
            fallbackUnlock: true,
          };
        }
        return choice;
      });
    }

    return resolved;
  }

  function renderChoices(scene) {
    dom.choicesArea.innerHTML = '';

    const resolvedChoices = resolveChoices(scene);

    resolvedChoices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = `choice-btn${choice.isAvailable ? '' : ' locked'}`;
      btn.disabled = !choice.isAvailable;
      const keyLabel = String.fromCharCode(65 + index);
      btn.innerHTML = `
        <span class="choice-key">[${keyLabel}]</span>
        <span class="choice-copy">${choice.text}</span>
        ${choice.isAvailable ? '' : `<span class="choice-lock-reason">${choice.gateReason}</span>`}
        ${choice.fallbackUnlock ? '<span class="choice-lock-reason fallback-note">Fallback path opened to avoid a dead end.</span>' : ''}
      `;
      if (choice.isAvailable) {
        btn.addEventListener('click', () => makeChoice(choice));
      }
      dom.choicesArea.appendChild(btn);
    });
  }

  function makeChoice(choice) {
    state.choiceHistory.push({
      sceneId: state.currentScene,
      choiceId: choice.id,
      choiceText: choice.text,
    });

    if (choice.flag) state.flags[choice.flag] = true;

    let nextScene = choice.next;
    if (typeof nextScene === 'function') nextScene = nextScene(state.flags);

    if (nextScene.startsWith('ending_')) {
      showEnding(nextScene);
    } else {
      renderScene(nextScene);
    }
  }

  function showEnding(endingId) {
    const ending = StoryData.endings[endingId];
    if (!ending) {
      console.error('Ending not found:', endingId);
      return;
    }

    showScreen(dom.endingScreen);
    hideMirrorPanel();
    dom.endingTitle.textContent = ending.title;
    dom.endingText.textContent = ending.text;

    let summary = '<h3>YOUR PATH</h3>';
    state.choiceHistory.forEach((entry) => {
      summary += `<div>&gt; ${entry.choiceText}</div>`;
    });
    dom.endingSummary.innerHTML = summary;
  }

  function resetState() {
    state.currentScene = null;
    state.choiceHistory = [];
    state.flags = {};
    state.chatPhaseActive = false;
    state.currentGateId = null;
    state.chatHistory = [];
    state.analysisResultByGate = {};
    state.mirrorBusy = false;
    state.mirrorError = '';
    hideMirrorPanel();
  }

  function formatTraitName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatPersona(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function init() {
    dom.startBtn.addEventListener('click', () => {
      resetState();
      renderScene('scene_1');
    });

    dom.restartBtn.addEventListener('click', () => {
      resetState();
      showScreen(dom.titleScreen);
    });

    dom.mirrorSendBtn.addEventListener('click', () => {
      handleMirrorSend();
    });

    dom.mirrorInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleMirrorSend();
      }
    });
  }

  init();

  return { state, renderScene };
})();
