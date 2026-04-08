const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-4-26b-a4b-it:free';

const gatePrompts = {
  forest_judgment: {
    nextQuestionSystem: 'You are the Magic Mirror from a dark fantasy game. Ask one concise follow-up question that helps judge honesty, trust, caution, self-preservation, and cooperation. Stay in character. One question only.',
    analyzeSystem: 'You are the Magic Mirror. Analyze the user dialogue and return strict JSON only with persona, traits {trust,caution,honesty,self_preservation,cooperation}, and reasoning. All traits must be integers 0-100. No markdown.',
  },
  queen_judgment: {
    nextQuestionSystem: 'You are the Magic Mirror from a dark fantasy game. Ask one concise follow-up question that helps judge courage, caution, trust in allies, self-preservation, and cooperation. Stay in character. One question only.',
    analyzeSystem: 'You are the Magic Mirror. Analyze the user dialogue and return strict JSON only with persona, traits {trust,caution,honesty,self_preservation,cooperation}, and reasoning. All traits must be integers 0-100. No markdown.',
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'mirror-gate-worker' }, 200, env);
    }

    if (request.method !== 'POST' || url.pathname !== '/api/mirror-chat') {
      return json({ error: 'Method not allowed' }, 405, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, env);
    }

    const { gateId, conversation, mode, preferredModel, fallbackModels } = body || {};
    if (!gateId || !Array.isArray(conversation) || !mode) {
      return json({ error: 'Missing gateId, conversation, or mode' }, 400, env);
    }

    if (!env.OPENROUTER_API_KEY) {
      return json(
        { error: 'Missing OPENROUTER_API_KEY in Worker environment. Use `wrangler secret put OPENROUTER_API_KEY` or create a local `.dev.vars` file.' },
        500,
        env
      );
    }

    const gate = gatePrompts[gateId];
    if (!gate) {
      return json({ error: 'Unknown gateId' }, 400, env);
    }

    const models = [preferredModel || DEFAULT_MODEL, ...(fallbackModels || [])].filter(Boolean);

    for (const model of models) {
      try {
        if (mode === 'next_question') {
          const message = await askNextQuestion(model, gate, conversation, env);
          return json({ message, model }, 200, env);
        }

        if (mode === 'analyze') {
          const analysis = await analyzeConversation(model, gate, conversation, env);
          return json({ analysis, model }, 200, env);
        }
      } catch (error) {
        console.error(`Model failed: ${model}`, error);
      }
    }

    return json({ error: 'All models failed' }, 502, env);
  },
};

async function askNextQuestion(model, gate, conversation, env) {
  const payload = {
    model,
    response_format: { type: 'text' },
    messages: [
      { role: 'system', content: gate.nextQuestionSystem },
      ...conversation.slice(-8),
    ],
  };

  const data = await callOpenRouter(payload, env);
  return data.choices?.[0]?.message?.content?.trim() || 'What do your instincts ask of you now?';
}

async function analyzeConversation(model, gate, conversation, env) {
  const payload = {
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: gate.analyzeSystem },
      {
        role: 'user',
        content: JSON.stringify({ conversation }),
      },
    ],
  };

  const data = await callOpenRouter(payload, env);
  const content = data.choices?.[0]?.message?.content || '{}';
  return normalizeAnalysis(JSON.parse(content));
}

async function callOpenRouter(payload, env) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.SITE_URL || 'https://example.com',
      'X-Title': 'CSCE New Media Mirror Gate',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text}`);
  }

  return response.json();
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  });
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

function normalizeAnalysis(raw) {
  const traitsSource = raw?.traits && typeof raw.traits === 'object' ? raw.traits : null;
  const persona = typeof raw?.persona === 'string' ? raw.persona.trim() : '';
  const reasoning = typeof raw?.reasoning === 'string' ? raw.reasoning.trim() : '';

  if (!traitsSource || !persona || !reasoning) {
    throw new Error('Malformed analysis payload from model.');
  }

  const traits = {
    trust: normalizeTraitValue(traitsSource.trust),
    caution: normalizeTraitValue(traitsSource.caution),
    honesty: normalizeTraitValue(traitsSource.honesty),
    self_preservation: normalizeTraitValue(traitsSource.self_preservation),
    cooperation: normalizeTraitValue(traitsSource.cooperation),
  };

  return {
    persona,
    reasoning,
    traits,
  };
}

function normalizeTraitValue(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error('Malformed trait score from model.');
  }
  return Math.max(0, Math.min(100, Math.round(parsed)));
}
