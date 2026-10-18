import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { startHorizon } from './horizon.js';

const links = {
  systemRepo: 'https://github.com/mo7amedrabei14-cell/eoc-system',
  presentationRepo: 'https://github.com/mo7amedrabei14-cell/eoc-presentation',
  presentationLive: 'https://mo7amedrabei14-cell.github.io/eoc-presentation/eoc-command-deck.html',
  email: 'mailto:mo7amed.rabei14@gmail.com',
  whatsapp: 'https://wa.me/201090509181',
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
    embeddedPresentationEyebrow: 'LIVE INTERACTIVE PRESENTATION',
    embeddedPresentationTitle: 'Explore the presentation here.',
    embeddedPresentationDesc: 'The interactive EOC presentation is now available inside this portfolio. Scroll through it below, or open a separate tab if needed.',
    openPresentationInNewTab: 'Open in a separate tab',
    hidePresentation: 'Hide presentation',
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
    whatsappBtn: 'Message me on WhatsApp',
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
    embeddedPresentationEyebrow: 'العرض التفاعلي المباشر',
    embeddedPresentationTitle: 'استكشف العرض من هنا.',
    embeddedPresentationDesc: 'أصبح العرض التفاعلي لمركز العمليات متاحًا داخل البورتفوليو. يمكنك تصفحه بالأسفل أو فتحه في تبويب مستقل عند الحاجة.',
    openPresentationInNewTab: 'فتح في تبويب مستقل',
    hidePresentation: 'إخفاء العرض',
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
    whatsappBtn: 'راسلني على واتساب',
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

function Mark({ onOpen }) {
  return <img className="brand-portrait image-zoom-trigger" src={`${import.meta.env.BASE_URL}images/Personal.jpg`} alt="Mohamed Rabea" width="38" height="38" role="button" tabIndex={0} onClick={() => onOpen?.({ src: `${import.meta.env.BASE_URL}images/Personal.jpg`, alt: 'Mohamed Rabea' })} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.({ src: `${import.meta.env.BASE_URL}images/Personal.jpg`, alt: 'Mohamed Rabea' }); } }} aria-label="Open portrait full screen" />;
}

