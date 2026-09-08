// Facts migrated from the previous homepage; no new biography or claims.
window.MiamiBiography = {
  bio: [
    "I'm a software engineer in Miami, born and raised in Naples, Florida. I graduated from the University of Miami with a B.S. in Mathematics and Computer Science in May 2026. I lead engineering at Bizzy, building the campus deals and events marketplace students and organizers use every day.",
    "I work end-to-end across backend, infrastructure, and the apps people actually tap. Previously, I worked on agentic and voice AI at Retentive Labs and trained AI models on code and math at Outlier.",
    "I have a strong math and machine learning bent, with interests in data science, statistics, and deep learning. Outside work, I play piano, DJ, and follow basketball.",
  ],
  experience: [
    {
      company: "Bizzy",
      role: "Lead Software Engineer",
      dates: "Apr 2026 – Present",
      details: [
        "Lead full-stack engineering for a campus deals and events marketplace connecting college students with local promotions and giving organizers tools to sell tickets, manage promoters, and process payouts",
        "Build and maintain backend, web, and mobile across TypeScript/Node.js, Laravel, Flutter, Next.js, and SQL, deployed on Vercel and AWS ECS with Redis caching",
        "Engineered end-to-end Stripe Connect integration handling ticket sales, promoter payouts, and marketplace payments",
        "Shipped 3 major releases to the ticketing platform",
        "Driving expansion to new campuses and scaling infrastructure to support that growth",
      ],
    },
    {
      company: "Retentive Labs",
      role: "AI Software Engineering Intern",
      dates: "May 2025 – Aug 2025",
      details: [
        "Built agentic AI tools for multimodal and voice-based workflows, including voice-agent systems deployed for Fortune 500 clients",
        "Designed and refined Retell AI call flows to improve autonomous voice-agent reliability and behavior",
        "Contributed full-stack work across frontend interfaces and system-level workflow logic",
        "Created reusable internal scripts and templates that accelerated agentic feature development",
      ],
    },
    {
      company: "Outlier",
      role: "Freelance AI Trainer",
      dates: "Jun 2024 – May 2025",
      details: [
        "Trained generative AI models on coding and mathematics, refining outputs to improve accuracy and reasoning",
        "Evaluated and optimized AI-generated code in Java, Python, and C, and debugged high-level mathematical problems",
        "Wrote test cases and detailed feedback to support model learning",
      ],
    },
  ],
  skills: {
    Languages: ["Python", "TypeScript", "JavaScript", "Java", "C", "SQL"],
    "Frameworks & Tools": [
      "Node.js",
      "Next.js",
      "Laravel",
      "Flutter",
      "Redis",
      "Stripe Connect",
    ],
    "Cloud & Infra": ["AWS (ECS)", "Vercel"],
    "AI / ML": ["Agentic AI", "Machine Learning", "Deep Neural Networks"],
    Data: ["Data Science", "Multivariate Statistics", "MATLAB"],
    "Human Languages": ["English Fluent", "French Intermediate"],
  },
  education: {
    school: "University of Miami",
    degree: "B.S. Mathematics and Computer Science",
    minor: "Minor in French",
    graduated: "May 2026",
    gpa: "3.81",
    honors: [
      "Presidential Scholarship ($15,000/semester)",
      "6× Provost’s Honor Roll",
      "Florida Bright Futures Scholarship",
      "Phi Delta Theta, FL Delta Chapter",
    ],
  },
};

