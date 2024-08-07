# Shopify Product Scraper

This web application scrapes product information from a given Shopify store and displays it in an attractive format. The project is divided into three parts: reading XML files, processing content using Large Language Models (LLMs), and a pre-XML scraping process.

## Table of Contents
- [Features](#features)
- [Technical Requirements](#technical-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Tested Shopify Stores](#tested-shopify-stores)
- [Project Structure](#project-structure)
- [License](#license)

## Features

### Reading XML Files
- Accepts a product sitemap XML URL.
- Extracts product links, product images, and product image titles.
- Displays the first 5 product image titles with their images as React UI cards.

### Content Processing using LLMs
- Parses the entire product page content.
- Summarizes the content using an LLM API (like ChatGPT or Groq) in 3-4 bullet points.
- Displays the summarized description in the React UI card.

### Pre-XML Scraping Process
- Accepts a domain name.
- Retrieves and parses the robots.txt file.
- Extracts the main XML sitemap URL.
- Finds the product sitemap link from the main sitemap.
- Displays results from Part 1 and Part 2.

## Technical Requirements
- **Backend:** JavaScript runtime (Node.js)
- **Frontend:** React for UI components

## ***If your are not getting product summary just change the api key***


