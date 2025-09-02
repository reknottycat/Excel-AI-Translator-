
export enum MatchPolicy {
  FLEXIBLE = 'FLEXIBLE',
  EXACT_ONLY = 'EXACT_ONLY',
}

export enum TranslationModel {
  GEMINI = 'Gemini',
  BAILIAN = 'Alibaba Bailian',
}

export interface TranslationEntry {
  id: string;
  source: string;
  target: string;
  policy: MatchPolicy;
}

export enum AppStep {
  UPLOAD = 1,
  DICTIONARY = 2,
  TRANSLATE = 3,
}

export interface TranslatedFile {
    name: string;
    blob: Blob;
}

export interface Language {
  code: string;
  name: string;
}