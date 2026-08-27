import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const analyzeUrlWithOpenAI = async (url: string) => {
  const isMaliciousMock =
    url.toLowerCase().includes('malware') ||
    url.toLowerCase().includes('phishing') ||
    url.toLowerCase().includes('bad') ||
    url.toLowerCase().includes('login');

  // في حال عدم وجود مفتاح OpenAI أو وجود المفتاح الافتراضي
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'your_openai_api_key' ||
    process.env.OPENAI_API_KEY === 'dummy_key'
  ) {
    return {
      riskScore: isMaliciousMock ? 85 : 12,
      classification: isMaliciousMock ? 'Malicious' : 'Safe',
      threatIndicators: isMaliciousMock
        ? ['Suspicious domain pattern', 'Unverified login portal', 'Potential credential harvesting']
        : ['Valid domain structure', 'No blacklisted patterns detected'],
      aiExplanation: isMaliciousMock
        ? 'Simulated AI Analysis: The URL contains high-risk indicators commonly associated with phishing campaigns.'
        : 'Simulated AI Analysis: The URL shows no immediate threat indicators and appears safe.',
    };
  }

  try {
    const prompt = `Analyze the following URL for cyber security threats (Phishing, Malware, Scam): "${url}".
    Return ONLY a raw JSON object with this exact structure:
    {
      "riskScore": number between 0 and 100,
      "classification": "Safe" or "Suspicious" or "Malicious",
      "threatIndicators": ["indicator1", "indicator2"],
      "aiExplanation": "short summary explaining the verdict"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Error, falling back to heuristic check:', error);
    return {
      riskScore: isMaliciousMock ? 85 : 15,
      classification: isMaliciousMock ? 'Malicious' : 'Safe',
      threatIndicators: ['Automated heuristic scan fallback'],
      aiExplanation: 'Heuristic evaluation completed successfully.',
    };
  }
};