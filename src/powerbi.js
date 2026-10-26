// The three published Power BI reports, shown as projects 04, 05 and 06 in the same layout as the first three.
// Everything below was read from the reports themselves (labels, indicators and figures visible in them) — nothing is invented.
// `img` is a file name inside /public/images without extension (.webp is tried first, then .png/.jpg).
export const powerBiReports = [
  {
    id: 'pbi-1',
    title: 'Psychological Support Services',
    img: 'psy-support',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiMTY5NTAxOGMtMThlZC00MzJjLWFkYjctMWFjZjA1N2MyMGMyIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
    kicker: 'Power BI · Emergency Operations Center',
    summary: 'An operational dashboard for the psychological support service: how many reports came in, through which channel, what each case led to, and where in Egypt the demand is.',
    facts: [
      ['What it answers', '766 reports from 27 governorates: 527 psychological-support follow-ups and 285 case-management follow-ups, at about 64 calls a day and 6 calls an hour over 228 operational hours.'],
      ['Where reports come from', 'Mainly the hotline (388) and the operations room (288), plus social media (85).'],
      ['What cases lead to', 'The largest group (204) was assessed as needing specialised psychological support, and 139 were referred to the General Secretariat. In case management, specialised psychological services lead (121), followed by calls with no answer (70) and financial support (65), then legal support, housing and medical examination.'],
      ['Where demand is', 'A map and a governorate chart show the spread: Cairo (184), Giza (105) and Alexandria (81) are highest. Reports are also split by gender.'],
    ],
    chips: ['KPI cards', 'Support outcomes', 'Case-management outcomes', 'Receiving channel', 'Governorate map', 'Gender split'],
    tags: ['Power BI', 'Interactive map', 'KPI cards', 'Arabic / English'],
    ar: {
      title: 'خدمات الدعم النفسي',
      kicker: 'Power BI · مركز عمليات الطوارئ',
      summary: 'لوحة تشغيلية لخدمة الدعم النفسي: كم بلاغًا وصل، وعبر أي جهة، وإلى ماذا انتهت كل حالة، وأين في مصر يتركز الطلب.',
      facts: [
        ['ما الذي تجيب عنه', '766 بلاغًا من 27 محافظة: 527 متابعة دعم نفسي و285 متابعة إدارة حالة، بمعدل نحو 64 مكالمة يوميًا و6 مكالمات في الساعة على مدى 228 ساعة عمل تشغيلية.'],
        ['من أين تأتي البلاغات', 'أساسًا عبر الخط الساخن (388) وغرفة العمليات (288)، إضافةً إلى وسائل التواصل الاجتماعي (85).'],
        ['إلى ماذا تنتهي الحالات', 'أكبر مجموعة (204) تم تقييمها وتحتاج إلى دعم نفسي متخصص، و139 حالة حُوّلت إلى الأمانة العامة. وفي إدارة الحالة تتصدر الخدمة النفسية المتخصصة (121) ثم المكالمات التي لم يُرد عليها (70) والدعم المالي (65)، تليها حالات الدعم القانوني وتوفير السكن والكشف الطبي.'],
        ['أين يتركز الطلب', 'خريطة ورسم للمحافظات يوضحان الانتشار: القاهرة (184) والجيزة (105) والإسكندرية (81) في المقدمة، مع توزيع البلاغات حسب الجنس.'],
      ],
      chips: ['مؤشرات رئيسية', 'نتائج الدعم النفسي', 'نتائج إدارة الحالة', 'الجهة المستقبلة', 'خريطة المحافظات', 'التوزيع حسب الجنس'],
    },
  },
  {
    id: 'pbi-2',
    title: 'Rise in River Water Level',
    img: 'river-rise',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiNWE0NTUwNmYtZWQ3MC00OTFhLTg3OTctZWM4MzVlY2UwNmVkIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
    kicker: 'Power BI · Emergency Operations Center',
    summary: 'An overview of the effects of a rise in river water level on communities in Menoufia, Beheira and Qalyubia, built from field assessments and information from the Ministry of Water Resources and Irrigation: affected areas, damaged homes and affected people, on a map and in a detail table.',
    facts: [
      ['What it shows', '15 affected areas, 194 damaged homes (12 of them completely) and 2,269 affected people.'],
      ['Where the impact is', 'Menoufia has 10 affected areas, Beheira 4 and Qalyubia 1. Dalhamo is the most affected area, with 99 damaged homes and 719 affected people, followed by Gezirat Dawoud (27 homes, 600 people).'],
      ['Where each record comes from', 'Every row of the detail table states its source: a field assessment, or an official of the Ministry of Water Resources and Irrigation, together with the area and governorate.'],
    ],
    chips: ['KPI cards', 'Areas by governorate', 'Damaged homes by area', 'People affected by area', 'Map', 'Detail table'],
    tags: ['Power BI', 'Interactive map', 'KPI cards', 'Arabic / English'],
    ar: {
      title: 'ارتفاع منسوب مياه النهر',
      kicker: 'Power BI · مركز عمليات الطوارئ',
      summary: 'نظرة عامة على أثر ارتفاع منسوب مياه النهر في المنوفية والبحيرة والقليوبية، مبنية على تقييم ميداني ومعلومات من وزارة الموارد المائية والري: المناطق المتأثرة والمنازل المتضررة وعدد المتضررين، على الخريطة وفي جدول تفصيلي.',
      facts: [
        ['ما الذي تعرضه', '15 منطقة متأثرة و194 منزلًا متضررًا (منها 12 متضررة كليًا) و2,269 متضررًا.'],
        ['أين الأثر الأكبر', 'المنوفية بها 10 مناطق متأثرة، والبحيرة 4، والقليوبية 1. وتتصدر دلهمو بـ99 منزلًا متضررًا و719 متضررًا، تليها جزيرة داوود (27 منزلًا و600 متضرر).'],
        ['مصدر كل سجل', 'كل صف في الجدول التفصيلي يوضح مصدره: تقييم ميداني، أو مسؤول في وزارة الموارد المائية والري، مع المنطقة والمحافظة.'],
      ],
      chips: ['مؤشرات رئيسية', 'المناطق المتأثرة حسب المحافظة', 'المنازل المتضررة حسب المنطقة', 'المتضررون حسب المنطقة', 'خريطة', 'جدول تفصيلي'],
    },
  },
  {
    id: 'pbi-3',
    title: 'Kafr El-Sanabsa Overview',
    img: 'kafr-el-sanabsa',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYmUyZDVhMGUtOWVlZS00ZmEyLTg1YWMtOThkNmU0M2E4ZTNhIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
    kicker: 'Power BI · Emergency Operations Center',
    summary: 'An overview of a community assessment for the village of Kafr El-Sanabsa: who was reached, which challenges, needs and protective factors were recorded across six sectors, how urgent they are, and the specific interventions requested.',
    facts: [
      ['Who was reached', '27 direct and about 1K indirect households, including 22 households of victims and injured people, with 12 community leaders and 5 female community pioneers.'],
      ['What was recorded', '55 challenges, 49 needs and 8 protective factors, classified by sector: education, healthcare, infrastructure and environment, social life, economy and community empowerment, and safety and disasters.'],
      ['What is most pressing', 'Education ranks first among the village needs (23), followed by healthcare (20). Every entry carries a textual rating (for example very weak, urgent, very urgent) so priorities stand out, and each sector compares challenges against needs.'],
      ['The interventions requested', 'A table lists each item with its type, classification, section and the required intervention, for example a youth centre with a turf pitch and multi-purpose hall on a 4,000 m² plot, or an integrated disaster-management and rapid-response system.'],
    ],
    chips: ['KPI cards', 'Textual rating', 'Entry type', 'Classification share', 'Village map', 'Challenges vs needs', 'Interventions table'],
    tags: ['Power BI', 'Interactive map', 'KPI cards', 'Arabic / English'],
    ar: {
      title: 'نظرة عامة على كفر السنابسة',
      kicker: 'Power BI · مركز عمليات الطوارئ',
      summary: 'نظرة عامة على تقييم مجتمعي لقرية كفر السنابسة: من تمّ الوصول إليه، وما سُجّل من تحديات واحتياجات وعوامل حماية في ستة قطاعات، ومدى إلحاحها، والتدخلات المطلوبة تحديدًا.',
      facts: [
        ['من تمّ الوصول إليه', '27 أسرة مباشرة ونحو ألف أسرة غير مباشرة، منها 22 أسرة من أسر الضحايا والمصابين، إلى جانب 12 قائدًا مجتمعيًا و5 رائدات مجتمعيات.'],
        ['ما الذي سُجّل', '55 تحديًا و49 احتياجًا و8 عوامل حماية، مصنّفة حسب القطاع: التعليم، الرعاية الصحية، البنية التحتية والبيئية، الحياة الاجتماعية، الاقتصاد والتمكين المجتمعي، والأمن والسلامة والكوارث.'],
        ['ما الأكثر إلحاحًا', 'يأتي التعليم في صدارة احتياجات القرية (23) يليه الرعاية الصحية (20). وكل بند يحمل تقييمًا نصيًا (مثل ضعيف جدًا وعاجل وعاجل جدًا) لإبراز الأولويات، مع مقارنة بين التحديات والاحتياجات في كل قطاع.'],
        ['التدخلات المطلوبة', 'جدول يسرد كل بند بنوعه وتصنيفه وقسمه والتدخل المطلوب، مثل إنشاء مركز شباب فعال على أرض 4000م² بملعب نجيل وصالة متعددة الاستخدام، أو منظومة متكاملة لإدارة الكوارث والاستجابة السريعة.'],
      ],
      chips: ['مؤشرات رئيسية', 'التقييم النصي', 'نوع البيان', 'التصنيف بالنسب', 'خريطة القرية', 'مقارنة التحديات بالاحتياجات', 'جدول التدخلات'],
    },
  },
];