function trackArtPointer(event) {
  const surface = event.currentTarget;
  if (
    event.pointerType === 'touch' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  const rect = surface.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

  // Direct DOM updates keep pointer motion smooth without causing React re-renders.
  surface.style.setProperty('--art-pointer-x', `${x * 100}%`);
  surface.style.setProperty('--art-pointer-y', `${y * 100}%`);
  surface.style.setProperty('--art-shift-x', `${(0.5 - x) * 8}px`);
  surface.style.setProperty('--art-shift-y', `${(0.5 - y) * 6}px`);
}

function resetArtPointer(event) {
  const surface = event.currentTarget;
  surface.style.setProperty('--art-pointer-x', '50%');
  surface.style.setProperty('--art-pointer-y', '50%');
  surface.style.setProperty('--art-shift-x', '0px');
  surface.style.setProperty('--art-shift-y', '0px');
}


function trackHeroPointer(event) {
  const surface = event.currentTarget;
  if (
    event.pointerType === 'touch' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  const rect = surface.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

  surface.style.setProperty('--hero-pointer-x', `${x * 100}%`);
  surface.style.setProperty('--hero-pointer-y', `${y * 100}%`);
  surface.style.setProperty('--hero-drift-x', `${(0.5 - x) * 14}px`);
  surface.style.setProperty('--hero-drift-y', `${(0.5 - y) * 10}px`);
  surface.style.setProperty('--hero-drift-reverse-x', `${(x - 0.5) * 10}px`);
  surface.style.setProperty('--hero-drift-reverse-y', `${(y - 0.5) * 8}px`);
}

function resetHeroPointer(event) {
  const surface = event.currentTarget;
  surface.style.setProperty('--hero-pointer-x', '50%');
  surface.style.setProperty('--hero-pointer-y', '50%');
  surface.style.setProperty('--hero-drift-x', '0px');
  surface.style.setProperty('--hero-drift-y', '0px');
  surface.style.setProperty('--hero-drift-reverse-x', '0px');
  surface.style.setProperty('--hero-drift-reverse-y', '0px');
}

function trackMagneticPointer(event) {
  const control = event.currentTarget;
  if (
    event.pointerType === 'touch' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  const rect = control.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
  const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
  control.style.setProperty('--magnetic-x', `${Math.max(-1, Math.min(1, x)) * 5}px`);
  control.style.setProperty('--magnetic-y', `${Math.max(-1, Math.min(1, y)) * 4}px`);
}

function resetMagneticPointer(event) {
  event.currentTarget.style.setProperty('--magnetic-x', '0px');
  event.currentTarget.style.setProperty('--magnetic-y', '0px');
}

function ProjectArt({ type, copy: c, onImageOpen }) {
  if (type === 'platform') {
    return <div className="art art--photo art--platform" aria-label={c.platformLabel} onPointerMove={trackArtPointer} onPointerLeave={resetArtPointer}>
      <div className="art-caption">{c.platformLabel}<span>01 / 03</span></div>
      <img className="art-photo image-zoom-trigger" src={`${import.meta.env.BASE_URL}images/05-operations-overview.png`} alt="Real screenshot of the EOC Smart Command Center operations overview" role="button" tabIndex={0} onClick={(event) => onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt })} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt }); } }} aria-label="Open project image full screen" />
      <div className="art-note">{c.artLabel}</div>
    </div>;
  }
  if (type === 'analytics') {
    return <div className="art art--photo art--analytics" aria-label={c.dataLabel} onPointerMove={trackArtPointer} onPointerLeave={resetArtPointer}>
      <div className="art-caption">{c.dataLabel}<span>02 / 03</span></div>
      <img
        className="art-photo image-zoom-trigger"
        src={`${import.meta.env.BASE_URL}images/dashboard_blurred_final.png`}
        alt="Screenshot of the Power BI operational analytics dashboard"
        role="button" tabIndex={0}
        onClick={(event) => onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt })}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt }); } }}
        aria-label="Open project image full screen"
      />
      <div className="art-note">{c.artLabel}</div>
    </div>;
  }
  return <div className="art art--photo art--presentation" aria-label={c.presentationLabel} onPointerMove={trackArtPointer} onPointerLeave={resetArtPointer}>
    <div className="art-caption">{c.presentationLabel}<span>03 / 03</span></div>
    <img className="art-photo image-zoom-trigger" src={`${import.meta.env.BASE_URL}images/pres.png`} alt="Screenshot of the EOC interactive presentation" role="button" tabIndex={0} onClick={(event) => onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt })} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onImageOpen({ src: event.currentTarget.src, alt: event.currentTarget.alt }); } }} aria-label="Open project image full screen" />
    <div className="art-note">{c.artLabel}</div>
  </div>;
}

function HzProject({ n, kicker, title, summary, label, img, alt, onImageOpen, tags, actions, children }) {
  const open = (e) => onImageOpen({ src: e.currentTarget.src, alt: e.currentTarget.alt });
  return <article className="hz-card" style={{ '--i': Number(n) - 1 }}>
    <div className="hz-card-media">
      <div className="hz-card-bar"><i /><i /><i /><span>{label}</span></div>
      <img src={`${import.meta.env.BASE_URL}images/${img}`} alt={alt} role="button" tabIndex={0} onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); } }} />
    </div>
    <div className="hz-card-body">
      <div className="hz-card-top"><span className="hz-card-n">{n}</span><span className="hz-kicker">{kicker}</span></div>
      <h3>{title}</h3>
      <p className="hz-proj-sum">{summary}</p>
      {children}
      <div className="hz-tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
      <div className="hz-proj-actions">{actions}</div>
    </div>
  </article>;
}

