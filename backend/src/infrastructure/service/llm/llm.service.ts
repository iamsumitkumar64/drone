import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ScrapedProductData } from '../scraper/retailer-adapter.interface.js';

export interface LLMClassificationResult {
  title?: string;
  stockStatus: StockStatusEnum;
  price?: number;
  specs?: Record<string, any>;
  summary?: string;
}

export interface LLMChatResult {
  reply: string;
  intent:
    | 'SEARCH'
    | 'FILTER'
    | 'ADD_WATCHLIST'
    | 'REMOVE_WATCHLIST'
    | 'CHECK_STATUS'
    | 'COMPARE'
    | 'HELP'
    | 'GENERAL';
  actionData?: {
    query?: string;
    targetUrl?: string;
    productTitle?: string;
    category?: string;
    maxPrice?: number;
    compareIds?: string[];
  };
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly geminiApiKey?: string;
  private readonly openaiApiKey?: string;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName =
      this.configService.get<string>('LLM_MODEL') || 'gemini-1.5-flash';

    if (this.geminiApiKey) {
      this.logger.log(`Initialized LLMService with Gemini API (${this.modelName})`);
    } else if (this.openaiApiKey) {
      this.logger.log(`Initialized LLMService with OpenAI API (${this.modelName})`);
    } else {
      this.logger.log(
        'No LLM API key provided; using built-in rule-based heuristic classification and natural parser.',
      );
    }
  }

  /**
   * Parse noisy page snippet using a lightweight LLM (or fallback heuristic)
   */
  async classifyProductPage(
    rawSnippet: string,
    scraped: ScrapedProductData,
  ): Promise<LLMClassificationResult> {
    if (this.geminiApiKey) {
      try {
        return await this.classifyWithGemini(rawSnippet, scraped);
      } catch (err: any) {
        this.logger.warn(`Gemini classification failed: ${err.message}. Falling back to scraped data.`);
      }
    } else if (this.openaiApiKey) {
      try {
        return await this.classifyWithOpenAI(rawSnippet, scraped);
      } catch (err: any) {
        this.logger.warn(`OpenAI classification failed: ${err.message}. Falling back to scraped data.`);
      }
    }

    // Heuristic Fallback
    return {
      title: scraped.title,
      stockStatus: scraped.stockStatus,
      price: scraped.price,
      specs: scraped.specs || {},
      summary: scraped.description?.substring(0, 300),
    };
  }

  private async classifyWithGemini(
    rawSnippet: string,
    scraped: ScrapedProductData,
  ): Promise<LLMClassificationResult> {
    const prompt = `You are a lightweight drone electronics part analyzer.
Given this retailer page snippet and pre-scraped fields, extract or verify:
1. title: Exact product name
2. stockStatus: One of ["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "UNKNOWN"]
3. price: Numeric price in INR
4. specs: Key specifications (e.g. processor, weight, gyro, firmware, compatibility)
5. summary: 1-sentence product summary

Pre-scraped metadata:
Title: ${scraped.title || 'N/A'}
Price: ${scraped.price || 0}
Status Candidate: ${scraped.stockStatus}

Raw Page Content:
${rawSnippet.substring(0, 1500)}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "string",
  "stockStatus": "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" | "UNKNOWN",
  "price": number,
  "specs": { "key": "value" },
  "summary": "string"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP error ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      title: parsed.title || scraped.title,
      stockStatus: this.normalizeStockStatus(parsed.stockStatus) || scraped.stockStatus,
      price: typeof parsed.price === 'number' ? parsed.price : scraped.price,
      specs: parsed.specs || scraped.specs,
      summary: parsed.summary,
    };
  }

  private async classifyWithOpenAI(
    rawSnippet: string,
    scraped: ScrapedProductData,
  ): Promise<LLMClassificationResult> {
    const prompt = `Extract structured drone product availability and specs from this page content. Return JSON with title, stockStatus (IN_STOCK, OUT_OF_STOCK, PRE_ORDER, UNKNOWN), price (number), specs (object), summary.

Content: ${rawSnippet.substring(0, 1500)}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`OpenAI HTTP error ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      title: parsed.title || scraped.title,
      stockStatus: this.normalizeStockStatus(parsed.stockStatus) || scraped.stockStatus,
      price: typeof parsed.price === 'number' ? parsed.price : scraped.price,
      specs: parsed.specs || scraped.specs,
      summary: parsed.summary,
    };
  }

  /**
   * Conversational Query Handler
   */
  async processChat(
    message: string,
    catalog: any[],
    watchlist: any[],
  ): Promise<LLMChatResult> {
    const trimmed = message.trim();

    // Check for explicit commands first
    if (/^\/start|^\/help|help$/i.test(trimmed)) {
      return {
        reply: `👋 **Welcome to the Drone Parts AI Assistant!**\n\nI monitor specialty drone electronics across Indian retailers (Robu.in, ThinkRobotics, Zbotic, Evelta).\n\n**What you can do:**\n🔍 **Search & Filter:** "Find flight controllers under ₹10,000 in stock"\n👀 **Watchlist:** "Track https://robu.in/..." or "Show my watchlist"\n⚡ **Check Status:** "Is Pixhawk 6X available right now?"\n⚖️ **Compare:** "Compare Raspberry Pi 5 vs Pixhawk 6X"`,
        intent: 'HELP',
      };
    }

    // If URL is in message, detect ADD_WATCHLIST
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+/);
    if (urlMatch && /track|watch|add|monitor/i.test(trimmed)) {
      return {
        reply: `Got it! Adding ${urlMatch[0]} to your watchlist. I will monitor it for stock and price changes!`,
        intent: 'ADD_WATCHLIST',
        actionData: { targetUrl: urlMatch[0] },
      };
    }

    if (/watchlist|my list|tracked/i.test(trimmed)) {
      return {
        reply: `Here are the products currently in your watchlist.`,
        intent: 'CHECK_STATUS',
      };
    }

    if (this.geminiApiKey) {
      try {
        return await this.chatWithGemini(trimmed, catalog, watchlist);
      } catch (err: any) {
        this.logger.warn(`Gemini chat failed: ${err.message}. Using rule-based conversation.`);
      }
    } else if (this.openaiApiKey) {
      try {
        return await this.chatWithOpenAI(trimmed, catalog, watchlist);
      } catch (err: any) {
        this.logger.warn(`OpenAI chat failed: ${err.message}. Using rule-based conversation.`);
      }
    }

    // Smart heuristic conversational responder
    return this.fallbackChatResponse(trimmed, catalog, watchlist);
  }

  private async chatWithGemini(
    message: string,
    catalog: any[],
    watchlist: any[],
  ): Promise<LLMChatResult> {
    const catalogContext = catalog
      .slice(0, 15)
      .map(
        (p) =>
          `- [${p.retailer}] ${p.title} | Status: ${p.stockStatus} | Price: ₹${p.currentPrice} | URL: ${p.url}`,
      )
      .join('\n');

    const prompt = `You are an AI Drone Parts Shopping Assistant for India.
The user asks: "${message}"

Here is the current catalog and live status of tracked drone parts:
${catalogContext}

Respond with a JSON object:
{
  "reply": "Friendly markdown response directly addressing user with stock availability, specs, prices, and links where relevant.",
  "intent": "SEARCH" | "FILTER" | "ADD_WATCHLIST" | "REMOVE_WATCHLIST" | "CHECK_STATUS" | "COMPARE" | "GENERAL",
  "actionData": {
    "query": "search query if applicable",
    "targetUrl": "url if user requested tracking a link",
    "maxPrice": number or null
  }
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Gemini status ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      reply: parsed.reply,
      intent: parsed.intent || 'GENERAL',
      actionData: parsed.actionData,
    };
  }

  private async chatWithOpenAI(
    message: string,
    catalog: any[],
    watchlist: any[],
  ): Promise<LLMChatResult> {
    const catalogContext = catalog
      .slice(0, 15)
      .map(
        (p) =>
          `- [${p.retailer}] ${p.title} | Status: ${p.stockStatus} | Price: ₹${p.currentPrice} | URL: ${p.url}`,
      )
      .join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI Drone Parts Shopping Assistant. Respond with JSON: { "reply": "markdown text", "intent": "SEARCH"|"FILTER"|"ADD_WATCHLIST"|"REMOVE_WATCHLIST"|"CHECK_STATUS"|"COMPARE"|"GENERAL", "actionData": {} }`,
          },
          {
            role: 'user',
            content: `User query: ${message}\nCatalog:\n${catalogContext}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content);

    return {
      reply: parsed.reply,
      intent: parsed.intent || 'GENERAL',
      actionData: parsed.actionData,
    };
  }

  private fallbackChatResponse(
    message: string,
    catalog: any[],
    watchlist: any[],
  ): LLMChatResult {
    const lower = message.toLowerCase();

    // Check price filter: "under 10000" or "below 5000"
    const priceMatch = lower.match(/(?:under|below|less than|max)\s*₹?\s*(\d+)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

    // Filter matching products
    const inStockOnly = lower.includes('in stock') || lower.includes('available');

    const matching = catalog.filter((p) => {
      let matches = true;
      if (lower.includes('pixhawk') && !p.title.toLowerCase().includes('pixhawk')) matches = false;
      if (lower.includes('raspberry') && !p.title.toLowerCase().includes('raspberry') && !p.title.toLowerCase().includes('hat')) matches = false;
      if (lower.includes('flight controller') && p.category !== 'flight_controller') matches = false;
      if (inStockOnly && p.stockStatus !== StockStatusEnum.IN_STOCK) matches = false;
      if (maxPrice && Number(p.currentPrice) > maxPrice) matches = false;
      return matches;
    });

    if (matching.length > 0) {
      const itemsList = matching
        .slice(0, 5)
        .map(
          (p) =>
            `• **${p.title}** (${p.retailer})\n  Status: \`${p.stockStatus}\` | Price: **₹${Number(p.currentPrice).toLocaleString()}**\n  [View Listing](${p.url})`,
        )
        .join('\n\n');

      return {
        reply: `🔍 Found **${matching.length}** matching drone product(s):\n\n${itemsList}`,
        intent: maxPrice ? 'FILTER' : 'SEARCH',
        actionData: { maxPrice },
      };
    }

    if (lower.includes('compare')) {
      return {
        reply: `⚖️ **Drone Parts Comparison**:\n• **Raspberry Pi 5**: Ideal companion computer running Linux/ROS 2 for computer vision & obstacle avoidance.\n• **Holybro Pixhawk 6X**: High-end industrial flight controller with triple-redundant IMUs running PX4/ArduPilot for deterministic flight control.\n\nRecommended setup: Use Pixhawk 6X for real-time stabilization connected over UART/Ethernet to Raspberry Pi 5!`,
        intent: 'COMPARE',
      };
    }

    return {
      reply: `I searched across tracked drone stores (Robu.in, ThinkRobotics, Zbotic, Evelta). You can ask me to search specific parts like "Raspberry Pi 5", "Pixhawk 6X", or filter "flight controllers in stock under ₹15000".`,
      intent: 'GENERAL',
    };
  }

  private normalizeStockStatus(status?: string): StockStatusEnum | undefined {
    if (!status) return undefined;
    const upper = status.toUpperCase();
    if (upper === 'IN_STOCK') return StockStatusEnum.IN_STOCK;
    if (upper === 'OUT_OF_STOCK') return StockStatusEnum.OUT_OF_STOCK;
    if (upper === 'PRE_ORDER') return StockStatusEnum.PRE_ORDER;
    return StockStatusEnum.UNKNOWN;
  }
}
