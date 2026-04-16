// ===== LIVE2D MIRROR INTEGRATION =====
// Renders the Snow White Live2D model in the Magic Mirror chat panel.
// The model simply follows the mouse cursor — no custom parameter animation.
//
// Requires: PIXI (pixi.js), PIXI.live2d (pixi-live2d-display), Live2DCubismCore

const MirrorLive2D = (() => {
  const MODEL_PATH = 'assets/live2d/snowwhite/snowwhite_new.model3.json';
  const CANVAS_W = 180;
  const CANVAS_H = 260;

  let _app   = null;
  let _model = null;
  let _ready = false;

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

  async function _init() {
    if (_ready) return;
    if (!_sdkAvailable()) { _markUnavailable(); return; }

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

      // Scale to fit with margin
      const scale = Math.min(
        _app.screen.width  / _model.width,
        _app.screen.height / _model.height
      ) * 0.85;

      _model.scale.set(scale);
      _model.anchor.set(0.5);
      _model.x = _app.screen.width  / 2;
      _model.y = _app.screen.height / 2 + 10;

      _app.stage.addChild(_model);

      // Track mouse across the whole document so the model follows the cursor
      document.addEventListener('mousemove', _onMouseMove);

      _ready = true;
    } catch (err) {
      console.warn('[MirrorLive2D] Model load failed — Live2D disabled.', err);
      _markUnavailable();
      if (_app) { _app.destroy(false); _app = null; }
    }
  }

  function _onMouseMove(e) {
    if (!_ready || !_model) return;
    // pixi-live2d-display's focus() expects coordinates relative to the model.
    // Passing page coordinates works — the library normalises them internally.
    _model.focus(e.clientX, e.clientY);
  }

  // ── Public API (called by engine.js) ────────────────────────────────────────

  async function onMirrorOpen() {
    if (_ready && _model) {
      _model.visible = true;
      return;
    }
    await _init();
  }

  function onMirrorClose() {
    if (_model) _model.visible = false;
  }

  // Keep the signatures so engine.js doesn't throw — they're just no-ops now.
  function onThinking()  {}
  function onResponse()  {}
  function onJudgment()  {}

  return { onMirrorOpen, onThinking, onResponse, onJudgment, onMirrorClose };
})();
