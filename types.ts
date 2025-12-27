
export enum PostFormat {
  REELS = 'REELS',
  STORIES = 'STORIES',
  POST = 'POST'
}

export enum PostStatus {
  PLANEJADO = 'PLANEJADO',
  PRODUCAO = 'PRODUCAO',
  CONCLUIDO = 'CONCLUIDO',
  POSTADO = 'POSTADO'
}

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  GOLD = 'gold'
}

export interface Post {
  id: string;
  date: string;
  title: string;
  format: PostFormat;
  status: PostStatus;
  responsible: string;
  note: string;
  // Added optional fields to satisfy PostModal and App usages
  summary?: string;
  link?: string;
}

export interface WeeklyConfig {
  [key: number]: {
    active: boolean;
    // Renamed to defaultFormat to match Patterns component and avoid conflicts
    defaultFormat: PostFormat;
  };
}

export interface AppData {
  posts: Post[];
  config: WeeklyConfig;
  theme: ThemeType;
}
