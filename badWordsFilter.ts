import Filter from 'bad-words';

// Initialize bad words filter
const filter = new Filter();

// Add Indonesian bad words
const indonesianBadWords = [
  'anjing', 'bangsat', 'tolol', 'bodoh', 'goblok', 'bego',
  'dungu', 'idiot', 'bajingan', 'kampret', 'kontol', 'memek',
  'ngentot', 'jancok', 'asu', 'babi', 'setan',
];

indonesianBadWords.forEach(word => {
  filter.addWords(word);
});

/**
 * Check if text contains bad words
 */
export const containsBadWords = (text: string): boolean => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  try {
    return filter.isProfane(text.toLowerCase());
  } catch (error) {
    console.error('Bad words filter error:', error);
    return false;
  }
};

/**
 * Filter/replace bad words in text
 */
export const filterBadWords = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  try {
    return filter.clean(text);
  } catch (error) {
    console.error('Bad words filter error:', error);
    return text;
  }
};

/**
 * Validate text for inappropriate content
 */
export const validateText = (text: string, maxLength: number = 500): { 
  valid: boolean; 
  message?: string;
  filtered?: string;
} => {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Teks tidak boleh kosong' };
  }

  if (text.length > maxLength) {
    return { valid: false, message: `Teks terlalu panjang (maksimal ${maxLength} karakter)` };
  }

  if (containsBadWords(text)) {
    return { 
      valid: false, 
      message: 'Teks mengandung kata tidak pantas',
      filtered: filterBadWords(text),
    };
  }

  return { valid: true };
};

