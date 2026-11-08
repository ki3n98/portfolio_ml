// Skill groups shown in the Portfolio Hub.

// [label, icon] — icon is an assets/icons/*.svg basename, or null for text-only chips.
export const SKILL_GROUPS = [
  { name: 'Machine Learning', skills: [['PyTorch', 'pytorch'], ['TensorFlow', 'tensorflow'], ['scikit-learn', null], ['Deep Learning', 'deep-learning'], ['SHAP', null], ['Model Fine-tuning', null], ['Concept Drift', null], ['Matplotlib', null]] },
  { name: 'NLP & LLMs', skills: [['NLP', 'nlp'], ['Embeddings', null], ['LangChain', 'langchain'], ['LangGraph Agents', null], ['Gemini / OpenAI APIs', null], ['Whisper (STT)', null], ['Prompt Engineering', null], ['Multi-agent Orchestration', null]] },
  { name: 'Computer Vision', skills: [['Computer Vision', 'computer-vision'], ['YOLOv11', null], ['Faster R-CNN / SSD', null], ['FaceNet', null], ['MediaPipe', null], ['OpenCV', null]] },
  { name: 'Backend & Data', skills: [['Python', 'python'], ['FastAPI', 'fastapi'], ['REST API', 'rest-api'], ['WebSockets', null], ['PostgreSQL', 'postgresql'], ['SQLAlchemy', null], ['Django', null], ['Data Labeling & Evaluation', null]] },
  { name: 'Web & DevOps', skills: [['Next.js', 'nextjs'], ['JavaScript', 'javascript'], ['HTML', 'html'], ['CSS', 'css'], ['Docker', 'docker'], ['AWS', 'aws'], ['Git / GitHub', null]] },
];
