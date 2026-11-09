// Per-project detail content for the Portfolio Hub detail page.
// Keys MUST match the project titles in js/data/projects.js exactly.

export const PROJECT_DETAILS = {
  'Shape & Sign': {
    architecture: [
      ["Hand tracking", "MediaPipe Hands reads 21 landmarks per hand (63 values per frame) from a single webcam in real time."],
      ["Mode router", "A Random Forest classifies each frame into one of five modes: neutral, alphabet, phrase, volume, or mouse. It takes under a millisecond, so routing never slows down the frame loop."],
      ["Debounce", "A gesture has to hold for 5 consecutive frames before the mode switches. I added this so webcam flicker couldn't flip the game state."],
      ["Sequence model", "Once a mode is locked, stacked LSTMs (128×2, 60-frame windows) decode the ASL sequence for that mode. This cost is only paid while a mode is active."],
      ["Control loop", "The Python backend sends each frame to a handler for the current mode. Some handlers control the computer directly, using pycaw for volume and mouse movement."],
    ],
    built: [
      "Trained the Random Forest mode router and its 63-feature hand-landmark pipeline",
      "Designed the 5-frame debounce, so modes change on intent rather than on flicker",
      "Wrote the whole Python backend: capture → landmarks → Random Forest router → per-mode handlers → system control",
      "Helped collect the 26-class, 24,636-frame landmark dataset, varying distance, angle, and speed between takes",
      "Helped with the frontend, and I'm one of the two signers in the training data",
    ],
    why: [
      "Small model first, big model second. A fast classifier decides which mode you're in, and the expensive sequence model only runs once a mode locks. One model couldn't do both jobs well at 30 fps on a CPU.",
      "Debounce as a UX choice. Raw webcam predictions flicker. Requiring 5 stable frames makes a mode switch feel like a deliberate gesture, and it held up for the whole judging session.",
      "Reliability over novelty. We won Best Overall with about 93% live accuracy, in the game, in front of the judges. It wasn't the fanciest model that did it.",
    ],
    stats: [
      ["~93%", "live ASL accuracy, in-game"],
      ["24,636", "hand-landmark frames · 26 classes"],
      ["5 frames", "debounce before a mode locks"],
      ["24 h", "Beach Hacks 8.0 · Best Overall (2025)"],
    ],
    lessons: [
      "We only had two signers, so the model memorized our hands. The 99% test accuracy in our notebooks came from a data leak: with stride-1 windows, a random split puts nearly identical windows in both train and test (they share 59 of 60 frames). The honest number was the ~93% we saw live. If I did it again, I'd split by signer and ship the evaluation report with the code.",
    ],
  },

  '911 Operator Assistance': {
    architecture: [
      ["Call ingestion", "Twilio Voice answers and records the 911 call, then posts the recording to our FastAPI backend."],
      ["Transcription", "faster-whisper (small.en, int8, VAD, beam=1, temp=0) transcribes the call on a local GPU. Decoding is deterministic, there are no per-minute API costs, and the audio never leaves our machine."],
      ["Constrained extraction", "Gemini 2.5 Flash turns the transcript into a fixed format: an Address: line and an Incident: line chosen from a closed list of four values (Crime, Medical, Fire, Non-emergency). A regex parses the reply, and anything that doesn't match the format produces nothing, so nothing gets pinned by accident."],
      ["Geocoding", "The address goes to the Google Geocoding API, which returns a suggested location plus extra candidates when a street name is ambiguous."],
      ["Human in the loop", "The pin appears on the Next.js dispatcher dashboard as a suggestion. An operator confirms the marker or types in an address before anyone is dispatched."],
    ],
    built: [
      "The full inference pipeline: the faster-whisper setup, the Gemini extraction prompt and regex parser, and the geocoding chain",
      "Most of the operator dashboard: map markers, emergency icons, zoom, the transcript view, and the confirm / manual-address flow",
      "The Next.js API routes that connect the frontend to the FastAPI backend. Overall I made 18 of the team's 55 commits.",
    ],
    why: [
      "The model suggests, a person decides. The system never lets the model act on its own: extract, geocode, suggest a marker, then wait for the operator. A wrong automatic dispatch isn't acceptable in a 911 setting, so this boundary is the core of the design.",
      "A constrained LLM instead of a trained NER model. Locations in panicked speech are too open-ended to train NER from scratch, especially with no labeled data. But free-form text can't safely drive a dispatch interface, so most of the engineering went into the output format and the regex check.",
      "A closed list of incident types. The model can't invent a fifth category, which keeps the dispatch UI consistent.",
    ],
    stats: [
      ["24 h", "3 people · 55 commits (mine 18)"],
      ["4 classes", "closed incident enum — no drift"],
      ["int8 + VAD", "faster-whisper small.en, ~4× faster on GPU"],
      ["Best Overall", "Marina Hacks 5.0 (2025)"],
    ],
    lessons: [
      "Keeping events in an in-memory list was fine for 24 hours but wouldn't work in production, since a restart loses every incident. A real version needs a queue, a database, and idempotent event IDs. (I added JWT and role-based access to the same FastAPI stack in VeriFace, and I'd lock this one down the same way.)",
      "Some gaps I'd close: we never benchmarked end-to-end latency, the geocoder just takes the first result (ambiguous names like \"Main St\" need results biased toward the map viewport), and Whisper reloaded on every call. Loading it once at startup is a five-minute fix.",
    ],
  },

  'VeriFace': {
    architecture: [
      ["Face detection", "MTCNN crops faces (160 px, margin 20, keep_all) from the uploaded photo. Uploads are validated first (MIME type, 20 MB, 1280 px)."],
      ["Embedding", "FaceNet (InceptionResnetV1, pretrained on VGGFace2) produces a 512-dimensional, L2-normalized embedding for each crop."],
      ["Matching", "Cosine similarity is computed by brute force against only the members enrolled in that event. The best match at 0.5 or higher checks in, marked present or late relative to the session start. A roster has tens to hundreds of vectors, so a linear scan takes under a millisecond and a vector database would be an unnecessary dependency."],
      ["Live feed", "Results stream over WebSockets to everyone watching that session's dashboard. A custom ConnectionManager keyed by session_id broadcasts only when the state changes."],
      ["Access control", "JWT and bcrypt handle authentication. A five-role RBAC (member → viewer → moderator → admin → owner) has hierarchy rules for assigning roles, and an audit log records every admin edit to attendance."],
    ],
    built: [
      "Repo founder and backend lead: 84 of 182 commits on a team of 6",
      "The whole RBAC system: role hierarchy, assignment rules, and audit log (I was the sole author of the permission module)",
      "The face-matching pipeline: upload validation, the embedding service, the cosine best-match logic, and per-event roster scoping",
      "Trained the EfficientNet-B0 live-vs-spoof classifier (ImageFolder with crop, flip, color-jitter, and rotation augmentation)",
      "The WebSocket live-feed manager, about 160 pytest tests (auth, events, matching, liveness), and the Docker/CUDA setup the judges ran",
    ],
    why: [
      "Anti-spoofing went through three versions in four weeks: a blink challenge, then a trained spoof classifier (threshold 0.8), then a RetinaFace batch pipeline where one frame checks in a whole room. Each version traded security against usability and throughput, and the commit history shows every trade-off.",
      "Matching without a vector database. The per-event roster doubles as a security boundary, since you can only match against the event you're checking into. At this scale a linear cosine scan is also simpler than an index and fast enough.",
      "PyTorch inside async FastAPI. Inference runs in a thread pool so the event loop never stalls, and a single globally loaded model keeps GPU memory bounded.",
    ],
    stats: [
      ["84/182", "commits · top of 6 contributors"],
      ["512-dim", "FaceNet embeddings · cosine ≥ 0.5"],
      ["5 roles", "RBAC + audit log"],
      ["160+", "pytest tests"],
      ["Senior Design", "Outstanding Achievement in Applied AI & ML (2026)"],
    ],
    lessons: [
      "We never measured FAR/FRR or wrote a recognition accuracy report, because senior design was judged at a showcase. That gap is part of why I used one fixed benchmark protocol for all 86 models during my TRSS internship. A project should ship with its verification report.",
      "Dropping liveness checks in the third version was forced on us by batch multi-face throughput and faces that MTCNN missed. The cost is weaker anti-spoofing. If I kept working on it, I'd add a spoof detector that runs on each batched crop and doesn't need a blink.",
    ],
  },

  'DocGenix': {
    architecture: [
      ["Interview", "A chat agent with tools interviews the user about the platform, features, tech stack, and audience, and the project is saved to SQLite."],
      ["Parallel fan-out", "When you hit Generate, 8 specialist LangGraph ReAct agents (each with web search) run in parallel and stream their progress over SSE. Together they write the requirements, user stories, architecture, API spec, data model, DevOps, and testing docs."],
      ["Critic loop", "A Critic agent reviews all of the docs against each other. For example, the API spec has to match the data model, and the architecture has to support the requirements. It returns NEEDS_REVISION or APPROVED for each doc, along with specific issues to fix. There are at most 2 revision rounds, then it stops."],
      ["Structured extraction", "The architecture and data-model docs go through two passes. The ReAct agent first writes the report in free form, then a plain LLM call with no tools uses with_structured_output to extract the graph into a Pydantic schema. Free-form output shouldn't be trusted to drive a renderer."],
      ["Visualization", "The graphs render as an interactive 3D force graph (three.js) and a live ER diagram (ReactFlow), both exportable to PNG. The full blueprint downloads as a zip along with the diagrams."],
    ],
    built: [
      "The generation orchestration: parallel agent fan-out, the critic loop, and per-agent regeneration (re-running one doc without paying for the whole set again)",
      "The Critic agent (sole author): 5 review criteria, a per-doc verdict format, and web-search verification",
      "The two-pass structured-extraction pipeline and the database layer (SQLite/aiosqlite)",
      "The migration from Ollama to an OpenAI-compatible LLM, and the 3D graph support. Overall I made 25 of the team's 65 commits.",
    ],
    why: [
      "Two ways to control an LLM. Creative agents write the prose, and strict structured output handles anything a machine has to render. The Critic has a fixed verdict format and a bounded 2-round loop, so it can't keep critiquing forever.",
      "Consistency across documents is the main feature. When each agent reviews its own doc, everything looks great, so the Critic compares the docs against each other instead. That needs a global view, which is why the loop runs after generation and not inside each agent.",
      "Not tied to one LLM. The only LLM-specific code is ChatOpenAI with a base_url, so when we switched mid-build to the hackathon sponsor's model, it was a one-line config change and no agent code had to change.",
    ],
    stats: [
      ["8 + 1", "doc agents + Critic · ≤2 revision rounds"],
      ["65 commits", "4 people · mine 25 (38%)"],
      ["2 passes", "free-form agent → structured graph extraction"],
      ["Beach Hacks 9.0", "2026 · 24 h + a polish week"],
    ],
    lessons: [
      "Most of the real work was handling the ways agents fail: stalls, malformed output, and critic disagreement. The bounded loop and per-agent regeneration were our fixes. This project is the concrete example behind the \"multi-agent orchestration\" line on my resume.",
      "We never counted the token cost of 9 agents across 2 rounds. A production version would cache the interview context and only re-run the docs the Critic flagged. Per-agent regeneration was an early version of that idea.",
    ],
  },
};
