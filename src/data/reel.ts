// Hero reel clips, in dial order. Each id is a Cloudflare Stream video id.
// To add, remove or reorder clips, edit this list.
// Optional `length` (seconds) plays only the start of a longer clip.
export const STREAM_BASE = 'https://customer-awi3sybvxx4bbl65.cloudflarestream.com';

export const reel: { id: string; title: string; length?: number }[] = [
  { id: '86630c38d997b420442d8d72000dfe42', title: 'Narrative' },
  { id: '303a47e2ab5086f0705bfec8d31bf017', title: 'Aerial' },
  { id: '1167f2a9d408dd8d3c26ed38753d27b5', title: 'Motorsport' },
  { id: '1fda99a8b4757ae79673fa6cce1629cc', title: 'Portrait', length: 5 },
];

export const manifestUrl = (id: string) => `${STREAM_BASE}/${id}/manifest/video.m3u8`;
export const posterUrl = (id: string) =>
  `${STREAM_BASE}/${id}/thumbnails/thumbnail.jpg?time=0s&height=1080`;
