export type Rating = 'IN' | 'NI' | 'NP' | 'D' | null;

export interface Subsection {
  id: string;
  title: string;
  rating: Rating;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  tags: string[];
}

export interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

// Mock comment library — what AI will "match" against
export const COMMENT_LIBRARY: Comment[] = [
  { id: 'c1', text: 'The furnace filter is dirty and should be replaced. Recommend replacing every 1–3 months.', tags: ['heating', 'equipment', 'filter'] },
  { id: 'c2', text: 'Heat exchanger shows signs of rust and corrosion. Recommend evaluation by a licensed HVAC contractor.', tags: ['heating', 'equipment', 'heat exchanger'] },
  { id: 'c3', text: 'Thermostat is functional and responsive.', tags: ['heating', 'controls', 'thermostat'] },
  { id: 'c4', text: 'Ductwork has disconnected section in crawlspace. Recommend repair to restore proper air distribution.', tags: ['heating', 'distribution', 'ductwork'] },
  { id: 'c5', text: 'Carbon monoxide detector is absent or non-functional. Recommend installing per manufacturer guidelines.', tags: ['heating', 'safety', 'co detector'] },
  { id: 'c6', text: 'Flashing around chimney is deteriorated. Recommend repair by a qualified contractor to prevent water intrusion.', tags: ['exterior', 'chimney', 'flashing'] },
  { id: 'c7', text: 'Gutters are clogged with debris. Recommend cleaning to ensure proper drainage.', tags: ['exterior', 'gutters', 'drainage'] },
  { id: 'c8', text: 'Foundation has minor shrinkage cracks typical of settling. No signs of active movement observed.', tags: ['basement', 'foundation', 'cracks'] },
  { id: 'c9', text: 'Water staining observed on basement walls, indicating past moisture intrusion. Recommend monitoring and improving grading/drainage.', tags: ['basement', 'moisture', 'water'] },
  { id: 'c10', text: 'GFCI protection absent in bathroom. Recommend installation per current electrical standards.', tags: ['electrical', 'gfci', 'bathroom'] },
];

// AI matching simulation — picks the best comment from library based on voice input keywords
export function mockAiMatch(voiceText: string): Comment {
  const lower = voiceText.toLowerCase();
  const scored = COMMENT_LIBRARY.map(c => {
    let score = 0;
    c.tags.forEach(tag => { if (lower.includes(tag)) score += 2; });
    c.text.toLowerCase().split(' ').forEach(word => {
      if (word.length > 4 && lower.includes(word)) score += 1;
    });
    return { comment: c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].comment;
}

export const REPORT_SECTIONS: Section[] = [
  {
    id: 's1',
    title: 'Inspection Details',
    subsections: [
      { id: 'ss1', title: 'Property Information', rating: null, comments: [] },
      { id: 'ss2', title: 'Inspection Conditions', rating: null, comments: [] },
      { id: 'ss3', title: 'Attendees', rating: null, comments: [] },
    ],
  },
  {
    id: 's2',
    title: 'Exterior',
    subsections: [
      { id: 'ss4', title: 'Siding & Trim', rating: 'NI', comments: [] },
      { id: 'ss5', title: 'Gutters & Downspouts', rating: 'NI', comments: [] },
      { id: 'ss6', title: 'Driveway & Walkways', rating: 'IN', comments: [] },
      { id: 'ss7', title: 'Chimney', rating: 'NI', comments: [] },
    ],
  },
  {
    id: 's3',
    title: 'Basement, Foundation, Crawlspace',
    subsections: [
      { id: 'ss8', title: 'Foundation', rating: 'IN', comments: [] },
      { id: 'ss9', title: 'Basement Floor & Walls', rating: 'NI', comments: [] },
      { id: 'ss10', title: 'Crawlspace', rating: 'NP', comments: [] },
    ],
  },
  {
    id: 's4',
    title: 'Heating',
    subsections: [
      { id: 'ss11', title: 'General', rating: 'IN', comments: [] },
      { id: 'ss12', title: 'Equipment', rating: 'NI', comments: [] },
      { id: 'ss13', title: 'Normal Operating Controls', rating: 'NI', comments: [] },
      { id: 'ss14', title: 'Distribution Systems', rating: 'NI', comments: [] },
      { id: 'ss15', title: 'Presence of Installed Heat Source in Each Room', rating: 'NI', comments: [] },
    ],
  },
  {
    id: 's5',
    title: 'Cooling',
    subsections: [
      { id: 'ss16', title: 'Equipment', rating: 'IN', comments: [] },
      { id: 'ss17', title: 'Distribution Systems', rating: 'IN', comments: [] },
    ],
  },
  {
    id: 's6',
    title: 'Plumbing',
    subsections: [
      { id: 'ss18', title: 'Water Supply & Distribution', rating: 'IN', comments: [] },
      { id: 'ss19', title: 'Drain, Waste & Vent', rating: 'IN', comments: [] },
      { id: 'ss20', title: 'Water Heating Equipment', rating: 'NI', comments: [] },
    ],
  },
];
