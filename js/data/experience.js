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
    context: 'Spotlight (Canary × TRSS) helps law enforcement find suspected trafficking victims, screening about 150K ads a day, and has helped identify 28,459 children since 2016. Its juvenile flag only used images, so I explored and benchmarked text models to add a second signal.',
    bullets: [
      'Built an embedding → classifier pipeline (OpenAI text-embedding-3-large + Logistic Regression) to flag escort ads that may involve juvenile victims of sex trafficking. It raised recall from <b>0.620</b> to <b>0.795</b> and F1 from <b>0.50</b> to <b>0.64</b>, with precision unchanged.',
      'Built and benchmarked <b>86 text-classification models</b>: 11 embedding methods paired with up to 10 classifiers, plus a zero-shot LLM baseline.',
      'Combined the text model\'s output with the existing image classifier. Together they caught <b>23%</b> more true juvenile victims than the image classifier alone, which is roughly 350 additional confirmed cases per 6,000 ads reviewed.',
      'Tested the models on held-out 2024 ads. The top models from 2025 lost much of their recall (for example <b>0.612 → 0.313</b>), while OpenAI embeddings + Logistic Regression held steady (<b>0.750 → 0.744</b>). I recommended that one because it generalizes better, even though it wasn\'t the leaderboard winner.',
      'Measured concept drift, meaning how the words that signal a juvenile victim change from year to year, and showed that it tracks the drop in F1 across models. I proposed drift monitoring as an early warning for when to retrain.',
      'Made predictions easier for law enforcement to audit using SHAP and TF-IDF + Logistic Regression coefficients, trained on 2024-only, 2025-only, and pooled data. This surfaced language signals that stayed consistent across years.',
      'Presented the findings to stakeholders across the company and explained the modeling work to non-technical audiences. The result was a recommendation to ship text as a second detection signal.',
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
      'Benchmarked Faster R-CNN, SSD, and YOLOv11 for real-time detection of in-cabin driver distraction (phone use, eating, drinking, smoking) on the Roboflow Mobile Detection dataset, using one fixed protocol. YOLOv11 was best on both accuracy and speed, with <b>mAP@.50:.95 = 0.604</b> at <b>86.1 FPS</b> on a consumer RTX 3080 and about half the parameters.',
      'Found that the common assumption that two-stage detectors are more accurate did not hold here. Faster R-CNN scored lowest (<b>0.443</b> mAP) and ran <b>16× slower</b> (5.24 FPS), so architecture choices need to be benchmarked on the target data.',
      'The training set was imbalanced (978–1,817 images per class), so I oversampled the smaller classes and kept the validation and test splits realistic.',
      'Compared the architectures quantitatively and wrote up deployment guidance for real-time, latency-sensitive object detection.',
    ],
    tags: ['YOLOv11', 'Faster R-CNN', 'SSD', 'PyTorch', 'Roboflow'],
    links: [
      ['assets/resume/Distracted_Driving_Detection___Kien-2.pdf', 'Read Paper (PDF)'],
      ['https://github.com/ki3n98/Amir_research', 'Source Code'],
    ],
  },
];
