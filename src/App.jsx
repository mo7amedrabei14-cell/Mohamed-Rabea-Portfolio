import { useEffect, useState } from 'react';

const links = {
  systemRepo: 'https://github.com/mo7amedrabei14-cell/eoc-system',
  presentationRepo: 'https://github.com/mo7amedrabei14-cell/eoc-presentation',
  presentationLive: 'https://mo7amedrabei14-cell.github.io/eoc-presentation/eoc-command-deck.html',
  email: 'mailto:mo7amed.rabei14@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mohamed-rabea-50644436b',
};

const copy = {
  en: {
    languageName: 'العربية',
    nav: [{ label: 'Selected work', id: 'work' }, { label: 'Capabilities', id: 'capabilities' }, { label: 'Experience', id: 'experience' }, { label: 'Contact', id: 'contact' }],
    eyebrow: 'DATA ANALYST · FULL-STACK DEVELOPER · OPERATIONS SUPERVISOR',
    hello: 'Hello, I’m',
    name: 'Mohamed Rabea.',
    heroLine1: 'Clear data.',
    heroLine2: 'Better decisions.',
    heroLine3: 'Systems that work.',
    heroIntro: 'I connect operational experience with data analysis and full-stack development to make complex work easier to understand, coordinate and improve.',
    primary: 'Explore selected work',
    secondary: 'Get in touch',
    location: 'Egypt · Humanitarian operations & digital tools',
    scroll: 'Scroll to explore',
    smallLabel: 'MY WORK SITS AT THE INTERSECTION OF',
    bridge: ['Operational reality', 'Useful data', 'Practical technology'],
    signal: 'From information to action',
    signalDesc: 'A practical approach: understand the need, structure the information, make the picture clear, and help people act on it.',
    process: ['Understand', 'Structure', 'Interpret', 'Act'],
    workEyebrow: 'SELECTED WORK',
    workTitle: 'Built around real needs.',
    workIntro: 'A few projects that show how I turn operational questions into useful systems, clear analysis and thoughtful communication.',
    project: 'PROJECT',
    role: 'MY FOCUS',
    details: 'What it does',
    approach: 'What I contributed',
    stack: 'TECHNOLOGY',
    openSource: 'Explore source code',
    openDemo: 'View interactive presentation',
    openReport: 'Open interactive report',
    eocKicker: 'FULL-STACK APPLICATION · FLAGSHIP PROJECT',
    eocTitle: 'EOC Smart Command Center',
    eocSummary: 'A web-based operations management platform built to bring essential Emergency Operations Center workflows into one structured environment.',
    eocProblemTitle: 'The need',
    eocProblem: 'Operational information can become fragmented across separate files, messages and manual follow-ups. The platform brings core workflows into a shared structure.',
    eocSolutionTitle: 'The platform',
    eocSolution: 'Mission and incident records, volunteer coordination, field assessment information, branch-linked workflows, operational logs, reporting and Excel export—supported by controlled access and traceable actions.',
    eocContributionTitle: 'Engineering focus',
    eocContribution: 'Developed the front end and API-backed workflows, connected the application to PostgreSQL, and implemented authentication, permission checks, event handling and audit logging.',
    eocModules: ['Missions & field operations', 'Volunteer coordination', 'Branch-linked workflows', 'Operational logs & reports', 'Earthquake and event monitoring', 'Weather intelligence'],
    analyticsKicker: 'BUSINESS INTELLIGENCE · DATA STORYTELLING',
    analyticsTitle: 'Power BI & Operational Analytics',
    analyticsSummary: 'Interactive dashboards designed to turn operational, field-assessment and service data into clearer views for review and decision support.',
    analyticsMain: '27-page ERC dashboard',
    analyticsMainDesc: 'A multi-page view for reviewing operational information and bringing related indicators together.',
    village: 'Village assessment dashboard',
    villageDesc: 'A multi-domain assessment model using a 1–5 rating scale across health, education, infrastructure and the local economy.',
    departments: 'Three department dashboards',
    departmentsDesc: 'Separate dashboard work for Health, Case Management and Psychosocial Support.',
    analyticsApproach: 'Data workflow',
    analyticsWorkflow: 'Clean and structure source data with Excel and Power Query, shape it for analysis, then present the relevant indicators through interactive Power BI views. QGIS supports spatial analysis in data and humanitarian contexts.',
    presentationKicker: 'INTERACTIVE COMMUNICATION · DIGITAL SHOWCASE',
    presentationTitle: 'EOC Interactive Presentation',
    presentationSummary: 'A purpose-built, interactive web presentation that explains the EOC platform as a coherent story—from the operational challenge to the technical approach and main modules.',
    presentationChallenge: 'The challenge',
    presentationChallengeDesc: 'A complex operational platform is difficult to explain through a list of features alone.',
    presentationDesign: 'The approach',
    presentationDesignDesc: 'A carefully sequenced visual narrative introduces the problem, then explains the platform architecture, workflow areas and decision-support intent.',
    presentationContribution: 'My contribution',
    presentationContributionDesc: 'Structured the story and built the interactive presentation experience using React and TypeScript, with motion and data-visualization components.',
    capabilitiesKicker: 'CAPABILITIES',
    capabilitiesTitle: 'A multidisciplinary toolkit.',
    capabilitiesIntro: 'The value is not just knowing tools—it is choosing the right tool for the operational question.',
    skillData: 'Data & Business Intelligence',
    skillDataDesc: 'Transforming raw or inconsistent information into useful models, indicators and readable dashboards.',
    skillDataList: ['Power BI', 'Power Query & Excel', 'Data cleaning & preparation', 'KPI design & operational reporting', 'SQL / PostgreSQL', 'Python & pandas'],
    skillBuild: 'Full-Stack Development',
    skillBuildDesc: 'Building connected front-end experiences and back-end services around real workflows.',
    skillBuildList: ['React, JavaScript & Vite', 'Python & FastAPI', 'REST APIs / OpenAPI', 'PostgreSQL data models', 'JWT authentication & access control', 'Leaflet maps & Excel exports'],
    skillHuman: 'Humanitarian Operations',
    skillHumanDesc: 'Understanding the constraints behind the data: response coordination, field needs and the people doing the work.',
    skillHumanList: ['Emergency operations coordination', 'Field assessment & response planning', 'Volunteer team coordination', 'QGIS for spatial analysis', 'Humanitarian planning & mapping', 'Psychological first aid awareness'],
    skillComms: 'Communication & Design',
    skillCommsDesc: 'Making detailed information easier to explain to visitors, stakeholders and decision-makers.',
    skillCommsList: ['Interactive presentations', 'Technical storytelling', 'Information hierarchy', 'PowerPoint & Word', 'Clear operational reports'],
    experienceKicker: 'EXPERIENCE',
    experienceTitle: 'Operations first. Technology in service of people.',
    experienceIntro: 'My perspective has been shaped by operational work, field missions, data responsibilities and hands-on technical projects.',
    exp1Title: 'Emergency Operations Center Supervisor',
    exp1Org: 'Egyptian Red Crescent Society',
    exp1Date: '2021 — Present',
    exp1Desc: 'Coordinate volunteer teams and response tasks, manage operational information flow, analyse field assessments, build dashboards, and prepare reports and decision-support summaries. Developed the EOC web management platform.',
    exp2Title: 'Fundraising Member',
    exp2Org: 'Egyptian Red Crescent Society',
    exp2Date: 'Until March 2024',
    exp2Desc: 'Engaged with the public, explained the Society’s humanitarian mission and encouraged donations for relief activities.',
    exp3Title: 'Field missions & emergency response',
    exp3Org: 'Egyptian Red Crescent Society',
    exp3Date: 'Across emergency deployments',
    exp3Desc: 'Supported refugees at the Qostol and Arqeen border crossings during the Sudan crisis; assisted relief distribution following the Syria–Turkey earthquake; and supported logistics and coordination during the Gaza response in El-Arish.',
    exp4Title: 'Activity Coordinator',
    exp4Org: 'Sparkles Kids Area',
    exp4Date: '2019 — 2021',
    exp4Desc: 'Organised activities for children, communicated with parents and helped maintain a safe, positive environment.',
    educationKicker: 'EDUCATION & TRAINING',
    educationTitle: 'Learning across disciplines.',
    education: 'Civil Engineering student',
    educationOrg: 'El-Madina Higher Institute for Engineering & Technology',
    educationStatus: 'Currently enrolled',
    course: 'Structural Design Course',
    courseOrg: 'Cairo University',
    courseDetails: 'AutoCAD · SAP2000 · SAFE · ETABS · CSI Columns',
    trainingLabel: 'SELECTED TRAINING',
    trainings: [
      'Crisis and Disaster Management — Qatar Red Crescent Society (10-day field and central operations camp)',
      'Introduction to GIS; Safety and Security During Disasters; Earthquake Response — IFRC',
      'Case Management & Refugee Support — IOM',
      'First Aid; Emergency Response and Preparedness — Egyptian Red Crescent',
    ],
    languagesLabel: 'LANGUAGES',
    languageDetails: 'Arabic — Native · English — Very good reading and writing; intermediate speaking',
    contactKicker: 'CONTACT',
    contactTitle: 'Let’s make complex work clearer.',
    contactDesc: 'For opportunities in data analytics, software development or humanitarian information systems, I’d be glad to connect.',
    emailBtn: 'Email Mohamed',
    linkedinBtn: 'Connect on LinkedIn',
    backTop: 'Back to top',
    footerNote: 'A portfolio of practical work across data, software and humanitarian operations.',
    artLabel: 'CONCEPTUAL PREVIEW · NOT LIVE OPERATIONAL DATA',
    platformLabel: 'PLATFORM MAP',
    dataLabel: 'ANALYTICS SNAPSHOT',
    presentationLabel: 'STORYBOARD',
    openTag: 'OPEN CASE STUDY',
    closeTag: 'HIDE DETAILS',
    localeAria: 'Switch language to Arabic',
    menuAria: 'Toggle navigation',
    brandTag: 'DATA · SYSTEMS · IMPACT',
    fieldNotesLabel: 'MR / FIELD NOTES',
    roleData: 'DATA INTELLIGENCE',
    roleSoftware: 'SOFTWARE ENGINEERING',
    roleHuman: 'HUMANITARIAN OPERATIONS',
    cairoLabel: 'CAIRO · EGYPT',
    boardTitle: 'OPERATIONS OVERVIEW',
    boardState: 'STRUCTURED',
    missionWorkflow: 'MISSION WORKFLOW',
    trackText: 'Record · Assign · Follow up',
    fieldDataLabel: 'FIELD DATA',
    connectedLabel: 'Connected',
    peopleLabel: 'PEOPLE & BRANCHES',
    coordinatedLabel: 'Coordinated',
    reportingLabel: 'REPORTING',
    reportingSummary: 'From records to review',
    caseStudyLabel: 'CASE STUDY / INTERFACE CONCEPT',
    assessmentLabel: 'FIELD ASSESSMENT',
    assessmentStatement: 'Multiple dimensions. One clearer view.',
    healthLabel: 'HEALTH',
    educationLabel: 'EDUCATION',
    infrastructureLabel: 'INFRASTRUCTURE',
    economyLabel: 'LOCAL ECONOMY',
    assessmentModelLabel: 'ASSESSMENT MODEL',
    ratingScaleLabel: '1—5 scale',
    structuredLabel: 'Structured view',
    challengeFrameLabel: '02 / THE CHALLENGE',
    challengeFrameText: 'From fragmented workflows',
    approachFrameLabel: '03 / THE APPROACH',
    approachFrameText: 'One connected operational picture',
    platformFrameLabel: '04 / THE PLATFORM',
    platformFrameText: 'Built around how teams work.',
    explainLabels: 'EXPLAIN · CONNECT · ENABLE',
  },
  ar: {
    languageName: 'English',
    nav: [{ label: 'المشروعات', id: 'work' }, { label: 'المهارات', id: 'capabilities' }, { label: 'الخبرة', id: 'experience' }, { label: 'التواصل', id: 'contact' }],
    eyebrow: 'محلل بيانات · مطور أنظمة متكاملة · مشرف عمليات الطوارئ',
    hello: 'مرحبًا، أنا',
    name: 'محمد ربيع.',
    heroLine1: 'بيانات أوضح.',
    heroLine2: 'قرارات أفضل.',
    heroLine3: 'أنظمة عملية.',
    heroIntro: 'أربط بين الخبرة التشغيلية وتحليل البيانات وتطوير الأنظمة المتكاملة، لتحويل العمل المعقد إلى إجراءات أوضح وأسهل في الفهم والتنسيق والتحسين.',
    primary: 'استكشف أبرز الأعمال',
    secondary: 'تواصل معي',
    location: 'مصر · العمليات الإنسانية والأدوات الرقمية',
    scroll: 'مرّر لاستكشاف الموقع',
    smallLabel: 'تتقاطع خبرتي في ثلاثة مجالات',
    bridge: ['الواقع التشغيلي', 'البيانات المفيدة', 'التقنية العملية'],
    signal: 'من المعلومات إلى الإجراء',
    signalDesc: 'منهج عملي يبدأ بفهم الاحتياج، ثم تنظيم المعلومات وتحليلها، وتوضيح الصورة لدعم اتخاذ الإجراء المناسب.',
    process: ['فهم الاحتياج', 'تنظيم البيانات', 'استخلاص الدلالة', 'دعم القرار'],
    workEyebrow: 'نماذج من الأعمال',
    workTitle: 'مشروعات تنطلق من احتياجات حقيقية.',
    workIntro: 'نماذج توضح كيف أحوّل الأسئلة التشغيلية إلى أنظمة مفيدة وتحليلات واضحة وطريقة عرض مدروسة.',
    project: 'المشروع',
    role: 'مجال مساهمتي',
    details: 'وظيفة المشروع',
    approach: 'ما أنجزته',
    stack: 'التقنيات المستخدمة',
    openSource: 'استكشف الشيفرة المصدرية',
    openDemo: 'شاهد العرض التفاعلي',
    openReport: 'افتح التقرير التفاعلي',
    eocKicker: 'تطوير متكامل · المشروع الرئيسي',
    eocTitle: 'نظام إدارة مركز عمليات الطوارئ',
    eocSummary: 'منصة ويب لإدارة عمليات مركز الطوارئ، صُممت لجمع مسارات العمل الأساسية داخل بيئة واحدة منظمة.',
    eocProblemTitle: 'الاحتياج',
    eocProblem: 'قد تتوزع المعلومات التشغيلية بين ملفات ورسائل ومتابعات يدوية متعددة. تجمع المنصة مسارات العمل الأساسية في هيكل مشترك.',
    eocSolutionTitle: 'المنصة',
    eocSolution: 'سجلات المهام والحوادث، وتنسيق المتطوعين، وبيانات التقييمات الميدانية، ومسارات العمل المرتبطة بالفروع، وسجلات العمليات والتقارير وتصدير ملفات إكسل، مع صلاحيات محددة وسجل يمكن الرجوع إليه.',
    eocContributionTitle: 'الجانب التقني',
    eocContribution: 'طورت واجهات الاستخدام ومسارات العمل المرتبطة بواجهات البرمجة، وربطت التطبيق بقاعدة بيانات PostgreSQL، ونفذت المصادقة والتحقق من الصلاحيات ومعالجة الأحداث وتسجيل الإجراءات.',
    eocModules: ['المهام والعمليات الميدانية', 'تنسيق المتطوعين', 'مسارات العمل حسب الفروع', 'سجلات العمليات والتقارير', 'رصد الزلازل والأحداث', 'استخبارات الطقس'],
    analyticsKicker: 'ذكاء الأعمال · عرض البيانات',
    analyticsTitle: 'تحليل البيانات ولوحات Power BI',
    analyticsSummary: 'لوحات تفاعلية تحول البيانات التشغيلية وبيانات التقييم الميداني والخدمات إلى صورة أوضح للمراجعة ودعم القرار.',
    analyticsMain: 'لوحة الهلال الأحمر — 27 صفحة',
    analyticsMainDesc: 'لوحة متعددة الصفحات لمراجعة المعلومات التشغيلية وربط المؤشرات ذات الصلة.',
    village: 'لوحة تقييم القرى',
    villageDesc: 'نموذج تقييم متعدد المجالات باستخدام مقياس من 1 إلى 5 للصحة والتعليم والبنية التحتية والاقتصاد المحلي.',
    departments: 'ثلاث لوحات للإدارات',
    departmentsDesc: 'لوحات مستقلة لإدارات الصحة وإدارة الحالة والدعم النفسي والاجتماعي.',
    analyticsApproach: 'سير عمل البيانات',
    analyticsWorkflow: 'تنظيف البيانات وتنظيمها باستخدام إكسل وPower Query، وتجهيزها للتحليل، ثم عرض المؤشرات ذات الصلة داخل لوحات Power BI تفاعلية. ويُستخدم QGIS للتحليل المكاني في سياقات تحليل البيانات والعمل الإنساني.',
    presentationKicker: 'التواصل التفاعلي · عرض رقمي',
    presentationTitle: 'العرض التفاعلي لمشروع مركز العمليات',
    presentationSummary: 'عرض ويب تفاعلي يشرح منصة مركز العمليات في تسلسل واضح؛ من التحدي التشغيلي إلى النهج التقني والوظائف الرئيسية.',
    presentationChallenge: 'التحدي',
    presentationChallengeDesc: 'يصعب شرح منصة تشغيلية معقدة عبر قائمة وظائف منفصلة فقط.',
    presentationDesign: 'طريقة العرض',
    presentationDesignDesc: 'سرد بصري متسلسل يقدم المشكلة أولًا، ثم يشرح بنية المنصة ومجالات العمل وكيف تدعم المعلومات اتخاذ القرار.',
    presentationContribution: 'مساهمتي',
    presentationContributionDesc: 'نظمت قصة العرض وبنيت التجربة التفاعلية باستخدام React وTypeScript ومكونات للحركة وعرض البيانات.',
    capabilitiesKicker: 'المهارات',
    capabilitiesTitle: 'خبرة متعددة التخصصات.',
    capabilitiesIntro: 'القيمة ليست في معرفة الأدوات فقط، بل في اختيار الأداة المناسبة للسؤال التشغيلي.',
    skillData: 'تحليل البيانات وذكاء الأعمال',
    skillDataDesc: 'تحويل البيانات الخام أو غير المتسقة إلى نماذج ومؤشرات ولوحات واضحة.',
    skillDataList: ['Power BI', 'Power Query وExcel', 'تنظيف البيانات وتجهيزها', 'تصميم المؤشرات والتقارير التشغيلية', 'SQL وPostgreSQL', 'Python وpandas'],
    skillBuild: 'تطوير الأنظمة المتكاملة',
    skillBuildDesc: 'بناء واجهات وخدمات خلفية مترابطة تخدم مسارات عمل فعلية.',
    skillBuildList: ['React وJavaScript وVite', 'Python وFastAPI', 'واجهات REST وOpenAPI', 'نمذجة بيانات PostgreSQL', 'المصادقة والتحكم في الصلاحيات', 'خرائط Leaflet وتصدير ملفات إكسل'],
    skillHuman: 'العمليات الإنسانية',
    skillHumanDesc: 'فهم الاحتياجات خلف البيانات: تنسيق الاستجابة واحتياجات الميدان والفرق التي تنفذ العمل.',
    skillHumanList: ['تنسيق عمليات الطوارئ', 'التقييم الميداني وتخطيط الاستجابة', 'تنسيق فرق المتطوعين', 'QGIS للتحليل المكاني', 'التخطيط والخرائط الإنسانية', 'الإلمام بالإسعاف النفسي الأولي'],
    skillComms: 'التواصل والتصميم',
    skillCommsDesc: 'تسهيل شرح المعلومات التفصيلية للزوار وأصحاب المصلحة ومتخذي القرار.',
    skillCommsList: ['العروض التقديمية التفاعلية', 'السرد التقني', 'تنظيم المعلومات بصريًا', 'PowerPoint وWord', 'التقارير التشغيلية الواضحة'],
    experienceKicker: 'الخبرة',
    experienceTitle: 'العمليات أولًا، والتقنية في خدمة الناس.',
    experienceIntro: 'تشكّلت رؤيتي من العمل التشغيلي والمهام الميدانية ومسؤوليات البيانات والمشروعات التقنية العملية.',
    exp1Title: 'مشرف مركز عمليات الطوارئ',
    exp1Org: 'جمعية الهلال الأحمر المصري',
    exp1Date: '2021 — حتى الآن',
    exp1Desc: 'تنسيق فرق المتطوعين ومهام الاستجابة، وإدارة تدفق المعلومات التشغيلية، وتحليل التقييمات الميدانية، وبناء اللوحات وإعداد التقارير وملخصات دعم القرار. كما طورت منصة الويب لإدارة مركز العمليات.',
    exp2Title: 'عضو جمع تبرعات',
    exp2Org: 'جمعية الهلال الأحمر المصري',
    exp2Date: 'حتى مارس 2024',
    exp2Desc: 'التواصل مع الجمهور وشرح رسالة الجمعية الإنسانية وتشجيع التبرعات للأنشطة الإغاثية.',
    exp3Title: 'المهام الميدانية والاستجابة للطوارئ',
    exp3Org: 'جمعية الهلال الأحمر المصري',
    exp3Date: 'خلال عمليات الاستجابة',
    exp3Desc: 'دعم اللاجئين عند معبري قسطل وأرقين خلال أزمة السودان، والمساعدة في تنظيم وتوزيع الإغاثة خلال زلزال سوريا وتركيا، والمشاركة في الجهود اللوجستية والتنسيقية لاستجابة غزة في العريش.',
    exp4Title: 'منسق أنشطة',
    exp4Org: 'Sparkles Kids Area',
    exp4Date: '2019 — 2021',
    exp4Desc: 'تنظيم أنشطة الأطفال والتواصل مع أولياء الأمور والمساعدة في الحفاظ على بيئة آمنة وإيجابية.',
    educationKicker: 'التعليم والتدريب',
    educationTitle: 'تعلّم يجمع بين تخصصات متعددة.',
    education: 'طالب بقسم الهندسة المدنية',
    educationOrg: 'المعهد العالي للهندسة والتكنولوجيا بالمدينة',
    educationStatus: 'مقيد حاليًا',
    course: 'دورة التصميم الإنشائي',
    courseOrg: 'جامعة القاهرة',
    courseDetails: 'AutoCAD · SAP2000 · SAFE · ETABS · CSI Columns',
    trainingLabel: 'تدريبات مختارة',
    trainings: [
      'إدارة الأزمات والكوارث — الهلال الأحمر القطري (معسكر لمدة 10 أيام للعمليات المركزية والميدانية)',
      'مقدمة في نظم المعلومات الجغرافية، والسلامة والأمن أثناء الكوارث، والاستجابة للزلازل — الاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر',
      'إدارة الحالات ودعم اللاجئين — المنظمة الدولية للهجرة',
      'الإسعافات الأولية، والاستجابة للطوارئ والاستعداد — الهلال الأحمر المصري',
    ],
    languagesLabel: 'اللغات',
    languageDetails: 'العربية — اللغة الأم · الإنجليزية — جيد جدًا في القراءة والكتابة، ومتوسط في المحادثة',
    contactKicker: 'تواصل',
    contactTitle: 'لنجعل العمل المعقد أوضح.',
    contactDesc: 'للفرص في تحليل البيانات أو تطوير الأنظمة أو نظم المعلومات الإنسانية، يسعدني التواصل.',
    emailBtn: 'راسل محمد',
    linkedinBtn: 'تواصل عبر لينكدإن',
    backTop: 'العودة للأعلى',
    footerNote: 'نماذج من الأعمال العملية في البيانات والبرمجيات والعمليات الإنسانية.',
    artLabel: 'معاينة توضيحية · ليست بيانات تشغيل حية',
    platformLabel: 'تصور لبنية المنصة',
    dataLabel: 'تصور للتحليل',
    presentationLabel: 'لوحة تسلسل العرض',
    openTag: 'عرض تفاصيل المشروع',
    closeTag: 'إخفاء التفاصيل',
    localeAria: 'تغيير اللغة إلى الإنجليزية',
    menuAria: 'فتح أو إغلاق القائمة',
    brandTag: 'البيانات · الأنظمة · الأثر',
    fieldNotesLabel: 'محمد ربيع / ملاحظات ميدانية',
    roleData: 'ذكاء البيانات',
    roleSoftware: 'تطوير البرمجيات',
    roleHuman: 'العمليات الإنسانية',
    cairoLabel: 'القاهرة · مصر',
    boardTitle: 'نظرة عامة على العمليات',
    boardState: 'منظم',
    missionWorkflow: 'مسار المهمة',
    trackText: 'تسجيل · تكليف · متابعة',
    fieldDataLabel: 'البيانات الميدانية',
    connectedLabel: 'مترابطة',
    peopleLabel: 'الأفراد والفروع',
    coordinatedLabel: 'منسقون',
    reportingLabel: 'التقارير',
    reportingSummary: 'من السجلات إلى المراجعة',
    caseStudyLabel: 'دراسة حالة / تصور للواجهة',
    assessmentLabel: 'التقييم الميداني',
    assessmentStatement: 'مجالات متعددة. رؤية أوضح.',
    healthLabel: 'الصحة',
    educationLabel: 'التعليم',
    infrastructureLabel: 'البنية التحتية',
    economyLabel: 'الاقتصاد المحلي',
    assessmentModelLabel: 'نموذج التقييم',
    ratingScaleLabel: 'مقياس 1–5',
    structuredLabel: 'عرض منظم',
    challengeFrameLabel: '02 / التحدي',
    challengeFrameText: 'من مسارات عمل متفرقة',
    approachFrameLabel: '03 / النهج',
    approachFrameText: 'صورة تشغيلية مترابطة',
    platformFrameLabel: '04 / المنصة',
    platformFrameText: 'مصممة وفق طريقة عمل الفرق.',
    explainLabels: 'شرح · ربط · تمكين',
  },
};

