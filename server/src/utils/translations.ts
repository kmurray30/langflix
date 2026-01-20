import * as fs from 'fs';
import * as path from 'path';
import { Word } from '../types';

// Helper function to slugify a title for filename
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

// Helper function to load translations from file
export function loadTranslations(videoId: string, videoTitle: string): Word[] | null {
  const slugifiedTitle = slugifyTitle(videoTitle);
  const filename = `${videoId}-${slugifiedTitle}`;
  // Path should be relative to server directory since server runs from /server
  const translationsDir = path.join(process.cwd(), 'data/translations');
  const translationFile = path.join(translationsDir, filename);
  
  if (!fs.existsSync(translationFile)) {
    console.warn('Translation file not found:', translationFile);
    return null;
  }
  
  try {
    console.log('✓ Loading translations from:', filename);
    const fileContent = fs.readFileSync(translationFile, 'utf-8');
    const translations: Word[] = JSON.parse(fileContent);
    
    if (!Array.isArray(translations)) {
      console.error('Invalid translation file format: expected array');
      return null;
    }
    
    return translations;
  } catch (error) {
    console.error('Error reading translation file:', error);
    return null;
  }
}
