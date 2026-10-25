// Published Power BI reports (public links supplied by Mohamed). Each one is shown as a full project (04, 05, 06),
// in the same layout as the first three. NOTHING here is invented: every field below is optional, and the page only
// renders what is filled in. `title` is a WORKING title taken from the image file name — replace it.
//
//   kicker   short label above the title            summary   2–3 sentence description
//   facts    [[label, text], ...]  e.g. [['The question', '...'], ['The data', '...'], ['My role', '...']]
//   chips    ['...']  short bullets (pages / modules)  tags   ['Power BI', 'Power Query', 'DAX', ...]
//   ar       the same fields in Arabic, e.g. ar: { title, kicker, summary, facts, chips, tags }
//   img      file name inside /public/images WITHOUT extension (.webp, .png, .jpg are tried in that order)
export const powerBiReports = [
  {
    id: 'pbi-1',
    title: 'Psy supp',
    img: 'Psy supp',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiMTY5NTAxOGMtMThlZC00MzJjLWFkYjctMWFjZjA1N2MyMGMyIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
  },
  {
    id: 'pbi-2',
    title: 'Rise in water',
    img: 'rise in water',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiNWE0NTUwNmYtZWQ3MC00OTFhLTg3OTctZWM4MzVlY2UwNmVkIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
  },
  {
    id: 'pbi-3',
    title: 'Sanbsa',
    img: 'sanbsa',
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYmUyZDVhMGUtOWVlZS00ZmEyLTg1YWMtOThkNmU0M2E4ZTNhIiwidCI6IjAyNjU5ODhhLWU0MDQtNGRkYy1hMmEwLTY2MjUwNWMzYjc4ZiIsImMiOjh9',
  },
];
