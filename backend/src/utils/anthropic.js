// const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// /**
//  * Calls the Anthropic Messages API with a system + user prompt and returns
//  * the assistant's text. The API key is read server-side from the
//  * environment and never sent to the browser.
//  *
//  * @param {string} system - system prompt
//  * @param {string} user - user message content
//  * @param {boolean} expectJSON - if true, strips code fences and JSON.parses the reply
//  */
// async function askClaude(system, user, expectJSON = false) {
//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) {
//     throw new Error('ANTHROPIC_API_KEY is not set on the server. Copy backend/.env.example to backend/.env and add your key.');
//   }

//   const res = await fetch(ANTHROPIC_API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01'
//     },
//     body: JSON.stringify({
//       model: MODEL,
//       max_tokens: 1024,
//       system,
//       messages: [{ role: 'user', content: user }]
//     })
//   });

//   if (!res.ok) {
//     const errText = await res.text();
//     throw new Error(`Anthropic API error ${res.status}: ${errText}`);
//   }

//   const data = await res.json();
//   const text = (data.content || []).map((b) => b.text || '').join('\n');

//   if (!expectJSON) return text;

//   const cleaned = text.replace(/```json|```/g, '').trim();
//   try {
//     return JSON.parse(cleaned);
//   } catch (err) {
//     throw new Error(`Model did not return valid JSON: ${cleaned.slice(0, 200)}`);
//   }
// }

// module.exports = { askClaude };

const MODEL = process.env.ANTHROPIC_MODEL || 'demo-model';

async function askClaude(system, user, expectJSON = false) {
  // Demo response for hackathon presentations

  if (expectJSON) {
    return {
      answer:
        "Based on the available maintenance records and equipment history, the asset shows moderate operational risk. Preventive maintenance is recommended and no immediate shutdown is required.",
      citations: ["WO-2025-014", "OEM-PUMP-101"],
      confidence: 92
    };
  }

  return `
Asset Brain Analysis

• Risk Level: Medium
• Recommended Action: Schedule preventive maintenance
• Confidence Score: 92%
• Related Documents: OEM Manual, Work Order, Inspection Report
`;
}

module.exports = { askClaude };