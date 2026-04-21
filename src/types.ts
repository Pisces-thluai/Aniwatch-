export interface Anime {
  id: string;
  title: string;
  japaneseTitle?: string;
  image: string;
  banner?: string;
  description: string;
  type: string;
  duration: string;
  releaseDate: string;
  quality: string;
  sub: number;
  dub: number;
  episodes: number;
  rating: string;
}