// A project/paper has one home object. Routes and lists share this inventory.
window.MiamiMap = (() => {
  const github = "https://github.com/lukecaprio";
  const pdf = "docs/KNNKMEANSFINALPAPER.pdf?v=20250126";
  const digitRepo = `${github}/Efficient-Digit-Recognition-Using-K-Means-Clustering-and-KNN`;
  const items = {
    "/work/ecg": {
      title: "Deep Learning ECG Classification",
      short: "ECG classification",
      home: "work",
      kind: "Project",
      language: "EN",
      description:
        "Comparing MLP and CNN architectures for classifying cardiac abnormalities from ECG signals using the MIT-BIH Arrhythmia Database.",
      tags: ["PyTorch", "CNN", "MLP", "NumPy"],
      github: `${github}/Deep-Learning-Based-ECG-Signal-Classification`,
    },
    "/work/metro": {
      title: "Metro Health Patient Care System",
      short: "Metro Health",
      home: "work",
      kind: "Project",
      language: "EN",
      description:
        "A full-stack hospital management system with patient portals, staff workflows, and real-time alerts.",
      tags: ["React", "NestJS", "PostgreSQL", "Prisma"],
      github: `${github}/metrohealth`,
      demo: "https://youtu.be/a2-lpVSoVdc",
    },
    "/work/digits": {
      title: "K-Means + KNN Digit Recognition",
      short: "Digit recognition",
      home: "work",
      kind: "Project",
      language: "EN",
      description:
        "Exploring handwritten digit classification using K-Means clustering to enhance KNN performance.",
      tags: ["scikit-learn", "K-Means", "KNN", "TensorFlow"],
      github: digitRepo,
      pdf,
      paper: "/writing/digits",
    },
    "/writing/digits": {
      title:
        "Efficient Digit Recognition Using K-Means Clustering and K-Nearest Neighbors",
      short: "Efficient digit recognition",
      home: "work",
      kind: "Research paper",
      language: "EN",
      year: "2024",
      description:
        "Research on a hybrid approach to handwritten digit classification using K-Means and KNN.",
      tags: ["Machine learning", "MNIST"],
      github: digitRepo,
      pdf,
    },
    "/writing/faux-noble": {
      title: "Le faux noble et le vrai bonheur dans Le Bourgeois gentilhomme",
      short: "Le faux noble",
      home: "writing",
      kind: "Essay",
      language: "FR",
      year: "2025",
      description:
        "A literary analysis of Molière’s comedy exploring social status, honesty, and love.",
      tags: ["Literature", "Molière"],
      pdf: "papers/Le%20Bourgeois%20gentilhomme.pdf",
    },
    "/writing/ville-intelligente": {
      title:
        "La ville intelligente et IA à Paris : innovation ou précipitation ?",
      short: "La ville intelligente",
      home: "writing",
      kind: "Research paper",
      language: "FR",
      year: "2025",
      description:
        "An analysis of AI in Paris as a smart city, weighing innovation against surveillance and citizen participation.",
      tags: ["Artificial intelligence", "Paris"],
      pdf: "papers/La%20ville%20intelligent.pdf",
    },
  };
  const object = (id, label, prop, href, position, mobile, options = {}) => ({
    id,
    label,
    prop,
    href,
    position,
    mobile,
    ...options,
  });
  const worlds = {
    bay: {
      title: "Luke Caprio",
      caption: "Biscayne Bay",
      eyebrow: "A LITTLE CORNER OF THE INTERNET",
      description: "Software Engineer · Miami",
      note: "Pick a place. Stay a while.",
      objects: [
        object("work", "Work", "dock", "#/work", [49, 64], [50, 50], {
          description: "Projects at the research dock.",
        }),
        object(
          "writing",
          "Writing",
          "bookshop",
          "#/writing",
          [80, 66],
          [78, 65],
          { description: "Research, essays, and the bayside bookshop." },
        ),
        object("bizzy", "Bizzy", "venue", "#/bizzy", [17, 66], [22, 65], {
          description: "The waterfront venue.",
        }),
        object("about", "About", "porch", "#/about", [33, 83], [24, 83], {
          scale: 0.65,
          description: "A little about me, on the porch.",
        }),
        object(
          "contact",
          "Contact",
          "mailbox",
          "#/contact",
          [72, 83],
          [76, 83],
          {
            scale: 1.7,
            description: "Email, résumé, and links at the shore desk.",
          },
        ),
      ],
    },
    work: {
      title: "Work",
      caption: "The Research Dock",
      eyebrow: "01 / THE RESEARCH DOCK",
      description: "A few things I’ve built and explored.",
      note: "Three projects. Three places to start.",
      objects: [
        object(
          "ecg",
          "ECG classification",
          "boat",
          "#/work/ecg",
          [22, 61],
          [25, 56],
          {
            scale: 2.5,
            item: "/work/ecg",
            description: items["/work/ecg"].description,
          },
        ),
        object(
          "metro",
          "Metro Health",
          "tower",
          "#/work/metro",
          [50, 65],
          [75, 56],
          {
            scale: 1.6,
            item: "/work/metro",
            description: items["/work/metro"].description,
          },
        ),
        object(
          "digits",
          "Digit recognition",
          "arcade",
          "#/work/digits",
          [78, 65],
          [50, 78],
          {
            scale: 3,
            item: "/work/digits",
            description: items["/work/digits"].description,
          },
        ),
      ],
    },
    writing: {
      title: "Writing",
      caption: "Bayside Bookshop",
      eyebrow: "02 / BAYSIDE BOOKSHOP",
      description: "A small shelf of ideas.",
      note: "Open a book. Each piece has its own place.",
      objects: [
        object(
          "faux-noble",
          "Le faux noble",
          "book",
          "#/writing/faux-noble",
          [34, 64],
          [27, 62],
          {
            scale: 2.3,
            item: "/writing/faux-noble",
            description: items["/writing/faux-noble"].description,
          },
        ),
        object(
          "ville-intelligente",
          "La ville intelligente",
          "book",
          "#/writing/ville-intelligente",
          [66, 64],
          [73, 62],
          {
            scale: 2.3,
            item: "/writing/ville-intelligente",
            description: items["/writing/ville-intelligente"].description,
          },
        ),
      ],
    },
    about: {
      title: "About",
      caption: "The Porch",
      eyebrow: "03 / THE PORCH",
      description: "Miami now. Naples roots.",
      note: "Engineering, mathematics, and a little music.",
      objects: [],
    },
    bizzy: {
      title: "Bizzy",
      caption: "The Green Room",
      eyebrow: "04 / THE GREEN ROOM",
      description: "A neon-green night by the bay.",
      note: "Live College For Less.",
      objects: [
        object(
          "bizzy-club",
          "Visit Bizzy ↗",
          "bizzy-club",
          "https://bizzyu.com/",
          [50, 62],
          [50, 57],
          {
            scale: 2,
            description:
              "A campus deals and events marketplace for students and organizers.",
          },
        ),
      ],
    },
    contact: {
      title: "Contact",
      caption: "The Shore Desk",
      eyebrow: "05 / THE SHORE DESK",
      description: "Say hello from wherever you are.",
      note: "One mailbox. Open lines.",
      objects: [
        object(
          "email",
          "Email Luke ↗",
          "mailbox",
          "mailto:lukecaprio1@gmail.com",
          [25, 64],
          [26, 57],
          { scale: 3, description: "lukecaprio1@gmail.com" },
        ),
        object(
          "resume",
          "Résumé ↓",
          "notice",
          "assets/LukeCaprioResume2026.pdf",
          [50, 64],
          [74, 57],
          {
            scale: 2.6,
            pdf: true,
            description: "Download the existing résumé (PDF).",
          },
        ),
        object("github", "GitHub ↗", "sign", github, [75, 64], [50, 79], {
          scale: 2.2,
          description: "Code and projects on GitHub.",
        }),
      ],
    },
  };
  return { worlds, items, github, resume: "assets/LukeCaprioResume2026.pdf" };
})();
