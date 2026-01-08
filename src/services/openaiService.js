/**
 * OpenAI Service
 * Handles communication with OpenAI Chat Completion API
 * Configured for appointment booking receptionist
 */

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    this.systemPrompt = `You are a professional and friendly AI receptionist for an office. Your primary job is to:

1. Greet visitors warmly
2. Ask who they would like to meet with
3. Collect necessary appointment details:
   - Name of the person they want to meet
   - Visitor's name
   - Purpose of the visit
   - Preferred date and time
4. Confirm the appointment details
5. Provide next steps or assistance

Guidelines:
- Be concise and conversational (responses will be spoken aloud)
- Keep responses to 2-3 sentences unless more detail is needed
- Be professional but friendly and welcoming
- Ask one question at a time to avoid overwhelming the visitor
- If the visitor seems unsure, offer to help or provide options
- Once you have all details, summarize the appointment and confirm

Remember: You're the first point of contact - make a great impression!`;
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {Array} messages - Array of conversation messages
   * @returns {Promise<string>} - AI response text
   */
  async sendMessage(messages) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY in .env file');
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Format messages for OpenAI API
   * @param {Array} conversationHistory - Array of {role, content} objects
   * @returns {Array} - Formatted messages
   */
  formatMessages(conversationHistory) {
    return conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}

export default new OpenAIService();