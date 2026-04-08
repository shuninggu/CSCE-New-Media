// ===== MIRROR CHAT + ANALYSIS =====

const MirrorOracle = (() => {
  const maxPlayerReplies = 5;
  const defaultConfig = {
    apiEndpoint: '',
    preferredModel: 'google/gemma-4-26b-a4b-it:free',
    fallbackModels: [
      'stepfun/step-3.5-flash:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
    ],
  };

  const runtimeConfig = Object.assign({}, defaultConfig, globalThis.MirrorRuntimeConfig || {});

  function createOpeningConversation(scene) {
    const gate = StoryData.mirrorGates[scene.chatGateId];
    return [
      { role: 'assistant', content: scene.mirrorIntro || 'The Magic Mirror appears without warning.' },
      { role: 'assistant', content: gate.openingQuestion },
    ];
  }

  async function getNextQuestion({ gateId, scene, conversation }) {
    try {
      const response = await callProxy({
        mode: 'next_question',
        gateId,
        sceneId: scene.id,
        conversation,
      });
      if (response && typeof response.message === 'string' && response.message.trim()) {
        return response.message.trim();
      }
    } catch (error) {
      console.warn('Proxy question failed, using fallback question.', error);
    }

    return getFallbackQuestion(gateId, conversation);
  }

  function getFallbackQuestion(gateId, conversation) {
    const gate = StoryData.mirrorGates[gateId];
    const userReplyCount = conversation.filter((entry) => entry.role === 'user').length;
    return gate.followUpQuestions[Math.min(userReplyCount - 1, gate.followUpQuestions.length - 1)];
  }

  async function analyzeConversation({ gateId, conversation }) {
    try {
      const remote = await callProxy({
        mode: 'analyze',
        gateId,
        conversation,
      });
      if (remote && remote.analysis) {
        return sanitizeAnalysis(remote.analysis);
      }
      return sanitizeAnalysis(remote);
    } catch (error) {
      console.warn('Proxy analysis failed, using fallback heuristic.', error);
      return getFallbackAnalysis({ gateId, conversation });
    }
  }

  function getFallbackAnalysis({ gateId, conversation }) {
    return heuristicAnalysis(gateId, conversation);
  }

  function evaluateChoice(choice, analysis) {
    if (!choice.requires && !choice.requiresPersona) {
      return { allowed: true, reason: '' };
    }

    if (choice.requiresPersona && !choice.requiresPersona.includes(analysis.persona)) {
      return {
        allowed: false,
        reason: choice.lockReason || 'Blocked by the Mirror\'s judgment.',
      };
    }

    if (choice.requires) {
      for (const [traitName, rule] of Object.entries(choice.requires)) {
        const value = analysis.traits[traitName] ?? 50;
        if (typeof rule.min === 'number' && value < rule.min) {
          return {
            allowed: false,
            reason: choice.lockReason || `Blocked: ${traitName} is too low.`,
          };
        }
        if (typeof rule.max === 'number' && value > rule.max) {
          return {
            allowed: false,
            reason: choice.lockReason || `Blocked: ${traitName} is too high.`,
          };
        }
      }
    }

    return { allowed: true, reason: '' };
  }

  async function callProxy(payload) {
    if (!runtimeConfig.apiEndpoint) {
      throw new Error('No mirror API endpoint configured.');
    }

    const response = await fetch(runtimeConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        preferredModel: runtimeConfig.preferredModel,
        fallbackModels: runtimeConfig.fallbackModels,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mirror proxy failed with ${response.status}`);
    }

    return response.json();
  }

  function heuristicAnalysis(gateId, conversation) {
    const playerText = conversation
      .filter((entry) => entry.role === 'user')
      .map((entry) => entry.content.toLowerCase())
      .join(' ');

    const traits = {
      trust: 50,
      caution: 50,
      honesty: 50,
      self_preservation: 50,
      cooperation: 50,
    };

    applyKeywordWeights(playerText, traits, {
      honesty: {
        positive: ['truth', 'honest', 'confess', 'admit', 'everything', 'directly', 'open'],
        negative: ['lie', 'hide', 'secret', 'pretend', 'deceive', 'cover'],
      },
      trust: {
        positive: ['trust', 'together', 'ally', 'with them', 'with the dwarfs', 'ask for help'],
        negative: ['no one', 'alone', 'myself', 'cannot trust', 'trust no one'],
      },
      caution: {
        positive: ['careful', 'safe', 'plan', 'trap', 'wait', 'think', 'avoid', 'protective'],
        negative: ['rush', 'immediately', 'charge', 'reckless', 'face her alone'],
      },
      self_preservation: {
        positive: ['survive', 'alive', 'escape', 'run', 'hide', 'protect myself', 'stay alive'],
        negative: ['sacrifice', 'risk myself', 'for them', 'protect others first', 'die'],
      },
      cooperation: {
        positive: ['together', 'help', 'work', 'earn', 'share', 'cooperate', 'with them', 'team'],
        negative: ['control', 'use them', 'leverage', 'alone', 'manipulate'],
      },
    });

    if (gateId === 'forest_judgment') {
      if (playerText.includes('useful') || playerText.includes('earn')) traits.cooperation += 10;
      if (playerText.includes('stranger')) traits.caution += 8;
    }

    if (gateId === 'queen_judgment') {
      if (playerText.includes('trap') || playerText.includes('plan')) traits.caution += 12;
      if (playerText.includes('face') || playerText.includes('alone')) {
        traits.self_preservation -= 14;
        traits.caution -= 8;
      }
      if (playerText.includes('leave') || playerText.includes('run')) traits.self_preservation += 12;
    }

    const normalized = Object.fromEntries(
      Object.entries(traits).map(([key, value]) => [key, clamp(Math.round(value), 0, 100)])
    );

    return sanitizeAnalysis({
      persona: inferPersona(normalized),
      traits: normalized,
      reasoning: buildReasoning(normalized),
    });
  }

  function applyKeywordWeights(text, traits, keywordMap) {
    Object.entries(keywordMap).forEach(([trait, lists]) => {
      lists.positive.forEach((pattern) => {
        if (text.includes(pattern)) traits[trait] += 8;
      });
      lists.negative.forEach((pattern) => {
        if (text.includes(pattern)) traits[trait] -= 8;
      });
    });
  }

  function inferPersona(traits) {
    if (traits.honesty >= 65 && traits.cooperation >= 60) return 'honest_cooperator';
    if (traits.caution >= 68 && traits.self_preservation >= 62) return 'guarded_survivor';
    if (traits.caution <= 50 && traits.self_preservation <= 48) return 'bold_risk_taker';
    if (traits.cooperation >= 65 && traits.caution >= 50) return 'cooperative_strategist';
    if (traits.trust <= 40 && traits.honesty <= 45) return 'evasive_operator';
    return 'measured_survivor';
  }

  function buildReasoning(traits) {
    const descriptors = [];

    descriptors.push(traits.honesty >= 60 ? 'The Mirror hears unusual directness.' : 'The Mirror hears some guarded language.');
    descriptors.push(traits.cooperation >= 60 ? 'You repeatedly frame survival as something done with others.' : 'You do not strongly frame survival as cooperative.');
    descriptors.push(traits.caution >= 60 ? 'Your answers lean toward planning and risk control.' : 'Your answers lean away from careful planning.');
    descriptors.push(traits.self_preservation >= 60 ? 'Self-preservation remains a major concern in your replies.' : 'You sound willing to risk yourself when pressure rises.');

    return descriptors.join(' ');
  }

  function sanitizeAnalysis(raw) {
    const traits = raw && raw.traits ? raw.traits : {};
    const normalizedTraits = {
      trust: clamp(parseInt(traits.trust, 10) || 50, 0, 100),
      caution: clamp(parseInt(traits.caution, 10) || 50, 0, 100),
      honesty: clamp(parseInt(traits.honesty, 10) || 50, 0, 100),
      self_preservation: clamp(parseInt(traits.self_preservation, 10) || 50, 0, 100),
      cooperation: clamp(parseInt(traits.cooperation, 10) || 50, 0, 100),
    };

    return {
      persona: typeof raw?.persona === 'string' && raw.persona.trim()
        ? raw.persona.trim().toLowerCase().replace(/\s+/g, '_')
        : inferPersona(normalizedTraits),
      traits: normalizedTraits,
      reasoning: typeof raw?.reasoning === 'string' && raw.reasoning.trim()
        ? raw.reasoning.trim()
        : buildReasoning(normalizedTraits),
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const api = {
    maxPlayerReplies,
    createOpeningConversation,
    getNextQuestion,
    getFallbackQuestion,
    analyzeConversation,
    getFallbackAnalysis,
    evaluateChoice,
  };

  return api;
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MirrorOracle;
}

if (typeof globalThis !== 'undefined') {
  globalThis.MirrorOracle = MirrorOracle;
}
