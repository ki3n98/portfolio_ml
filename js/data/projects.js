// Project data shared by the Portfolio Hub and the Gradient Descent viz.

/**
 * Project data for the gradient descent visualization.
 * @typedef {Object} Project
 * @property {number}   x               - Position on the parabola (-2.2 to 2.2)
 * @property {string}   title
 * @property {string}   desc
 * @property {string}   [award]
 * @property {string[]} tags
 * @property {string}   link            - Primary CTA URL
 * @property {string}   [ctaLabel]      - Defaults to "View Project →"
 * @property {string}   [secondaryLink]
 * @property {string}   [secondaryLabel]
 * @property {string}   [tertiaryLink]
 * @property {string}   [tertiaryLabel]
 * @property {string}   step            - Label like "Step 1 - High Loss"
 * @property {string}   [mediaType]     - "Video" | "Image"
 * @property {string}   [mediaSrc]      - Local video/image path
 * @property {string}   [mediaEmbed]    - YouTube embed URL
 * @property {string}   [mediaText]     - Alt text / caption
 * @property {boolean}  [includeInOverview] - Defaults to true
 * @property {boolean}  [hideMedia]
 */
export const PORTFOLIO_PROJECTS = [
  {
    x: -1.9,
    title: 'Shape & Sign',
    desc: 'Gesture-controlled mini-games that teach kids ASL vocabulary and phrases from a webcam. A two-stage recognizer routes live MediaPipe hand frames into 5 modes, then stacked LSTMs (run in-browser via TensorFlow.js) read ASL sequences, sustaining ~93% live accuracy through judging.',
    role: 'Team of 4 · I built the Random Forest mode router (5-frame debounce) and the Python backend',
    award: 'BeachHacks 8.0 (2025) • Best Overall',
    tags: ['MediaPipe', 'Random Forest', 'LSTM', 'TensorFlow.js', 'Next.js'],
    link: 'https://shape-sign-mu.vercel.app/',
    ctaLabel: 'Live Demo →',
    secondaryLink: 'https://github.com/ki3n98/shape-sign',
    secondaryLabel: 'Source Code',
    tertiaryLink: 'https://devpost.com/software/shape-sign',
    tertiaryLabel: 'Devpost',
    step: 'Step 1 - High Loss',
    mediaType: 'Video',
    mediaSrc: 'assets/videos/shape_sign_demo.mp4',
    mediaText: 'Shape & Sign demo',
  },
  {
    x: -1.4,
    title: '911 Operator Assistance',
    desc: 'A 911 dispatcher co-pilot: an incoming call is transcribed with faster-whisper, Gemini extracts the address and incident type under a strict output contract, and a geocoded pin lands on a live dashboard, where a human confirms before anyone is dispatched.',
    role: 'Team of 3 · I built the transcription → LLM → geocoding pipeline and most of the dispatcher dashboard',
    award: 'Marina Hacks 5.0 (2025) • Best Overall',
    tags: ['faster-whisper', 'Gemini 2.5 Flash', 'FastAPI', 'Twilio Voice', 'Google Maps API', 'Next.js'],
    link: 'https://github.com/Ben2104/911-Operator-Assistant',
    ctaLabel: 'Source Code →',
    secondaryLink: 'https://devpost.com/software/911-operator-assistant',
    secondaryLabel: 'Devpost',
    step: 'Step 2 - Descending',
    mediaType: 'Video',
    mediaEmbed: 'https://www.youtube-nocookie.com/embed/okCDJyBionU?start=40&autoplay=1&mute=1&playsinline=1&rel=0',
    mediaText: '911 Operator demo video',
  },
  {
    x: -0.9,
    title: 'VeriFace',
    desc: 'Face-recognition attendance for classrooms and events. MTCNN detection and FaceNet embeddings are cosine-matched against each event roster, served via FastAPI + PostgreSQL, with a live WebSocket check-in dashboard and a self-trained EfficientNet-B0 anti-spoofing model.',
    role: 'Team of 6 · Repo founder, backend lead, and top contributor (84 of 182 commits)',
    award: 'CECS Senior Design Award — Outstanding Achievement in Applied AI & ML',
    tags: ['MTCNN', 'FaceNet', 'PyTorch', 'EfficientNet-B0', 'FastAPI', 'PostgreSQL', 'WebSockets', 'Docker', 'JWT / 5-role RBAC', '160+ pytest tests'],
    link: 'https://github.com/ki3n98/VeriFace',
    ctaLabel: 'Source Code →',
    step: 'Step 3 - Converging',
    mediaType: 'Video',
    mediaSrc: 'assets/videos/veriface_demo.mp4',
    mediaText: 'VeriFace demo',
  },
  {
    x: -0.4,
    title: 'DocGenix',
    desc: 'Describe an app idea, get a full software blueprint. 8 specialist LangGraph agents write requirements, architecture, API, and data-model docs in parallel; a Critic agent checks them against each other and triggers up to 2 revision rounds.',
    role: 'Team of 4 · I wrote the multi-agent orchestration, the Critic agent, and the structured-output extraction',
    award: 'BeachHacks 9.0 (2026)',
    tags: ['LangGraph', 'Multi-agent', 'LangChain', 'FastAPI', 'SSE streaming', 'Next.js'],
    link: 'https://github.com/zokoxa/DocGenix',
    ctaLabel: 'Source Code →',
    secondaryLink: 'https://devpost.com/software/docsgenix',
    secondaryLabel: 'Devpost',
    step: 'Step 4 - Local Optimum',
    mediaType: 'Video',
    mediaEmbed: 'https://www.youtube-nocookie.com/embed/SqQycaZNr4Q?start=115&autoplay=1&mute=1&playsinline=1&rel=0',
    mediaText: 'DocGenix demo',
  },
  {
    x: 0,
    title: 'Hire Me',
    desc: 'I build real-time computer vision and AI systems with a focus on performance, product thinking, and production-ready deployment.',
    tags: ['Applied ML', 'AI Engineer', 'Computer Vision', 'Full-Stack AI'],
    includeInOverview: false,
    hideMedia: false,
    mediaType: 'Image',
    mediaSrc: 'assets/img/emi.jpg',
    mediaText: 'Kien Pham',
    link: '#contact',
    ctaLabel: 'Get In Touch →',
    secondaryLink: 'assets/resume/Kien_Pham_resume.pdf',
    secondaryLabel: 'Download Resume',
    step: 'Step 5 - Hire Me',
  },
];
