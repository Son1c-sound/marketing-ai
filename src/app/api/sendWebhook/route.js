import OpenAI from 'openai';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY 
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const randomSeed = Date.now().toString();
  
  const message = `Generate 2 different content pieces for a product startup that converts speech to optimized social media posts. The product is called "Whisperin". One post should be optimized for Twitter, and one for Facebook.

  For the Twitter post:
  - Keep it concise and attention-grabbing (under 280 characters)
  - Focus on the key benefit: turning speech into optimized social posts
  - Include a clear call-to-action
  - Sound conversational and authentic
  
  For the Facebook post:
  - Create a slightly longer, more detailed post
  - Explain how the product works: record your speech and get optimized posts
  - Highlight a specific use case or benefit (saving time, increasing engagement, etc.)
  - Include a compelling call-to-action
  
  Make sure both posts:
  - Have different approaches and tones
  - Sound natural and conversational
  - Are marketing-focused but not overly salesy
  - NO emojis
  - Highlight the Whisperin product specifically
  
  Use the random seed ${randomSeed} to ensure uniqueness.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', 
      messages: [
        {
          role: 'system',
          content: `You create authentic, marketing-focused social media content for product startups.
          
          You understand:
          - Different platforms require different content styles and lengths
          - Twitter needs concise, punchy copy that hooks readers immediately
          - Facebook allows for more storytelling and explanation
          - Marketing content should highlight benefits, not just features
          - The best marketing sounds like a helpful friend, not a sales pitch
          
          You craft content that sounds like it was written by a real founder who deeply understands their product's value.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 800,
      temperature: 1.0,
    });

    const resultMessage = response.choices[0].message.content.trim();
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    
    const discordPayload = {
      content: resultMessage
    };
    
    const result = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (result.ok) {
      return new Response(
        JSON.stringify({ 
          status: 'Message sent successfully!',
          message: resultMessage,
          seed: randomSeed
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } else {
      const errorText = await result.text();
      console.error('Discord webhook error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          status: 'Error sending message to webhook',
          error: errorText
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'Error processing request',
        error: error.message 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}