
export enum ContentFormat {
  CAROUSEL = 'Carrossel',
  REELS = 'Reels',
  STORY = 'Story',
  POST = 'Post'
}

export enum SocialNetwork {
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn'
}

export enum ContentStatus {
  IDEA = 'IDEIA',
  PRODUCTION = 'PRODUÇÃO',
  SCHEDULED = 'AGENDADO',
  PUBLISHED = 'PUBLICADO'
}

export interface NexusPost {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  title: string;
  format: ContentFormat;
  socialNetwork: SocialNetwork;
  status: ContentStatus;
  owner: string;
  copy?: string;
  isArchived: boolean;
}

export interface StrategyConfig {
  [dayIndex: number]: {
    active: boolean;
    defaultFormat: ContentFormat;
  };
}

// Legacy types for compatibility (Mantidos para não quebrar referências antigas se houver)
export enum PostFormat {
  REELS = 'REELS',
  STORIES = 'STORIES',
  POST = 'POST',
  CAROUSEL = 'CAROUSEL',
  VIDEO = 'VIDEO'
}

export enum PostStatus {
  PLANEJADO = 'PLANEJADO',
  PRODUCAO = 'PRODUÇÃO',
  POSTADO = 'POSTADO',
  ADIADO = 'ADIADO'
}

export interface Post {
  id: string;
  date: string;
  title: string;
  format: PostFormat;
  status: PostStatus;
  responsible: string;
  summary: string;
  link: string;
}

export type WeeklyConfig = {
  [dayIndex: number]: {
    active: boolean;
    defaultFormat: PostFormat;
  };
}

export enum ThemeType {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  GOLD = 'GOLD'
}
