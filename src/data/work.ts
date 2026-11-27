// Work page strips, top to bottom. `focus` sets which part of the image stays
// in frame when it's cropped to a thin strip (CSS object-position).
export interface WorkStrip {
  slug: string;
  title: string;
  alt: string;
  focus: string;
  /** Optional: widen the image by this % of the strip width to centre a subject: positive slides it left, negative slides it right. */
  pan?: number;
  /** Gallery page this strip opens, once it exists. */
  href?: string;
}

export const work: WorkStrip[] = [
  { slug: '00-originals', title: 'Originals', alt: 'Seventh Gear: a woman in a leather jacket beside her motorcycle, layered with her helmeted profile', focus: '50% 20%' },
  { slug: '01-narrative', title: 'Narrative', href: '/work/narrative', alt: 'Bearded man in a hat and tactical vest standing in a dim hallway, pistol at his side', focus: '50% 19%' },
  { slug: '02-aerial', title: 'Aerial', href: '/work/aerial', alt: 'Hazy golden sunset over a desert city valley and mountain range', focus: '50% 46%' },
  { slug: '03-motorsports', title: 'Motorsport', href: '/work/motorsport', alt: 'Black sports car drifting with tyre smoke pouring from the rear wheel', focus: '62% 58%' },
  { slug: '04-portrait', title: 'Portrait', href: '/work/portrait', alt: 'Woman in a canvas jacket at dusk before an abandoned desert house', focus: '50% 31%', pan: -3 },
  { slug: '05-wildlife', title: 'Nature', href: '/work/nature', alt: 'Condor soaring past blurred canyon walls', focus: '50% 39%', pan: 7 },
];

export const workImage = (slug: string) => ({
  src: `/images/work/${slug}.jpg`,
  srcset: `/images/work/${slug}-1000.webp 1000w, /images/work/${slug}.webp 2000w`,
});
