import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Get AI suggestion for waste utilization
 */
export const getWasteSuggestion = async (
  wasteType: string,
  imageUrl?: string
): Promise<string> => {
  // If OpenAI is not configured, return default suggestions
  if (!openai) {
    return getDefaultSuggestion(wasteType);
  }

  try {
    const prompt = `Kamu adalah asisten AI edukatif untuk siswa SMA yang membantu memanfaatkan limbah makanan.

Jenis limbah: ${wasteType}

Berikan saran singkat (maksimal 2 kalimat) tentang cara memanfaatkan limbah ini dengan cara yang mudah dipahami siswa SMA.
Fokus pada manfaat lingkungan dan edukatif. Gunakan bahasa Indonesia yang ramah dan menarik.
Jangan gunakan kata-kata teknis yang sulit dipahami.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten edukatif untuk pemanfaatan limbah makanan yang ramah dan membantu siswa SMA. Gunakan bahasa yang mudah dipahami dan menarik.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0].message.content || getDefaultSuggestion(wasteType);
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return getDefaultSuggestion(wasteType);
  }
};

/**
 * Default suggestions when AI is not available
 */
const getDefaultSuggestion = (wasteType: string): string => {
  const suggestions: Record<string, string> = {
    KOMPOS: 'Sisa makanan organik bisa dijadikan kompos! Campurkan dengan daun kering dan biarkan terurai selama 2-3 bulan. Kompos ini bisa menyuburkan tanaman di sekolah.',
    ECO_ENZYME: 'Sisa kulit buah bisa dibuat eco-enzyme! Campurkan dengan gula dan air dengan perbandingan 1:3:10. Fermentasi selama 3 bulan, hasilnya bisa untuk pembersih alami.',
    PAKAN_TERNAK: 'Sisa makanan yang masih layak bisa diberikan ke ternak seperti ayam atau kambing. Pastikan makanan tidak basi dan tidak mengandung bahan berbahaya.',
    MEDIA_TANAM: 'Sisa makanan yang sudah terurai bisa dicampur dengan tanah sebagai media tanam. Ini akan menyuburkan tanaman dan mengurangi sampah organik.',
    PRAKARYA: 'Sisa makanan bisa dijadikan bahan prakarya kreatif! Misalnya kulit telur untuk mozaik, atau biji-bijian untuk kolase. Kreativitas tanpa batas!',
  };

  return suggestions[wasteType] || 'Limbah makanan bisa dimanfaatkan dengan berbagai cara kreatif. Coba eksplorasi ide-ide baru yang ramah lingkungan!';
};

