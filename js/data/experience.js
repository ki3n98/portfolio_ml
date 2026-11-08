// Experience data shared by the Portfolio Hub and the Experience window.

/**
 * Experience entries. `bullets` may contain <b> markup (trusted, authored here).
 * @type {{org:string, role:string, dates:string, icon:string, context?:string,
 *         bullets:string[], tags:string[], links?:[string,string][]}[]}
 */
export const PORTFOLIO_EXPERIENCE = [
  {
    org: 'Thomson Reuters Special Services',
    role: 'Data Science Intern',
    dates: 'May 2026 — Aug 2026',
    icon: '../assets/icons/briefcase.png',
    context: 'Spotlight (Canary × TRSS) surfaces suspected trafficking victims to law enforcement from ~150K ads/day and has helped identify 28,459 children since 2016. Its juvenile flag relied on images alone; I explored and benchmarked text models to add a second signal.',
    bullets: [
      'Built and benchmarked <b>86 text-classification models</b> (11 embedding methods × up to 10 classifiers, plus a zero-shot LLM baseline) to flag suspected juvenile victims in escort ads.',
      'Detected juvenile victims of sex trafficking in escort ads using an embedding → classifier pipeline (OpenAI text-embedding-3-large + Logistic Regression), lifting recall from <b>0.620</b> to <b>0.795</b> and F1 from <b>0.50</b> to <b>0.64</b> at unchanged precision.',
      'Combined the text model\'s output with the existing image classifier, catching <b>23%</b> more true juvenile victims than the image classifier alone — roughly 350 additional confirmed cases per 6,000 ads reviewed.',
      'Stress-tested models on held-out 2024 ads: the 2025 leaders\' recall collapsed (e.g. <b>0.612 → 0.313</b>) while OpenAI embeddings + Logistic Regression held steady (<b>0.750 → 0.744</b>), so I recommended the model that generalizes, not the leaderboard winner.',
      'Measured concept drift (words shifting in juvenile signal year over year) and showed it tracks F1 decline across models, proposing drift monitoring as an early-warning retraining trigger.',
      'Made predictions auditable for law enforcement using SHAP and TF-IDF + LR coefficients trained on 2024-only, 2025-only, and pooled data, surfacing durable linguistic signals that held across years.',
      'Presented project findings and results to stakeholders company-wide, explaining technical modeling work to non-technical audiences and translating it into a shipping recommendation for text as a second detection signal.',
    ],
    tags: ['Embedding → Classifier', 'OpenAI Embeddings', 'Logistic Regression', 'Zero-shot LLM', 'TF-IDF', 'SHAP', 'Concept Drift'],
  },
  {
    org: 'Vision-Based Distracted Driving Detection',
    role: 'Undergraduate Researcher · Co-author with Dr. Amir Ghasemkhani',
    dates: 'Aug 2025 — Feb 2026',
    icon: '../assets/icons/sys-info.png',
    context: 'Paper published and presented at the 6th Annual Computer Science Conference for CSU Undergraduates (Feb 2026).',
    bullets: [
      'Benchmarked Faster R-CNN, SSD, and YOLOv11 for real-time in-cabin driver distraction (phone, eating, drinking, smoking) on the Roboflow Mobile Detection dataset under one fixed protocol; YOLOv11 won on both axes with <b>mAP@.50:.95 = 0.604</b> at <b>86.1 FPS</b> on a consumer RTX 3080, using half the parameters.',
      'Overturned the "two-stage is more accurate" assumption: Faster R-CNN scored lowest (<b>0.443</b> mAP) and ran <b>16× slower</b> (5.24 FPS), showing architecture choices must be benchmarked on the target data.',
      'Balanced an imbalanced training set (978–1,817 images per class) with class oversampling, keeping validation and test splits realistic.',
      'Conducted quantitative performance analysis across model architectures, producing deployment guidance for real-time, latency-sensitive object detection applications.',
    ],
    tags: ['YOLOv11', 'Faster R-CNN', 'SSD', 'PyTorch', 'Roboflow'],
    links: [
      ['assets/resume/Distracted_Driving_Detection___Kien-2.pdf', 'Read Paper (PDF)'],
      ['https://github.com/ki3n98/Amir_research', 'Source Code'],
    ],
  },
];
