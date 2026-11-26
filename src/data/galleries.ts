// Gallery pages (/work/<slug>). Each has one full-screen hero and a moving
// film strip of frames. Images live in public/images/<slug>/:
//   hero.jpg / hero.webp / hero-1280.webp   — the hero
//   01-960.webp (strip) and 01.webp (full view), 02-…, in strip order
export interface Frame {
  alt: string;
  /** Which part of the image stays in a frame when it's cropped (CSS object-position). */
  focus?: string;
}

export interface Gallery {
  slug: string;
  title: string;
  /** Which side the film strip and ruler sit on (the hero subject goes on the other side). */
  side: 'left' | 'right';
  hero: {
    /** Pixel width of hero.webp (for responsive loading). */
    width: number;
    alt: string;
    /** Where the subject sits across the photo (0–100). Used to place them opposite the strip. */
    subjectX: number;
    /** Optional phone-only horizontal crop point (0–100), if the subject needs nudging on small screens. */
    mobileX?: number;
    /** Vertical crop point for the hero (CSS percentage). */
    focusY?: string;
  };
  frames: Frame[];
}

export const galleries: Gallery[] = [
  {
    slug: 'narrative',
    title: 'Narrative',
    side: 'right',
    hero: {
      width: 2560,
      alt: 'Figure in a cybernetic helmet with a glowing orange ring, standing before a hazy golden sea',
      subjectX: 47,
      focusY: '40%',
    },
    frames: [
      { alt: 'Silhouette in a hat raising a pistol in a teal-lit doorway' },
      { alt: 'Man with a rifle in a weathered doorway as the sun sets behind him' },
      { alt: 'Bearded man in a hat beside a weathered wall at sunset' },
      { alt: 'Figure in a hat emerging from darkness' },
      { alt: 'Woman aiming a pistol beside a cabin window' },
      { alt: 'Woman with a pistol beside a cabin window, desert outside' },
      { alt: 'Woman walking past an abandoned house at dusk' },
      { alt: 'Woman glancing back in front of an abandoned house' },
      { alt: 'Close portrait of a woman before an abandoned house' },
      { alt: 'Woman standing by an abandoned house holding a weapon' },
      { alt: 'Man in a white T-shirt in a sunlit forest ravine' },
      { alt: 'Man climbing through a cave lit by a single beam of light' },
      { alt: 'Man reaching up into a shaft of light' },
      { alt: 'Lone figure standing in a beam of cave light' },
      { alt: 'Long-haired man in a hat and long coat crossing the desert' },
      { alt: 'Close portrait of a man with the desert behind him' },
      { alt: 'Two men squaring off in the desert at dusk' },
      { alt: 'Fight scene: a flying kick in the desert at sunset' },
      { alt: 'Long-haired man in a hat and coat at dusk', focus: '50% 22%' },
      { alt: 'Figure walking down a city street beneath an elevated track' },
      { alt: 'Figure walking a city street under an elevated track, red light ahead' },
      { alt: 'Aerial view of a long bridge stretching across the sea' },
      { alt: 'Aerial view of a cable-stayed bridge over the sea' },
      { alt: 'Masked figure wading through misty golden water' },
    ],
  },
  {
    slug: 'aerial',
    title: 'Aerial',
    side: 'left',
    hero: {
      width: 2000,
      alt: 'Top-down view of a weathered wooden pier with rusted floats, cutting diagonally across dark water',
      subjectX: 45,
      focusY: '50%',
    },
    frames: [
      { alt: 'Storm light breaking over a mountain above a desert city' },
      { alt: 'Pine-covered ridge beneath a granite dome' },
      { alt: 'Sunlit pines on a steep forested slope' },
      { alt: 'Road winding through a pine forest, seen from above' },
      { alt: 'Weathered pier stretching into blue water, seen from above', focus: '50% 40%' },
      { alt: 'Sandstone peaks catching the last light' },
      { alt: 'Jagged granite peaks wrapped in mist' },
      { alt: 'Sun setting behind layered mountain silhouettes' },
      { alt: 'Las Vegas skyline and tower in golden haze' },
      { alt: 'Desert city valley at sunset beneath distant mountains' },
      { alt: 'Dirt road winding across the desert under storm clouds' },
      { alt: 'Aerial abstract of a snowy shoreline against turquoise water' },
      { alt: 'Aerial view of a frosted peninsula meeting turquoise water' },
      { alt: 'Boat carving a white wake across green water, seen from above' },
      { alt: 'Boat crossing a glassy mountain lake' },
    ],
  },  {
    slug: 'motorsport',
    title: 'Motorsport',
    side: 'right',
    hero: {
      width: 2560,
      alt: 'Red Bull aerobatic plane trailing white smoke across a deep blue sky',
      subjectX: 70,
      mobileX: 82,
      focusY: '47%',
    },
    frames: [
      { alt: 'Nissan 350Z drifting through a wall of tyre smoke' },
      { alt: 'Trophy truck airborne over the desert' },
      { alt: 'Dirt bike rider emerging from a cloud of dust' },
      { alt: 'Two cars drifting in tandem' },
      { alt: 'Motocross rider launching off a desert jump' },
      { alt: 'Wrapped 350Z with headlights blazing at night' },
      { alt: 'Classic coupe at dusk' },
      { alt: 'Steampunk motorcycle sculpture in a warm-lit workshop' },
      { alt: 'Formula car racing past the barriers' },
      { alt: 'Dirt bike riders cresting a fog-covered hill' },
      { alt: 'Chrome lowrider trike at night' },
      { alt: 'Lowrider Impala, headlights blazing at night' },
      { alt: "Lowrider Impala's tail lights glowing at night" },
      { alt: 'Pit crew at work on race day' },
      { alt: 'Biplane trailing smoke over desert mountains' },
      { alt: 'Fighter jet low over desert mountains' },
      { alt: 'Drift car vanishing into a cloud of tyre smoke' },
      { alt: 'Vintage Spitfire coming in to land' },
      { alt: 'Custom motorcycle in a moody workshop' },
      { alt: 'Red Bull skydiver under canopy, trailing smoke' },
      { alt: 'Purple drift car, head-on' },
      { alt: 'Rat rod truck in a white concrete alley' },
      { alt: 'Drift car sliding at sunset' },
      { alt: 'Tail lights glowing through orange smoke' },
      { alt: 'Motorcycle streaking past city lights' },
      { alt: 'Burnout wrapped in pink smoke' },
      { alt: 'Thunderbirds in tight formation' },
      { alt: 'Freestyle motocross rider soaring over a ramp' },
      { alt: 'Classic Cadillac, headlights glowing teal at night' },
      { alt: 'Lowrider detail in orange and teal light' },
      { alt: 'Hoonigan #43 Porsche race car' },
      { alt: 'Five jets climbing in vertical formation' },
      { alt: 'Crowd surrounding a truck in a haze of smoke' },
      { alt: 'Drift car sliding through a corner' },
      { alt: 'Teal Corvette drifting in smoke' },
      { alt: 'Green 350Z drifting' },
      { alt: 'Green drift car with a big rear wing in smoke' },
      { alt: 'Vintage truck kicking up dust at sunset' },
      { alt: 'Vintage truck interior: steering wheel and gauges' },
      { alt: 'Rusted truck in a desert ghost town' },
      { alt: 'Orange Slide-livery Mustang' },
      { alt: 'Slide livery wheel buried in tyre smoke' },
      { alt: 'Motorcyclist riding a desert highway' },
      { alt: 'Blue pickup beneath a dramatic desert sky' },
      { alt: 'Biker on a chopper, headlight on, at dusk' },
      { alt: 'Custom chopper at dusk' },
      { alt: 'Drift cars silhouetted at sunset' },
      { alt: 'Trophy truck jumping beside a line of flags' },
      { alt: 'Monster Energy trophy truck throwing dirt' },
      { alt: 'Red RX-7 in a dark garage' },
    ],
  },
];

export const frameSrc = (slug: string, i: number) => {
  const n = String(i + 1).padStart(2, '0');
  return { thumb: `/images/${slug}/${n}-960.webp`, full: `/images/${slug}/${n}.webp` };
};
