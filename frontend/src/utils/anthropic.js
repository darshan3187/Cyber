import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.REACT_APP_ANTHROPIC_API_KEY;

// NOTE: using dangerouslyAllowBrowser for hackathon demo purposes.
// In production, this call must go through a secure backend to protect the API key.
const anthropic = new Anthropic({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true,
});

export const classifyThreat = async (text, type = 'text') => {
  if (!apiKey || apiKey === 'your_api_key_here') {
    // Return mock response for demoing visually without API key
    await new Promise(r => setTimeout(r, 1500));
    
    // Check if it's the exact demo URL requested
    if (text.includes("paypa1-secure-login.verify-account.com")) {
      return {
        category: "Phishing",
        severity: "High",
        confidence: 96,
        explanation: "This URL attempts to impersonate PayPal using a misspelling ('paypa1' instead of 'paypal'). This is a classic typosquatting technique designed to steal user credentials.",
        indicators: [
          "Lookalike domain (typosquatting) with '1' instead of 'l'",
          "Generic subdomain usage 'verify-account'",
          "Suspicious parameter '?user=you'"
        ],
        advice: [
          "Do not click the link or enter any credentials.",
          "Navigate to paypal.com directly through your browser.",
          "Report the message as phishing."
        ],
        educational_tip: "Always check the domain name spelling carefully. Legitimate companies never use lookalike domains like 'paypa1'."
      };
    }
    
    if (text.includes("google.com")) {
      return {
        category: "Safe",
        severity: "None",
        confidence: 99,
        explanation: "This is the legitimate, official URL for Google. It does not display any characteristics of a phishing or malware domain.",
        indicators: ["Official domain structure", "No suspicious parameters"],
        advice: ["Safe to proceed normally."],
        educational_tip: "When in doubt, manually type the domain you intend to visit rather than clicking a link."
      };
    }

    // Default mock response
    return {
      category: "Social Engineering",
      severity: "Medium",
      confidence: 85,
      explanation: "This content uses urgent language typical of social engineering scams, trying to force you into a quick action.",
      indicators: ["Urgent language", "Request for action"],
      advice: ["Verify the sender through another channel", "Do not click links"],
      educational_tip: "Scammers create artificial urgency to make you act without thinking."
    };
  }

  const systemPrompt = `You are a cybersecurity expert. Analyse the following user-submitted content and classify it. Respond ONLY in this exact JSON format, with no markdown formatting or extra text:
{
  "category": "Phishing" | "Malware" | "Social Engineering" | "Safe",
  "severity": "Low" | "Medium" | "High" | "None",
  "confidence": 0-100,
  "explanation": "2-3 sentence plain English explanation of why",
  "indicators": ["indicator1", "indicator2", "indicator3"],
  "advice": ["action1", "action2", "action3"],
  "educational_tip": "One sentence teaching the user what to watch for"
}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: "user", content: `Content type: ${type}\n\nContent to analyze:\n${text}` }
      ],
    });

    const resultText = msg.content[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Classification error:", error);
    throw new Error("Failed to classify content. Please try again.");
  }
};
