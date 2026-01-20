import * as fs from 'fs';
import * as path from 'path';

interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

// Function to count words in subtitle file
function countWords(filename: string): void {
  const subtitlesDir = path.join(process.cwd(), 'server/data/subtitles');
  const filePath = path.join(subtitlesDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filename}`);
    console.error(`   Looking in: ${subtitlesDir}`);
    process.exit(1);
  }
  
  try {
    // Read and parse the subtitle file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const subtitles: Subtitle[] = JSON.parse(fileContent);
    
    if (!Array.isArray(subtitles)) {
      console.error('❌ Invalid subtitle file format: expected array');
      process.exit(1);
    }
    
    // Combine all subtitle text
    const allText = subtitles.map(subtitle => subtitle.text).join(' ');
    
    // Split into words (handle multiple spaces, punctuation, etc.)
    const words = allText
      .toLowerCase()
      .replace(/[.,!?;:()\[\]{}"""'']/g, '') // Remove punctuation
      .split(/\s+/) // Split on whitespace
      .filter(word => word.length > 0); // Remove empty strings
    
    // Count unique words
    const uniqueWords = new Set(words);
    
    // Display results
    console.log(`📊 Word count for: ${filename}`);
    console.log(`   Total words: ${words.length}`);
    console.log(`   Unique words: ${uniqueWords.size}`);
    console.log(`   Total subtitle segments: ${subtitles.length}`);
    
  } catch (error) {
    console.error('❌ Error reading or parsing subtitle file:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('Usage: npm run wordcount <filename>');
  console.error('Example: npm run wordcount video-3-spanish-story-el-mono-rojo.json');
  process.exit(1);
}

const filename = args[0];

// Run the script
countWords(filename);
