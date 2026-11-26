// Work page strips, top to bottom. `focus` sets which part of the image stays
// in frame when it's cropped to a thin strip (CSS object-position).
export interface WorkStrip {
  slug: string;
  title: string;
  alt: string;
  focus: string;
}

export const work: WorkStrip[] = [
  { slug: '01-narrative', title: 'Narrative', alt: 'Silhouette of a man in a hat holding a pistol against a bright window', focus: '50% 38%' },
  { slug: '02-aerial', title: 'Aerial', alt: 'Hazy golden sunset over a desert city valley and mountain range', focus: '50% 52%' },
  { slug: '03-motorsports', title: 'Motorsport', alt: 'Black sports car drifting with tyre smoke pouring from the rear wheel', focus: '62% 58%' },
  { slug: '04-portrait', title: 'Portrait', alt: 'Man in a mustard T-shirt standing in tall grass before rusted industrial towers', focus: '52% 26%' },
  { slug: '05-wildlife', title: 'Nature', alt: 'Condor soaring past blurred canyon walls', focus: '50% 46%' },
];

export const workImage = (slug: string) => ({
  src: `/images/work/${slug}.jpg`,
  srcset: `/images/work/${slug}-1000.webp 1000w, /images/work/${slug}.webp 2000w`,
});
