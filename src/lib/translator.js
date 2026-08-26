// Simple translation utility for dynamic content translation
// In production, this should be replaced with a proper translation API like Google Translate, DeepL, etc.

const translationsCache = new Map();

export const translateText = async (text, fromLang, toLang) => {
  // If same language, return original text
  if (fromLang === toLang) return text;
  
  // Check cache first
  const cacheKey = `${text}-${fromLang}-${toLang}`;
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey);
  }

  // For demo purposes, we'll use a simple approach
  // In production, integrate with a translation API
  try {
    // Using LibreTranslate API (free, open-source)
    // Note: This is a public API, for production use your own instance
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: fromLang === 'id' ? 'id' : fromLang === 'jp' ? 'ja' : 'en',
        target: toLang === 'id' ? 'id' : toLang === 'jp' ? 'ja' : 'en',
        format: 'text'
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const translatedText = data.translatedText;
    
    // Cache the result
    translationsCache.set(cacheKey, translatedText);
    
    return translatedText;
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
  
  // Split content into sentences for better translation
  const sentences = content.split(/(?<=[.!?])\s+/);
  const translatedSentences = await Promise.all(
    sentences.map(sentence => translateText(sentence.trim(), fromLang, toLang))
  );
  
  return translatedSentences.join(' ');
};

// Hook for translating content with loading state
export const useTranslator = () => {
  const translate = async (text, fromLang = 'id', toLang = 'id') => {
    return await translateText(text, fromLang, toLang);
  };

  return { translate };
};