function Arrow({ diagonal = false }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="arrow-icon" fill="none">
    {diagonal ? <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
}

function Mark() {
  return <img className="brand-portrait" src={`${import.meta.env.BASE_URL}images/Personal.png`} alt="Mohamed Rabea" width="38" height="38" />;
}

function ProjectArt({ type, copy: c }) {
  if (type === 'platform') {
    return <div className="art art--photo art--platform" aria-label={c.platformLabel}>
      <div className="art-caption">{c.platformLabel}<span>01 / 03</span></div>
      <img className="art-photo" src={`${import.meta.env.BASE_URL}images/05-operations-overview.png`} alt="Real screenshot of the EOC Smart Command Center operations overview" />
      <div className="art-note">{c.artLabel}</div>
    </div>;
  }
  if (type === 'analytics') {
    return <div className="art art--analytics" aria-label={c.dataLabel} role="img">
      <div className="art-caption">{c.dataLabel}<span>02 / 03</span></div>
      <div className="analytics-sheet">
        <div className="analytics-head"><div><span>{c.assessmentLabel}</span><strong>{c.assessmentStatement}</strong></div><div className="round-glyph">↗</div></div>
        <div className="metric-row"><div><small>{c.healthLabel}</small><span className="metric-line"><i style={{width:'74%'}} /></span></div><div><small>{c.educationLabel}</small><span className="metric-line"><i style={{width:'61%'}} /></span></div></div>
        <div className="metric-row"><div><small>{c.infrastructureLabel}</small><span className="metric-line"><i style={{width:'86%'}} /></span></div><div><small>{c.economyLabel}</small><span className="metric-line"><i style={{width:'68%'}} /></span></div></div>
        <div className="analytics-bottom"><span>{c.assessmentModelLabel}</span><strong>{c.ratingScaleLabel}</strong><span>{c.structuredLabel}</span></div>
      </div>
      <div className="art-note">{c.artLabel}</div>
    </div>;
  }
  return <div className="art art--photo art--presentation" aria-label={c.presentationLabel}>
    <div className="art-caption">{c.presentationLabel}<span>03 / 03</span></div>
    <img className="art-photo" src={`${import.meta.env.BASE_URL}images/pres.png`} alt="Screenshot of the EOC interactive presentation" />
    <div className="art-note">{c.artLabel}</div>
  </div>;
}

function App() {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const c = copy[lang];
  const rtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.title = rtl
      ? 'محمد ربيع — البيانات والأنظمة والعمليات الإنسانية'
      : 'Mohamed Rabea — Data, Systems & Humanitarian Operations';
  }, [lang, rtl]);

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [lang]);

  const toggleLanguage = () => {
    setLang((previous) => previous === 'en' ? 'ar' : 'en');
    setMenuOpen(false);
  };
  const closeMenu = () => setMenuOpen(false);

  return <div className={rtl ? 'site site--ar' : 'site site--en'}>
    <a className="skip-link" href="#main">{rtl ? 'تجاوز إلى المحتوى' : 'Skip to content'}</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top" onClick={closeMenu} aria-label="Mohamed Rabea — home">
          <Mark />
          <span className="brand-copy"><strong>MOHAMED RABEA</strong><small>{c.brandTag}</small></span>
        </a>
        <button className="menu-toggle" aria-label={c.menuAria} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label={rtl ? 'التنقل الرئيسي' : 'Main navigation'}>
          {c.nav.map((item) => <a key={item.id} href={'#' + item.id} onClick={closeMenu}>{item.label}</a>)}
          <button className="language-toggle" onClick={toggleLanguage} aria-label={c.localeAria}>{c.languageName}<span>↗</span></button>
          <a className="nav-contact" href="#contact" onClick={closeMenu}>{rtl ? 'لنتحدث' : 'Let’s talk'} <Arrow diagonal /></a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section className="hero section-wrap" id="top">
        <div className="hero-copy" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" />{c.eyebrow}</div>
          <p className="hero-greeting">{c.hello}</p>
          <h1>{c.name}<br /><span>{c.heroLine1}</span><br /><em>{c.heroLine2}</em><br /><span>{c.heroLine3}</span></h1>
          <p className="hero-intro">{c.heroIntro}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#work">{c.primary}<Arrow diagonal /></a>
            <a className="text-link" href="#contact">{c.secondary}<Arrow /></a>
          </div>
          <div className="hero-footnote"><span className="micro-mark">EG</span><span>{c.location}</span></div>
        </div>
        <div className="hero-art" data-reveal aria-label={c.signal}>
          <div className="hero-art-top"><span>{c.fieldNotesLabel}</span><span>01—04</span></div>
          <div className="signal-orbit orbit-one" /><div className="signal-orbit orbit-two" /><div className="signal-core"><span>MR</span><i /></div>
          <div className="signal-card signal-card--top"><span className="signal-number">01</span><span>{c.roleData}</span><i className="signal-pip" /></div>
          <div className="signal-card signal-card--right"><span className="signal-number">02</span><span>{c.roleSoftware}</span><i className="signal-pip" /></div>
          <div className="signal-card signal-card--bottom"><span className="signal-number">03</span><span>{c.roleHuman}</span><i className="signal-pip" /></div>
          <div className="hero-art-bottom"><span>{rtl ? 'الفهم قبل الأدوات' : 'UNDERSTAND BEFORE YOU BUILD'}</span><span>{c.cairoLabel}</span></div>
        </div>
        <a href="#signal" className="scroll-cue"><span>{c.scroll}</span><i /></a>
      </section>

      <section className="signal-section" id="signal">
        <div className="section-wrap signal-inner">
          <div className="section-kicker" data-reveal>{c.smallLabel}</div>
          <div className="bridge-grid" data-reveal>{c.bridge.map((item, i) => <div className="bridge-item" key={item}><span>0{i + 1}</span><strong>{item}</strong><i><Arrow diagonal /></i></div>)}</div>
          <div className="method-row" data-reveal>
            <div><span className="method-label">{c.signal}</span><p>{c.signalDesc}</p></div>
            <div className="process-flow">{c.process.map((step, i) => <div key={step} className="process-step"><span>{String(i + 1).padStart(2,'0')}</span><strong>{step}</strong>{i < c.process.length - 1 && <i className="process-connector" />}</div>)}</div>
          </div>
        </div>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="section-heading" data-reveal>
          <div><div className="eyebrow"><span className="eyebrow-dot" />{c.workEyebrow}</div><h2>{c.workTitle}</h2></div>
          <p>{c.workIntro}</p>
        </div>

        <article className="project project--featured" data-reveal>
          <div className="project-main">
            <div className="project-number">01 <span>/ 03</span></div>
            <div className="project-kicker">{c.eocKicker}</div>
            <h3>{c.eocTitle}</h3>
            <p className="project-summary">{c.eocSummary}</p>
            <div className="project-module-list">{c.eocModules.map((module, i) => <span key={module}><i>{String(i + 1).padStart(2,'0')}</i>{module}</span>)}</div>
            <div className="tag-row"><span>React 19</span><span>Vite</span><span>Python</span><span>FastAPI</span><span>PostgreSQL</span><span>JWT</span><span>OpenAPI</span><span>Leaflet</span><span>ExcelJS</span></div>
            <div className="project-links"><a className="button button--dark" href={links.systemRepo} target="_blank" rel="noreferrer">{c.openSource}<Arrow diagonal /></a></div>
          </div>
          <ProjectArt type="platform" copy={c} />
          <div className="project-detail">
            <div><span className="detail-label">{c.details}</span><p>{c.eocSolution}</p></div>
            <div><span className="detail-label">{c.approach}</span><p>{c.eocContribution}</p></div>
            <div><span className="detail-label">{c.role}</span><p>{c.eocProblem}</p></div>
          </div>
        </article>

        <div className="project-pair">
          <article className="project project--standard" data-reveal>
            <div className="project-number">02 <span>/ 03</span></div>
            <ProjectArt type="analytics" copy={c} />
            <div className="project-content">
              <div className="project-kicker">{c.analyticsKicker}</div>
              <h3>{c.analyticsTitle}</h3>
              <p className="project-summary">{c.analyticsSummary}</p>
              <div className="analytics-facts">
                <div><span className="fact-index">01</span><div><strong>{c.analyticsMain}</strong><p>{c.analyticsMainDesc}</p></div></div>
                <div><span className="fact-index">02</span><div><strong>{c.village}</strong><p>{c.villageDesc}</p></div></div>
                <div><span className="fact-index">03</span><div><strong>{c.departments}</strong><p>{c.departmentsDesc}</p></div></div>
              </div>
              <div className="approach-note"><span>{c.analyticsApproach}</span><p>{c.analyticsWorkflow}</p></div>
              <div className="tag-row"><span>Power BI</span><span>Power Query</span><span>Excel</span><span>QGIS</span></div>
            </div>
          </article>

          <article className="project project--standard project--story" data-reveal>
            <div className="project-number">03 <span>/ 03</span></div>
            <ProjectArt type="presentation" copy={c} />
            <div className="project-content">
              <div className="project-kicker">{c.presentationKicker}</div>
              <h3>{c.presentationTitle}</h3>
              <p className="project-summary">{c.presentationSummary}</p>
              <div className="story-points">
                <div><span>01</span><strong>{c.presentationChallenge}</strong><p>{c.presentationChallengeDesc}</p></div>
                <div><span>02</span><strong>{c.presentationDesign}</strong><p>{c.presentationDesignDesc}</p></div>
                <div><span>03</span><strong>{c.presentationContribution}</strong><p>{c.presentationContributionDesc}</p></div>
              </div>
              <div className="tag-row"><span>React 19</span><span>TypeScript</span><span>Vite</span><span>Framer Motion</span><span>Recharts</span></div>
              <div className="project-links project-links--stacked">
                <a className="text-link project-text-link" href={links.presentationLive} target="_blank" rel="noreferrer">{c.openDemo}<Arrow diagonal /></a>
                <a className="text-link project-text-link" href={links.presentationRepo} target="_blank" rel="noreferrer">{c.openSource}<Arrow diagonal /></a>
              </div>
              <p className="project-full-note">
                {rtl
                  ? <>ملحوظة: لمشاهدة المشروع بشكل كامل، يُرجى الاطلاع على <a href={links.presentationLive} target="_blank" rel="noreferrer">العرض التقديمي التفاعلي</a>.</>
                  : <>Note: To explore the project in full, please see the <a href={links.presentationLive} target="_blank" rel="noreferrer">interactive presentation</a>.</>}
              </p>
            </div>
          </article>
        </div>
        <p className="disclaimer">{c.artLabel}</p>
      </section>

      <section className="capabilities-section" id="capabilities">
        <div className="section-wrap">
          <div className="section-heading section-heading--light" data-reveal>
            <div><div className="eyebrow"><span className="eyebrow-dot" />{c.capabilitiesKicker}</div><h2>{c.capabilitiesTitle}</h2></div>
            <p>{c.capabilitiesIntro}</p>
          </div>
          <div className="capability-grid">
            <article className="capability-card" data-reveal><div className="capability-top"><span>01</span><span className="capability-glyph">↗</span></div><h3>{c.skillData}</h3><p>{c.skillDataDesc}</p><ul>{c.skillDataList.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="capability-card" data-reveal><div className="capability-top"><span>02</span><span className="capability-glyph">{'{}'}</span></div><h3>{c.skillBuild}</h3><p>{c.skillBuildDesc}</p><ul>{c.skillBuildList.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="capability-card" data-reveal><div className="capability-top"><span>03</span><span className="capability-glyph">⌖</span></div><h3>{c.skillHuman}</h3><p>{c.skillHumanDesc}</p><ul>{c.skillHumanList.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="capability-card" data-reveal><div className="capability-top"><span>04</span><span className="capability-glyph">✳</span></div><h3>{c.skillComms}</h3><p>{c.skillCommsDesc}</p><ul>{c.skillCommsList.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
        </div>
      </section>

      <section className="experience-section section-wrap" id="experience">
        <div className="section-heading" data-reveal>
          <div><div className="eyebrow"><span className="eyebrow-dot" />{c.experienceKicker}</div><h2>{c.experienceTitle}</h2></div>
          <p>{c.experienceIntro}</p>
        </div>
        <div className="timeline">
          {[['01',c.exp1Title,c.exp1Org,c.exp1Date,c.exp1Desc],['02',c.exp2Title,c.exp2Org,c.exp2Date,c.exp2Desc],['03',c.exp3Title,c.exp3Org,c.exp3Date,c.exp3Desc],['04',c.exp4Title,c.exp4Org,c.exp4Date,c.exp4Desc]].map((item) => <article className="timeline-item" key={item[0]} data-reveal><span className="timeline-index">{item[0]}</span><div className="timeline-body"><div className="timeline-heading"><div><h3>{item[1]}</h3><p>{item[2]}</p></div><time>{item[3]}</time></div><p className="timeline-desc">{item[4]}</p></div></article>)}
        </div>
      </section>

      <section className="education-section">
        <div className="section-wrap education-grid">
          <div data-reveal>
            <div className="eyebrow"><span className="eyebrow-dot" />{c.educationKicker}</div>
            <h2>{c.educationTitle}</h2>
            <div className="education-item"><span className="edu-icon">01</span><div><h3>{c.education}</h3><p>{c.educationOrg}</p><small>{c.educationStatus}</small></div></div>
            <div className="education-item"><span className="edu-icon">02</span><div><h3>{c.course}</h3><p>{c.courseOrg}</p><small>{c.courseDetails}</small></div></div>
          </div>
          <div className="training-panel" data-reveal>
            <div className="training-heading">{c.trainingLabel}</div>
            <ul>{c.trainings.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className="training-heading training-heading--language">{c.languagesLabel}</div>
            <p>{c.languageDetails}</p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-wrap contact-inner" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" />{c.contactKicker}</div>
          <h2>{c.contactTitle}</h2>
          <p>{c.contactDesc}</p>
          <div className="contact-actions"><a className="button button--light" href={links.email}>{c.emailBtn}<Arrow diagonal /></a><a className="contact-social" href={links.linkedin} target="_blank" rel="noreferrer">{c.linkedinBtn}<Arrow diagonal /></a></div>
          <div className="contact-details"><a href={links.email}>mo7amed.rabei14@gmail.com</a><span>·</span><a href="tel:+201090509181">+20 109 050 9181</a><span>·</span><span>{rtl ? "مصر" : "Egypt"}</span></div>
          <div className="contact-orbit contact-orbit--one" /><div className="contact-orbit contact-orbit--two" />
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="section-wrap footer-inner"><a className="brand brand--footer" href="#top"><Mark /><span className="brand-copy"><strong>MOHAMED RABEA</strong><small>{c.brandTag}</small></span></a><p>{c.footerNote}</p><a href="#top" className="footer-top">{c.backTop}<Arrow diagonal /></a><span className="footer-year">© {new Date().getFullYear()}</span></div>
    </footer>
  </div>;
}

export default App;
