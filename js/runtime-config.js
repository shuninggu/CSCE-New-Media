window.MirrorRuntimeConfig = window.MirrorRuntimeConfig || {
  // Set this to your deployed Cloudflare Worker URL, for example:
  // "https://mirror-gate.your-subdomain.workers.dev/api/mirror-chat"
  // For local testing, replace this with "http://localhost:8787/api/mirror-chat"
  apiEndpoint: '',
  preferredModel: 'nvidia/nemotron-3-super-120b-a12b:free',
  fallbackModels: [
    'google/gemma-4-26b-a4b-it:free',
    'stepfun/step-3.5-flash:free',
  ],
};
