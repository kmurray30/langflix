import * as fs from 'fs';
import * as path from 'path';
import { AllUserProgress, DeckProgressMap, WordProgress } from '../types';

// Path to the user progress file
const USER_PROGRESS_FILE = path.join(process.cwd(), 'data/user-progress.json');

/**
 * Load all user progress data from disk
 * Returns empty object if file doesn't exist
 */
export function loadUserProgress(): AllUserProgress {
  try {
    if (!fs.existsSync(USER_PROGRESS_FILE)) {
      console.log('No user progress file found, creating new one');
      return {};
    }
    
    const fileContent = fs.readFileSync(USER_PROGRESS_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading user progress:', error);
    return {};
  }
}

/**
 * Save all user progress data to disk
 */
export function saveUserProgress(progressData: AllUserProgress): void {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(USER_PROGRESS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(USER_PROGRESS_FILE, JSON.stringify(progressData, null, 2), 'utf-8');
    console.log('✓ Saved user progress to disk');
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
}

/**
 * Get progress data for a specific user and deck
 * Returns empty object if no progress exists
 */
export function getUserDeckProgress(userId: string, deckId: string): DeckProgressMap {
  const allProgress = loadUserProgress();
  
  if (!allProgress[userId]) {
    return {};
  }
  
  return allProgress[userId][deckId] || {};
}

/**
 * Update confidence for a specific word
 * If correct: set confidence to 100
 * If incorrect: increment confidence by 1
 */
export function updateWordConfidence(
  userId: string,
  deckId: string,
  spanishWord: string,
  wasCorrect: boolean
): void {
  const allProgress = loadUserProgress();
  
  // Initialize user if doesn't exist
  if (!allProgress[userId]) {
    allProgress[userId] = {};
  }
  
  // Initialize deck if doesn't exist
  if (!allProgress[userId][deckId]) {
    allProgress[userId][deckId] = {};
  }
  
  // Get current progress for this word
  const currentProgress = allProgress[userId][deckId][spanishWord];
  const currentConfidence = currentProgress?.confidence || 0;
  
  // Update confidence based on correctness
  const newConfidence = wasCorrect ? 100 : currentConfidence + 1;
  
  // Update progress
  allProgress[userId][deckId][spanishWord] = {
    confidence: newConfidence,
    lastSeen: new Date().toISOString()
  };
  
  saveUserProgress(allProgress);
  
  console.log(`Updated ${spanishWord}: ${currentConfidence} -> ${newConfidence} (${wasCorrect ? 'correct' : 'incorrect'})`);
}

/**
 * Reset all progress for a specific deck
 * Sets all word confidences to 0
 */
export function resetDeckProgress(userId: string, deckId: string): void {
  const allProgress = loadUserProgress();
  
  // If user or deck doesn't exist, nothing to reset
  if (!allProgress[userId] || !allProgress[userId][deckId]) {
    console.log(`No progress to reset for user ${userId}, deck ${deckId}`);
    return;
  }
  
  // Reset all word confidences to 0
  const deckProgress = allProgress[userId][deckId];
  for (const spanishWord in deckProgress) {
    deckProgress[spanishWord] = {
      confidence: 0,
      lastSeen: new Date().toISOString()
    };
  }
  
  saveUserProgress(allProgress);
  console.log(`✓ Reset progress for deck ${deckId}`);
}

/**
 * Calculate statistics for a deck
 * Returns learned count, total count, and percentage
 */
export function calculateDeckStats(userId: string, deckId: string, totalWords: number): {
  learnedCount: number;
  totalCount: number;
  percentLearned: number;
} {
  const deckProgress = getUserDeckProgress(userId, deckId);
  
  // Count words with confidence = 100
  const learnedCount = Object.values(deckProgress).filter(
    (progress: WordProgress) => progress.confidence === 100
  ).length;
  
  const percentLearned = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;
  
  return {
    learnedCount,
    totalCount: totalWords,
    percentLearned
  };
}
