export type Rating = 'IN' | 'NI' | 'NP' | 'D' | null;

export interface ItemOption {
  id: string;
  label: string;
}

export interface Subsection {
  id: string;
  title: string;
  rating: Rating;
  comments: Comment[];
  options?: ItemOption[];
}

export interface Comment {
  id: string;
  title?: string;
  text: string;
  tags: string[];
}

export interface Section {
  id: string;
  title: string;
  icon: string; // FontAwesome7Pro icon name
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
    icon: 'clipboard',
    subsections: [
      {
        id: 'ss1', title: 'Property Information', rating: null, comments: [],
        options: [
          { id: 'ss1-o1', label: 'Single Family' },
          { id: 'ss1-o2', label: 'Multi Family' },
          { id: 'ss1-o3', label: 'Condo / Townhome' },
          { id: 'ss1-o4', label: 'Manufactured / Mobile' },
          { id: 'ss1-o5', label: 'Commercial' },
        ],
      },
      {
        id: 'ss2', title: 'Inspection Conditions', rating: null, comments: [],
        options: [
          { id: 'ss2-o1', label: 'Dry' },
          { id: 'ss2-o2', label: 'Rain / Wet' },
          { id: 'ss2-o3', label: 'Snow / Ice' },
          { id: 'ss2-o4', label: 'Freezing' },
          { id: 'ss2-o5', label: 'High Wind' },
        ],
      },
      { id: 'ss3', title: 'Attendees', rating: null, comments: [] },
    ],
  },
  {
    id: 's2',
    title: 'Exterior',
    icon: 'house',
    subsections: [
      {
        id: 'ss4', title: 'Siding & Trim', rating: 'NI', comments: [],
        options: [
          { id: 'ss4-o1', label: 'Vinyl' },
          { id: 'ss4-o2', label: 'Wood' },
          { id: 'ss4-o3', label: 'Fiber Cement' },
          { id: 'ss4-o4', label: 'Brick / Masonry' },
          { id: 'ss4-o5', label: 'Stucco' },
          { id: 'ss4-o6', label: 'Aluminum' },
        ],
      },
      {
        id: 'ss5', title: 'Gutters & Downspouts', rating: 'NI', comments: [
          { id: 'ss5-c1', title: 'Gutters Clogged with Debris', text: 'Gutters are clogged with debris throughout. Recommend cleaning to ensure proper drainage and prevent water damage.', tags: ['exterior', 'gutters', 'drainage'] },
          { id: 'ss5-c2', title: 'Downspout Disconnected', text: 'One downspout is disconnected at the elbow. Recommend reconnecting to direct water away from the foundation.', tags: ['exterior', 'downspout'] },
        ],
        options: [
          { id: 'ss5-o1', label: 'Aluminum' },
          { id: 'ss5-o2', label: 'Vinyl' },
          { id: 'ss5-o3', label: 'Copper' },
          { id: 'ss5-o4', label: 'Steel' },
          { id: 'ss5-o5', label: 'Seamless' },
          { id: 'ss5-o6', label: 'None Installed' },
        ],
      },
      {
        id: 'ss6', title: 'Driveway & Walkways', rating: 'IN', comments: [
          { id: 'ss6-c1', title: 'Driveway Cracking — Major', text: 'Major cracks observed across driveway surface. Recommend concrete contractor evaluate and replace affected areas.', tags: ['exterior', 'driveway'] },
          { id: 'ss6-c2', title: 'Driveway Cracking — Minor', text: 'Minor cosmetic cracks which may indicate movement in the soil. Recommend monitor and/or have evaluated by a qualified contractor.', tags: ['exterior', 'driveway'] },
          { id: 'ss6-c3', title: 'Drainage Towards Home', text: 'Driveway slopes toward the foundation. Recommend regrading to direct water away from the structure.', tags: ['exterior', 'drainage'] },
        ],
        options: [
          { id: 'ss6-o1', label: 'Concrete' },
          { id: 'ss6-o2', label: 'Asphalt' },
          { id: 'ss6-o3', label: 'Paver' },
          { id: 'ss6-o4', label: 'Gravel' },
          { id: 'ss6-o5', label: 'Brick' },
        ],
      },
      {
        id: 'ss7', title: 'Chimney', rating: 'NI', comments: [],
        options: [
          { id: 'ss7-o1', label: 'Masonry' },
          { id: 'ss7-o2', label: 'Metal / Pre-fabricated' },
          { id: 'ss7-o3', label: 'Active / In Use' },
          { id: 'ss7-o4', label: 'Capped / Not in Use' },
          { id: 'ss7-o5', label: 'Gas Insert' },
        ],
      },
    ],
  },
  {
    id: 's3',
    title: 'Basement, Foundation, Crawlspace',
    icon: 'layer-group',
    subsections: [
      {
        id: 'ss8', title: 'Foundation', rating: 'IN', comments: [],
        options: [
          { id: 'ss8-o1', label: 'Poured Concrete' },
          { id: 'ss8-o2', label: 'Concrete Block' },
          { id: 'ss8-o3', label: 'Stone / Rubble' },
          { id: 'ss8-o4', label: 'Brick' },
          { id: 'ss8-o5', label: 'Slab on Grade' },
        ],
      },
      {
        id: 'ss9', title: 'Basement Floor & Walls', rating: 'NI', comments: [],
        options: [
          { id: 'ss9-o1', label: 'Concrete' },
          { id: 'ss9-o2', label: 'Tile' },
          { id: 'ss9-o3', label: 'Carpet' },
          { id: 'ss9-o4', label: 'Wood / Laminate' },
          { id: 'ss9-o5', label: 'Unfinished' },
        ],
      },
      { id: 'ss10', title: 'Crawlspace', rating: 'NP', comments: [] },
    ],
  },
  {
    id: 's4',
    title: 'Heating',
    icon: 'fire',
    subsections: [
      {
        id: 'ss11', title: 'General', rating: 'IN', comments: [],
        options: [
          { id: 'ss11-o1', label: 'Forced Air' },
          { id: 'ss11-o2', label: 'Radiant / Hydronic' },
          { id: 'ss11-o3', label: 'Baseboard Electric' },
          { id: 'ss11-o4', label: 'Heat Pump' },
          { id: 'ss11-o5', label: 'Boiler' },
          { id: 'ss11-o6', label: 'Mini-split' },
        ],
      },
      {
        id: 'ss12', title: 'Equipment', rating: 'NI', comments: [],
        options: [
          { id: 'ss12-o1', label: 'Gas Furnace' },
          { id: 'ss12-o2', label: 'Electric Furnace' },
          { id: 'ss12-o3', label: 'Oil Furnace' },
          { id: 'ss12-o4', label: 'Heat Pump' },
          { id: 'ss12-o5', label: 'Boiler' },
          { id: 'ss12-o6', label: 'Wall / Space Heater' },
        ],
      },
      {
        id: 'ss13', title: 'Normal Operating Controls', rating: 'NI', comments: [],
        options: [
          { id: 'ss13-o1', label: 'Thermostat — Manual' },
          { id: 'ss13-o2', label: 'Thermostat — Programmable' },
          { id: 'ss13-o3', label: 'Thermostat — Smart' },
          { id: 'ss13-o4', label: 'Zone Control' },
        ],
      },
      {
        id: 'ss14', title: 'Distribution Systems', rating: 'NI', comments: [],
        options: [
          { id: 'ss14-o1', label: 'Ductwork' },
          { id: 'ss14-o2', label: 'Radiators' },
          { id: 'ss14-o3', label: 'Baseboard' },
          { id: 'ss14-o4', label: 'In-floor Radiant' },
          { id: 'ss14-o5', label: 'Mini-split Heads' },
        ],
      },
      { id: 'ss15', title: 'Presence of Installed Heat Source in Each Room', rating: 'NI', comments: [] },
    ],
  },
  {
    id: 's5',
    title: 'Cooling',
    icon: 'snowflake',
    subsections: [
      {
        id: 'ss16', title: 'Equipment', rating: 'IN', comments: [],
        options: [
          { id: 'ss16-o1', label: 'Central A/C' },
          { id: 'ss16-o2', label: 'Heat Pump' },
          { id: 'ss16-o3', label: 'Mini-split' },
          { id: 'ss16-o4', label: 'Evaporative Cooler' },
          { id: 'ss16-o5', label: 'Window Units' },
          { id: 'ss16-o6', label: 'None' },
        ],
      },
      {
        id: 'ss17', title: 'Distribution Systems', rating: 'IN', comments: [],
        options: [
          { id: 'ss17-o1', label: 'Shared with Heating Ducts' },
          { id: 'ss17-o2', label: 'Dedicated Ductwork' },
          { id: 'ss17-o3', label: 'Ductless (Mini-split)' },
        ],
      },
    ],
  },
  {
    id: 's6',
    title: 'Plumbing',
    icon: 'droplet',
    subsections: [
      {
        id: 'ss18', title: 'Water Supply & Distribution', rating: 'IN', comments: [],
        options: [
          { id: 'ss18-o1', label: 'Copper' },
          { id: 'ss18-o2', label: 'PEX' },
          { id: 'ss18-o3', label: 'CPVC' },
          { id: 'ss18-o4', label: 'Galvanized Steel' },
          { id: 'ss18-o5', label: 'Lead' },
          { id: 'ss18-o6', label: 'Polybutylene' },
        ],
      },
      {
        id: 'ss19', title: 'Drain, Waste & Vent', rating: 'IN', comments: [],
        options: [
          { id: 'ss19-o1', label: 'ABS' },
          { id: 'ss19-o2', label: 'PVC' },
          { id: 'ss19-o3', label: 'Cast Iron' },
          { id: 'ss19-o4', label: 'Galvanized Steel' },
          { id: 'ss19-o5', label: 'Orangeburg' },
        ],
      },
      {
        id: 'ss20', title: 'Water Heating Equipment', rating: 'NI', comments: [],
        options: [
          { id: 'ss20-o1', label: 'Gas Tank' },
          { id: 'ss20-o2', label: 'Electric Tank' },
          { id: 'ss20-o3', label: 'Tankless — Gas' },
          { id: 'ss20-o4', label: 'Tankless — Electric' },
          { id: 'ss20-o5', label: 'Heat Pump Water Heater' },
          { id: 'ss20-o6', label: 'Solar' },
        ],
      },
    ],
  },
];
