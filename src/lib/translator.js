// Translation utility using MyMemory API (free, reliable)
// For production, consider using Google Translate API with proper API key

const translationsCache = new Map();
const TRANSLATION_DELAY = 300; // ms between requests to avoid rate limiting

// Language code mapping for MyMemory API
const languageMap = {
  'id': 'id',
  'en': 'en-GB',
  'jp': 'ja'
};

let lastTranslationTime = 0;

export const translateText = async (text, fromLang, toLang) => {
  // If same language, return original text
  if (fromLang === toLang) return text;
  
  // Check cache first
  const cacheKey = `${text}-${fromLang}-${toLang}`;
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey);
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastTranslation = now - lastTranslationTime;
  if (timeSinceLastTranslation < TRANSLATION_DELAY) {
    await new Promise(resolve => setTimeout(resolve, TRANSLATION_DELAY - timeSinceLastTranslation));
  }
  lastTranslationTime = Date.now();

  try {
    // Using MyMemory Translation API (free, no API key required for basic usage)
    const sourceLang = languageMap[fromLang] || fromLang;
    const targetLang = languageMap[toLang] || toLang;
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;
      
      // Cache the result
      translationsCache.set(cacheKey, translatedText);
      
      return translatedText;
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text if translation fails
    return text;
  }
};

export const translateContent = async (content, currentLanguage, targetLanguage) => {
  if (!content || currentLanguage === targetLanguage) return content;
  
  // Assume original content is in Indonesian (id)
  const fromLang = 'id';
  const toLang = targetLanguage;
  
  // Split content into chunks for better translation (max 500 chars per chunk)
  const chunks = [];
  let currentChunk = '';
  
  content.split(/(?<=[.!?])\s+/).forEach(sentence => {
    if ((currentChunk + sentence).length > 500) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  });
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  
  const translatedChunks = await Promise.all(
    chunks.map(chunk => translateText(chunk.trim(), fromLang, toLang))
  );
  
  return translatedChunks.join(' ');
};

// Hook for translating content with loading state
export const useTranslator = () => {
  const translate = async (text, fromLang = 'id', toLang = 'id') => {
    return await translateText(text, fromLang, toLang);
  };

  return { translate };
};
