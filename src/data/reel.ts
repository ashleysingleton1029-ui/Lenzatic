// Hero reel clips, in dial order. Each id is a Cloudflare Stream video id.
// To add, remove or reorder clips, edit this list.
export const STREAM_BASE = 'https://customer-awi3sybvxx4bbl65.cloudflarestream.com';

export const reel = [
  { id: '86630c38d997b420442d8d72000dfe42', title: 'Narrative' },
  { id: '303a47e2ab5086f0705bfec8d31bf017', title: 'Aerial' },
  { id: '1167f2a9d408dd8d3c26ed38753d27b5', title: 'Motorsport' },
  { id: '5d4448d26d3f028cf15cd1e3d9aa7b1f', title: 'Motorsport' },
];

export const manifestUrl = (id: string) => `${STREAM_BASE}/${id}/manifest/video.m3u8`;
export const posterUrl = (id: string) =>
  `${STREAM_BASE}/${id}/thumbnails/thumbnail.jpg?time=0s&height=1080`;
