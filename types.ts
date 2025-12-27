
export enum PostFormat {
  REELS = 'Reels',
  STORIES = 'Stories',
  POST = 'Post'
}

export enum PostStatus {
  RASCUNHO = 'Rascunho',
  PLANEJADO = 'Planejado',
  PUBLICADO = 'Publicado',
  ADIADO = 'Adiado'
}

export enum ThemeType {
  DEFAULT = 'default',
  DARK = 'dark',
  CREATIVE = 'creative'
}

export interface Post {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  format: PostFormat;
  status: PostStatus;
  responsible?: string;
  summary?: string;
  link?: string;
}

export interface WeeklyConfig {
  [key: number]: { // 0 (Sun) to 6 (Sat)
    active: boolean;
    defaultFormat: PostFormat;
  };
}

export interface AppState {
  posts: Post[];
  weeklyConfig: WeeklyConfig;
  currentTheme: ThemeType;
}
