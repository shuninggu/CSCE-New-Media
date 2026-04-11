// ===== LIVE2D MIRROR INTEGRATION =====
// Renders the Snow White Live2D model in the Magic Mirror chat panel.
// Exposes MirrorLive2D with five public methods called by engine.js.
// All methods are no-ops if the SDK fails to load or the model fails (graceful degradation).
//
// Requires: PIXI (pixi.js@7), PIXI.live2d (pixi-live2d-display), Live2DCubismCore
// Animation is parameter-driven — no motion files exist in this model.

const MirrorLive2D = (() => {
  const MODEL_PATH = 'assets/live2d/snowwhite/snowwhite_new.model3.json';
  const CANVAS_W = 180;
  const CANVAS_H = 260;

  // ── Private state ──────────────────────────────────────────────────────────

  let _app           = null;   // PIXI.Application
  let _model         = null;   // PIXI.live2d.Live2DModel
  let _ready         = false;
  let _destroyed     = false;

  let _state         = 'idle'; // 'idle' | 'thinking' | 'speaking' | 'judgment'
  let _time          = 0;      // accumulated seconds for sine-wave animations

  // Blink state machine
  let _blinkTimer    = 2;      // seconds until next blink
  let _blinkState    = 'open'; // 'open' | 'closing' | 'opening'
  let _blinkT        = 0;      // normalized progress within a blink phase

  // Speaking
  let _speakPhase    = 0;      // drives mouth oscillation

  // Judgment
  let _judgmentTimer = null;   // setTimeout handle

  // ── SDK availability ────────────────────────────────────────────────────────

  function _sdkAvailable() {
    return (
      typeof PIXI !== 'undefined' &&
      typeof PIXI.live2d !== 'undefined' &&
      typeof Live2DCubismCore !== 'undefined'
    );
  }

  function _markUnavailable() {
    const el = document.getElementById('live2d-container');
    if (el) el.classList.add('live2d-unavailable');
  }

  function _guard() {
    return _ready && !_destroyed && _model !== null;
  }

  // ── Initialization ──────────────────────────────────────────────────────────

  async function _init() {
    if (_ready || _destroyed) return;
    if (!_sdkAvailable()) {
      _markUnavailable();
      return;
    }

    try {
      const dpr    = window.devicePixelRatio || 1;
      const canvas = document.getElementById('live2d-canvas');
      canvas.style.width  = CANVAS_W + 'px';
      canvas.style.height = CANVAS_H + 'px';

      _app = new PIXI.Application({
        view:            canvas,
        width:           CANVAS_W * dpr,
        height:          CANVAS_H * dpr,
        resolution:      dpr,
        autoDensity:     true,
        backgroundAlpha: 0,
        antialias:       true,
      });

      _model = await PIXI.live2d.Live2DModel.from(MODEL_PATH);

      console.log('[MirrorLive2D] natural model size:', _model.internalModel.originalWidth, 'x', _model.internalModel.originalHeight);
      console.log('[MirrorLive2D] pixi model .width/.height:', _model.width, 'x', _model.height);
      console.log('[MirrorLive2D] canvas screen size:', _app.screen.width, 'x', _app.screen.height);

      // Scale to fill canvas proportionally with a small margin
      const scale = Math.min(
        _app.screen.width  / _model.width,
        _app.screen.height / _model.height
      ) * 0.9;

      console.log('[MirrorLive2D] computed scale:', scale, '→ display size:', _model.width * scale, 'x', _model.height * scale);

      _model.scale.set(scale);
      _model.anchor.set(0.5);
      _model.x = _app.screen.width  / 2;
      _model.y = _app.screen.height / 2;

      _app.stage.addChild(_model);

      _ready     = true;
      _destroyed = false;

      _app.ticker.add(_onTick);
    } catch (err) {
      console.warn('[MirrorLive2D] Model load failed — Live2D disabled.', err);
      _markUnavailable();
      if (_app) { _app.destroy(false); _app = null; }
    }
  }

  // ── Ticker: parameter-based animation ──────────────────────────────────────

  function _onTick(delta) {
    if (!_guard()) return;

    // delta is Pixi's frame-delta (1.0 at 60fps). Convert to seconds.
    _time += delta / 60;

    const core = _model.internalModel.coreModel;
    const set  = (id, v) => core.setParameterValueById(id, v);

    // Breathing — present in all states
    set('ParamBreath', (Math.sin(_time * 1.5) + 1) / 2);

    // Blinking — suppressed during judgment (eyes forced open)
    if (_state !== 'judgment') {
      _updateBlink(delta, set);
    }

    if (_state === 'idle') {
      _animIdle(set);
    } else if (_state === 'thinking') {
      _animThinking(set);
    } else if (_state === 'speaking') {
      _animSpeaking(delta, set);
    } else if (_state === 'judgment') {
      _animJudgment(set);
    }
  }

  function _animIdle(set) {
    set('ParamBodyAngleX', Math.sin(_time * 0.7) * 3);
    set('ParamBodyAngleZ', Math.sin(_time * 0.5) * 1.5);
    set('ParamAngleX',     Math.sin(_time * 0.6) * 4);
    set('ParamAngleY',     Math.sin(_time * 0.4) * 3);
    set('ParamAngleZ',     Math.sin(_time * 0.5) * 2);
    set('ParamEyeBallX',   Math.sin(_time * 0.3) * 0.4);
    set('ParamEyeBallY',   Math.sin(_time * 0.25) * 0.3);
    set('ParamBrowLY',     0);
    set('ParamBrowRY',     0);
    set('ParamMouthOpenY', 0);
  }

  function _animThinking(set) {
    set('ParamBodyAngleX', Math.sin(_time * 1.2) * 6);
    set('ParamAngleZ',     5 + Math.sin(_time * 0.8) * 2);
    set('ParamAngleX',     Math.sin(_time * 0.9) * 5);
    set('ParamAngleY',     Math.sin(_time * 0.6) * 3);
    set('ParamEyeBallX',   Math.sin(_time * 0.5) * 0.6);
    set('ParamBrowLY',    -0.3);
    set('ParamBrowRY',    -0.3);
    set('ParamMouthOpenY', 0);
  }

  function _animSpeaking(delta, set) {
    _speakPhase += delta / 60;
    const mouthVal = Math.max(0, Math.sin(_speakPhase * Math.PI * 4)) * 0.8;
    set('ParamMouthOpenY', mouthVal);
    set('ParamAngleY',     Math.sin(_speakPhase * 1.5) * 5);
    set('ParamBodyAngleX', Math.sin(_time * 0.7) * 3);
    set('ParamBrowLY',     0);
    set('ParamBrowRY',     0);
  }

  function _animJudgment(set) {
    // Eyes wide open, brows raised — held by _runJudgmentAnim timeout
    set('ParamBrowLY',    0.8);
    set('ParamBrowRY',    0.8);
    set('ParamEyeLOpen',  1.0);
    set('ParamEyeROpen',  1.0);
    set('ParamAngleY',   -10 + Math.sin(_time * 0.4) * 2);
    set('ParamBodyAngleX', Math.sin(_time * 0.5) * 2);
    set('ParamMouthOpenY', 0);
  }

  // ── Blink sub-routine ───────────────────────────────────────────────────────

  function _updateBlink(delta, set) {
    _blinkTimer -= delta / 60;

    if (_blinkState === 'open') {
      set('ParamEyeLOpen', 1);
      set('ParamEyeROpen', 1);
      if (_blinkTimer <= 0) {
        _blinkState = 'closing';
        _blinkT     = 0;
      }
    } else if (_blinkState === 'closing') {
      _blinkT += (delta / 60) / 0.08; // 80ms to close
      const v = 1 - Math.min(_blinkT, 1);
      set('ParamEyeLOpen', v);
      set('ParamEyeROpen', v);
      if (_blinkT >= 1) {
        _blinkState = 'opening';
        _blinkT     = 0;
      }
    } else if (_blinkState === 'opening') {
      _blinkT += (delta / 60) / 0.12; // 120ms to open
      const v = Math.min(_blinkT, 1);
      set('ParamEyeLOpen', v);
      set('ParamEyeROpen', v);
      if (_blinkT >= 1) {
        _blinkState  = 'open';
        _blinkTimer  = 3 + Math.random() * 4; // next blink in 3–7s
      }
    }
  }

  // ── Judgment timeout ────────────────────────────────────────────────────────

  function _runJudgmentAnim() {
    if (_judgmentTimer) clearTimeout(_judgmentTimer);
    _judgmentTimer = setTimeout(() => {
      if (_state === 'judgment') _state = 'idle';
      _judgmentTimer = null;
    }, 2500);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async function onMirrorOpen() {
    console.log('[MirrorLive2D] onMirrorOpen — _ready:', _ready, '_app:', !!_app, '_model:', !!_model);
    if (_ready && _app && _model) {
      // Already initialized — just make visible again
      _model.visible = true;
      _state      = 'idle';
      _blinkTimer = 2;
      _blinkState = 'open';
      _time       = 0;
      console.log('[MirrorLive2D] resumed existing model');
      return;
    }
    // First time — initialize fresh
    await _init();
    if (_guard()) {
      _state      = 'idle';
      _blinkTimer = 2;
      _blinkState = 'open';
      console.log('[MirrorLive2D] initialized fresh model');
    }
  }

  function onThinking() {
    if (!_guard()) return;
    _state = 'thinking';
  }

  function onResponse() {
    if (!_guard()) return;
    _state      = 'speaking';
    _speakPhase = 0;
  }

  function onJudgment() {
    if (!_guard()) return;
    _state = 'judgment';
    _runJudgmentAnim();
  }

  function onMirrorClose() {
    console.log('[MirrorLive2D] onMirrorClose — _ready:', _ready, '_app:', !!_app, '_model:', !!_model);
    if (_judgmentTimer) { clearTimeout(_judgmentTimer); _judgmentTimer = null; }
    // Hide model only — ticker keeps running so it restarts reliably next session
    if (_model) _model.visible = false;
    _state = 'idle';
  }

  return { onMirrorOpen, onThinking, onResponse, onJudgment, onMirrorClose };
})();
