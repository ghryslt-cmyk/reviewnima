// Translation utility using Google Translate via CORS proxy
// For production, consider using Google Translate API with proper API key

const translationsCache = new Map();
const TRANSLATION_DELAY = 500; // ms between requests to avoid rate limiting

// Language code mapping for Google Translate
const languageMap = {
  'id': 'id',
  'en': 'en',
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
    // Using Google Translate via CORS proxy (allorigins.win)
    const sourceLang = languageMap[fromLang] || fromLang;
    const targetLang = languageMap[toLang] || toLang;
    
    // Using Google Translate unofficial API via CORS proxy
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    // Use CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Google Translate returns array of arrays, extract translated text
    if (data && data[0]) {
      const translatedText = data[0].map(item => item[0]).join('');
      
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
  
  // Assume original content is in English (en) for news
  const fromLang = 'en';
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
  const translate = async (text, fromLang = 'en', toLang = 'en') => {
    return await translateText(text, fromLang, toLang);
  };

  return { translate };
};
