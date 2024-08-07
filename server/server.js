
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

// GroqCloud API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

async function summarizeUrl(url) {
  try {
    // Fetch the content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML and extract the main text content
    const $ = cheerio.load(html);
    let content = $('body').text();
    content = content.replace(/\s+/g, ' ').trim();

    // Truncate content if it's too long
    if (content.length > 4000) {
      content = content.substring(0, 4000);
    }

    // Generate summary using GroqCloud API
    const groqResponse = await axios.post(GROQ_API_URL, {
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes web content." },
        { role: "user", content: `Summarize the following content in 3-4 lines: ${content}` }
      ],
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract the summary from the GroqCloud API response
    const summary = groqResponse.data.choices[0].message.content;
    return summary;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return 'No summary available';
  }
}

app.post('/scrape', async (req, res) => {
  const { domain } = req.body;
  console.log(`Received request to scrape domain: ${domain}`);

  try {
    // Retrieve and parse the robots.txt file
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    console.log(`Fetching robots.txt from: ${robotsTxtUrl}`);
    const robotsResponse = await axios.get(robotsTxtUrl);
    const robotsTxt = robotsResponse.data;

    // Extract the main XML sitemap URL
    const sitemapUrlMatch = robotsTxt.match(/Sitemap: (.+)/i);
    if (!sitemapUrlMatch) {
      console.log('Sitemap URL not found in robots.txt');
      return res.status(404).json({ error: 'Sitemap URL not found in robots.txt' });
    }
    const mainSitemapUrl = sitemapUrlMatch[1];
    console.log(`Main sitemap URL found: ${mainSitemapUrl}`);

    // Find the product sitemap link from the main sitemap
    const sitemapResponse = await axios.get(mainSitemapUrl);
    const $ = cheerio.load(sitemapResponse.data, { xmlMode: true });
    let productSitemapUrls = [];

    $('sitemap loc').each((index, element) => {
      const loc = $(element).text();
      if (loc.includes('product')) {
        productSitemapUrls.push(loc);
      }
    });

    if (productSitemapUrls.length === 0) {
      console.log('Product sitemap URL not found');
      return res.status(404).json({ error: 'Product sitemap URL not found' });
    }

    console.log(`Product sitemap URLs found: ${productSitemapUrls}`);
    let products = [];
    let currentIndex = 0;

    // Fetch products from sitemaps until we have at least 5
    while (products.length < 5 && currentIndex < productSitemapUrls.length) {
      const productSitemapResponse = await axios.get(productSitemapUrls[currentIndex]);
      const $$ = cheerio.load(productSitemapResponse.data, { xmlMode: true });

      await Promise.all(
        $$('url').map(async (index, element) => {
          if (products.length >= 5) return false; // Limit to first 5 products

          const loc = $$(element).find('loc').text();
          const image = $$(element).find('image\\:loc').text();
          const title = $$(element).find('image\\:title').text();

          if (loc && image && title) {
            console.log(`Fetching summary for: ${loc}`);
            const summary = await summarizeUrl(loc); // Get the summary for each URL
            console.log(`Summary for ${loc}: ${summary}`);
            products.push({ loc, image, title, summary });
          }
        }).get()
      );

      currentIndex++;
    }

    if (products.length === 0) {
      console.log('No products found');
      return res.status(404).json({ error: 'No products found' });
    }

    // Debugging output
    console.log(`Found ${products.length} products.`);
    res.json({ productSitemapUrls, products });
  } catch (error) {
    console.error('An error occurred while scraping:', error.message);
    res.status(500).json({ error: 'An error occurred while scraping' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