function App() {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showPresentationEmbed, setShowPresentationEmbed] = useState(false);
  const presentationEmbedRef = useRef(null);
  const c = copy[lang];
  const rtl = lang === 'ar';
  useEffect(() => startHorizon(), []);
  const activeRole = hoveredRole || selectedRole;
  const heroRoleMark = activeRole === 'data'
    ? 'BI'
    : activeRole === 'software'
      ? 'FS'
      : activeRole === 'humanitarian'
        ? 'EOC'
        : 'MR';
  const openImage = (image) => setLightboxImage(image);
  const closeImage = () => setLightboxImage(null);
  const openEmbeddedPresentation = () => {
    if (showPresentationEmbed) {
      presentationEmbedRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }
    setShowPresentationEmbed(true);
  };

  useEffect(() => {
    if (!showPresentationEmbed) return undefined;
    const section = presentationEmbedRef.current;
    if (!section) return undefined;
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    return undefined;
  }, [showPresentationEmbed]);

  useEffect(() => {
    if (!lightboxImage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => { if (event.key === 'Escape') closeImage(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxImage]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.title = rtl
      ? 'محمد ربيع — البيانات والأنظمة والعمليات الإنسانية'
      : 'Mohamed Rabea — Data, Systems & Humanitarian Operations';
  }, [lang, rtl]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    let observer;

    const revealEverything = () => {
      root.classList.remove('motion-ready');
      nodes.forEach((node) => node.classList.add('is-visible'));
    };

    // Motion is progressive enhancement: never let an unsupported or interrupted
    // observer hide the portfolio content.
    if (
      !nodes.length ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      revealEverything();
      return undefined;
    }

    try {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px 8% 0px' });

      // Keep the first viewport visible before enabling the reveal layer.
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight * 1.1) {
          node.classList.add('is-visible');
        }
        observer.observe(node);
      });

      root.classList.add('motion-ready');
      return () => {
        observer?.disconnect();
        root.classList.remove('motion-ready');
      };
    } catch (error) {
      observer?.disconnect();
      revealEverything();
      return undefined;
    }
  }, [lang]);


  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollFrame = 0;
    let pointerFrame = 0;
    let latestPointer = null;

    const syncMotionPreference = () => {
      root.classList.toggle('motion-reduced', motionPreference.matches);
    };

    const updateScrollState = () => {
      scrollFrame = 0;
      const scrollRange = Math.max(root.scrollHeight - window.innerHeight, 0);
      const progress = scrollRange ? (window.scrollY / scrollRange) * 100 : 0;
      root.style.setProperty('--page-progress', `${Math.min(100, Math.max(0, progress))}%`);
      root.classList.toggle('is-scrolled', window.scrollY > 16);
    };

    const scheduleScrollUpdate = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    const handlePointerMove = (event) => {
      if (motionPreference.matches || event.pointerType === 'touch') return;
      latestPointer = { x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!latestPointer) return;
        root.style.setProperty('--pointer-x', `${latestPointer.x}px`);
        root.style.setProperty('--pointer-y', `${latestPointer.y}px`);
      });
    };

    syncMotionPreference();
    updateScrollState();
    motionPreference.addEventListener?.('change', syncMotionPreference);
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      motionPreference.removeEventListener?.('change', syncMotionPreference);
      window.removeEventListener('scroll', scheduleScrollUpdate);
      window.removeEventListener('resize', scheduleScrollUpdate);
      window.removeEventListener('pointermove', handlePointerMove);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    };
  }, []);


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
          <Mark onOpen={openImage} />
          <span className="brand-copy"><strong>MOHAMED RABEA</strong><small>{c.brandTag}</small></span>
        </a>
        <button className="menu-toggle" aria-label={c.menuAria} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label={rtl ? 'التنقل الرئيسي' : 'Main navigation'}>
          {c.nav.map((item) => <a key={item.id} href={'#' + item.id} onClick={closeMenu}>{item.label}</a>)}
          <button className="language-toggle" onClick={toggleLanguage} aria-label={c.localeAria}>{c.languageName}<span>↗</span></button>
          <a className="nav-contact" href="#contact" onClick={closeMenu} onPointerMove={trackMagneticPointer} onPointerLeave={resetMagneticPointer}>{rtl ? 'لنتحدث' : 'Let’s talk'} <Arrow diagonal /></a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section className="hero" id="top">
        <div className="hz-meta"><span>Cairo · EG — <time className="hz-clock">--:--:--</time></span><span>{c.brandTag}</span></div>
        <h1 className="hz-hero-name">
          <span className="sr-only">{c.name}</span>
          {rtl ? <span className="hz-word" aria-hidden="true"><i className="hz-aw">{c.name.replace(/\.$/, '')}</i></span>
            : ['MOHAMED', 'RABEA'].map((w) => <span className="hz-word" key={w} aria-hidden="true">{[...w].map((ch, k) => <i className="hz-ch" key={k}>{ch}</i>)}</span>)}
        </h1>
        <div className="hz-row">
          <p className="hz-lead">{[c.heroLine1, c.heroLine2, c.heroLine3].map((t) => <span key={t}>{t}</span>)}</p>
          <div className="hz-side">
            <p className="hero-intro">{c.heroIntro}</p>
            <div className="hero-actions">
            <a className="button button--primary" href="#work" onPointerMove={trackMagneticPointer} onPointerLeave={resetMagneticPointer}>{c.primary}<Arrow diagonal /></a>
            <a className="text-link" href="#contact">{c.secondary}<Arrow /></a>
          </div>
          </div>
          {!rtl && <svg className="hz-badge" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="hzc" d="M60 60m-47 0a47 47 0 1 1 94 0a47 47 0 1 1-94 0" /></defs><text><textPath href="#hzc">{(c.brandTag + ' · ').repeat(2)}</textPath></text><circle cx="60" cy="60" r="5" /></svg>}
        </div>
      </section>

      <div className="hz-marquee" aria-hidden="true">
        <div className="hz-skew"><div className="hz-track">
          {[0, 1, 2, 3].map((k) => c.bridge.concat(c.bridge).map((t, n) => <span key={`${k}-${n}`}>{t}</span>))}
        </div></div>
      </div>

      <section className="hz-sec hz-man" id="signal">
        <div className="hz-wrap">
          <div className="hz-label" data-reveal><i>01</i>{c.smallLabel}</div>
          <p className="hz-manifesto" aria-label={c.bridge.join(', ')}>{c.bridge.map((ph) => <span className="ph" key={ph} aria-hidden="true">{ph.split(' ').map((w, i) => <span className="w" key={i}>{w}</span>)}</span>)}</p>
          <div className="hz-method" data-reveal>
            <div><div className="hz-label hz-label--sm">{c.signal}</div><p>{c.signalDesc}</p></div>
            <ol className="hz-route">{c.process.map((st, i) => <li key={st}><b>{String(i + 1).padStart(2, '0')}</b><span>{st}</span></li>)}</ol>
          </div>
        </div>
      </section>

      <section className="hz-sec hz-work" id="work">
        <div className="hz-wrap">
          <div className="hz-head" data-reveal><div><div className="hz-label"><i>02</i>{c.workEyebrow}</div><h2>{c.workTitle}</h2></div><p>{c.workIntro}</p></div>
          <div className="hz-stack">
            <HzProject n="01" kicker={c.eocKicker} title={c.eocTitle} summary={c.eocSummary} label={c.platformLabel} img="05-operations-overview.png" alt="Real screenshot of the EOC Smart Command Center operations overview" onImageOpen={openImage}
              tags={['React 19', 'Vite', 'Python', 'FastAPI', 'PostgreSQL', 'JWT', 'OpenAPI', 'Leaflet']}
              actions={<a className="button button--dark" href={links.systemRepo} target="_blank" rel="noreferrer">{c.openSource}<Arrow diagonal /></a>}>
              <ul className="hz-chips">{c.eocModules.map((m) => <li key={m}>{m}</li>)}</ul>
              <details className="hz-fold"><summary>{c.details}</summary><p>{c.eocSolution}</p><p>{c.eocContribution}</p></details>
            </HzProject>
            <HzProject n="02" kicker={c.analyticsKicker} title={c.analyticsTitle} summary={c.analyticsSummary} label={c.dataLabel} img="dashboard_blurred_final.png" alt="Screenshot of the Power BI operational analytics dashboard" onImageOpen={openImage}
              tags={['Power BI', 'Power Query', 'Excel', 'QGIS']}>
              <ol className="hz-list">
                <li><i>01</i><div><b>{c.analyticsMain}</b><span>{c.analyticsMainDesc}</span></div></li>
                <li><i>02</i><div><b>{c.village}</b><span>{c.villageDesc}</span></div></li>
                <li><i>03</i><div><b>{c.departments}</b><span>{c.departmentsDesc}</span></div></li>
              </ol>
              <details className="hz-fold"><summary>{c.analyticsApproach}</summary><p>{c.analyticsWorkflow}</p></details>
            </HzProject>
            <HzProject n="03" kicker={c.presentationKicker} title={c.presentationTitle} summary={c.presentationSummary} label={c.presentationLabel} img="pres.png" alt="Screenshot of the EOC interactive presentation" onImageOpen={openImage}
              tags={['React 19', 'TypeScript', 'Vite', 'Framer Motion', 'Recharts']}
              actions={<><button className="text-link presentation-scroll-trigger" type="button" onClick={openEmbeddedPresentation}>{c.openDemo}<Arrow /></button><a className="text-link" href={links.presentationRepo} target="_blank" rel="noreferrer">{c.openSource}<Arrow diagonal /></a></>}>
              <ol className="hz-list">
                <li><i>01</i><div><b>{c.presentationChallenge}</b><span>{c.presentationChallengeDesc}</span></div></li>
                <li><i>02</i><div><b>{c.presentationDesign}</b><span>{c.presentationDesignDesc}</span></div></li>
                <li><i>03</i><div><b>{c.presentationContribution}</b><span>{c.presentationContributionDesc}</span></div></li>
              </ol>
            </HzProject>
          </div>
          <p className="hz-note">{c.artLabel}</p>
        </div>
      </section>

      {showPresentationEmbed && <section className="embedded-presentation-section" id="live-presentation" ref={presentationEmbedRef}>
        <div className="section-wrap">
          <div className="embedded-presentation-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" />{c.embeddedPresentationEyebrow}</div>
              <h2>{c.embeddedPresentationTitle}</h2>
              <p>{c.embeddedPresentationDesc}</p>
            </div>
            <button className="presentation-hide-button" type="button" onClick={() => setShowPresentationEmbed(false)}>{c.hidePresentation}</button>
          </div>
          <div className="embedded-presentation-frame">
            <iframe
              src={links.presentationLive}
              title={c.presentationTitle}
              loading="lazy"
              allow="fullscreen; autoplay; clipboard-write"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <a className="text-link embedded-presentation-external" href={links.presentationLive} target="_blank" rel="noreferrer">{c.openPresentationInNewTab}<Arrow diagonal /></a>
        </div>
      </section>}

      <section className="hz-sec hz-cap" id="capabilities">
        <div className="hz-wrap">
          <div className="hz-head" data-reveal><div><div className="hz-label"><i>03</i>{c.capabilitiesKicker}</div><h2>{c.capabilitiesTitle}</h2></div><p>{c.capabilitiesIntro}</p></div>
          <div className="hz-bento">
            <article className="hz-spot hz-b" data-reveal><div className="hz-viz hz-viz--data"><i /><i /><i /><i /><i /><i /><i /></div><span className="n">01</span><h3>{c.skillData}</h3><p>{c.skillDataDesc}</p><ul>{c.skillDataList.map((x) => <li key={x}>{x}</li>)}</ul></article>
            <article className="hz-spot hz-b" data-reveal><div className="hz-viz hz-viz--code"><i /><i /><i /><i /><b /></div><span className="n">02</span><h3>{c.skillBuild}</h3><p>{c.skillBuildDesc}</p><ul>{c.skillBuildList.map((x) => <li key={x}>{x}</li>)}</ul></article>
            <article className="hz-spot hz-b" data-reveal><div className="hz-viz hz-viz--pulse"><i /><i /><i /><b /></div><span className="n">03</span><h3>{c.skillHuman}</h3><p>{c.skillHumanDesc}</p><ul>{c.skillHumanList.map((x) => <li key={x}>{x}</li>)}</ul></article>
            <article className="hz-spot hz-b" data-reveal><div className="hz-viz hz-viz--slides"><i /><i /><i /></div><span className="n">04</span><h3>{c.skillComms}</h3><p>{c.skillCommsDesc}</p><ul>{c.skillCommsList.map((x) => <li key={x}>{x}</li>)}</ul></article>
          </div>
        </div>
      </section>

      <section className="hz-sec hz-exp" id="experience">
        <div className="hz-wrap">
          <div className="hz-head" data-reveal><div><div className="hz-label"><i>04</i>{c.experienceKicker}</div><h2>{c.experienceTitle}</h2></div><p>{c.experienceIntro}</p></div>
          <div className="hz-ledger">
            <span className="hz-tl-line" aria-hidden="true" />
            {[['01', c.exp1Title, c.exp1Org, c.exp1Date, c.exp1Desc], ['02', c.exp2Title, c.exp2Org, c.exp2Date, c.exp2Desc], ['03', c.exp3Title, c.exp3Org, c.exp3Date, c.exp3Desc], ['04', c.exp4Title, c.exp4Org, c.exp4Date, c.exp4Desc]].map((it) => <article className="hz-job" key={it[0]}><span className="hz-dot" aria-hidden="true" /><time>{it[3]}</time><div className="hz-job-t"><h3>{it[1]}</h3><p>{it[2]}</p></div><p className="hz-job-b">{it[4]}</p></article>)}
          </div>
        </div>
      </section>

      <section className="hz-sec hz-edu">
        <div className="hz-wrap hz-edu-grid">
          <div data-reveal>
            <div className="hz-label"><i>05</i>{c.educationKicker}</div>
            <h2>{c.educationTitle}</h2>
            <div className="hz-edu-item"><span>01</span><div><h3>{c.education}</h3><p>{c.educationOrg}</p><small>{c.educationStatus}</small></div></div>
            <div className="hz-edu-item"><span>02</span><div><h3>{c.course}</h3><p>{c.courseOrg}</p><small>{c.courseDetails}</small></div></div>
          </div>
          <div className="hz-panel" data-reveal>
            <div className="hz-label hz-label--sm">{c.trainingLabel}</div>
            <ul>{c.trainings.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="hz-label hz-label--sm">{c.languagesLabel}</div>
            <p>{c.languageDetails}</p>
          </div>
        </div>
      </section>

      <section className="hz-sec hz-contact" id="contact">
        <div className="hz-big" aria-hidden="true">{rtl ? '' : 'LET’S TALK'}</div>
        <div className="hz-wrap" data-reveal>
          <div className="hz-label"><i>06</i>{c.contactKicker}</div>
          <h2>{c.contactTitle}</h2>
          <p>{c.contactDesc}</p>
          <div className="hz-contact-actions">
            <a className="button button--light" href={links.email}>{c.emailBtn}<Arrow diagonal /></a>
            <a className="button button--whatsapp" href={links.whatsapp} target="_blank" rel="noreferrer" aria-label={rtl ? "فتح محادثة واتساب" : "Open WhatsApp chat"}>
              <svg className="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.2 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20l.9-4.6a8.4 8.4 0 1 1 16.3-3.7Z" />
                <path d="M8.1 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .6.6 1 1.4 1.8 2.4 2.4.3.2.5.2.7 0l.7-.8c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.8 1.7-.5.5-1.2.8-2.1.6-1.2-.3-2.6-.9-4-2.2-1.2-1.1-2-2.5-2.2-3.8-.2-.9.2-1.6.7-2.1Z" />
              </svg>
              <span>{c.whatsappBtn}</span>
            </a>
            <a className="text-link" href={links.linkedin} target="_blank" rel="noreferrer">{c.linkedinBtn}<Arrow diagonal /></a>
          </div>
          <div className="hz-contact-details"><a href={links.email}>mo7amed.rabei14@gmail.com</a><span>·</span><a href="tel:+201090509181">+20 109 050 9181</a><span>·</span><span>{rtl ? "مصر" : "Egypt"}</span></div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="section-wrap footer-inner"><a className="brand brand--footer" href="#top"><Mark /><span className="brand-copy"><strong>MOHAMED RABEA</strong><small>{c.brandTag}</small></span></a><p>{c.footerNote}</p><a href="#top" className="footer-top">{c.backTop}<Arrow diagonal /></a><span className="footer-year">© {new Date().getFullYear()}</span></div>
    </footer>
    {lightboxImage && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={rtl ? 'عرض الصورة بالحجم الكامل' : 'Full-screen image viewer'} onClick={closeImage}>
      <button className="image-lightbox-close" type="button" onClick={closeImage} aria-label={rtl ? 'إغلاق الصورة' : 'Close image'}>×</button>
      <img className="image-lightbox-full" src={lightboxImage.src} alt={lightboxImage.alt} onClick={(event) => event.stopPropagation()} />
      <span className="image-lightbox-hint">{rtl ? 'اضغط خارج الصورة أو Esc للإغلاق' : 'Click outside the image or press Esc to close'}</span>
    </div>}
  </div>;
}

export default App;
