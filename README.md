# Relic

**Don't just surf the internet, curate it.**
Relic is an intelligent, organized platform designed to help you capture, store, and discover the information that matters most to you.

[🚀 **Live Demo**](https://relic-gamma.vercel.app/)

## Overview

In an era of information overload, finding what you saved weeks ago shouldn't be a chore. Relic bridges the gap between saving disorganized links and building a personal knowledge engine. It enables users to securely save articles, videos, and documents directly from their browser, automatically processing and organizing them using advanced AI parsing, text extraction, and semantic search capabilities.

## Key Features

- **Context-Aware Semantic Search:** Relic moves beyond basic keyword matching. It utilizes advanced vector database integration (Pinecone) and embedding models (MistralAI) to let you search through your knowledge base conceptually.
- **Intelligent Data Extraction:** Whether it's an article, a PDF, a YouTube video, or a Product link. Relic processes and extracts readable content efficiently, removing unnecessary noise.
- **Seamless Capture:** A dedicated browser extension built on Manifest V3 allows for one-click saving directly into your Relic collection without breaking your workflow.
- **Modern & Responsive UI:** Built specifically for speed and accessibility, the frontend features fluid animations and dynamic visualizations to make exploring your data intuitive.
- **Real-time Pipeline:** Under the hood, Relic is powered by a robust Express backend incorporating caching layers, rate limiting, and secure authentication to ensure high performance and reliability.

## Tech Stack Overview

Relic is built as a complete full-stack application, leveraging a modern ecosystem to deliver speed and intelligence.

- **Frontend:** React, Redux Toolkit, Vite, Tailwind CSS, Motion One, D3.js
- **Backend:** Node.js, Express, MongoDB, Redis
- **AI & NLP Ecosystem:** LangChain, Pinecone, Google Generative AI, Groq, MistralAI
- **Content Processors:** Mozilla Readability, PDF Parsing, YouTube Transcript Extraction
- **Tools & Integration:** Custom Chrome Extension (Manifest V3)

## Folder Structure

The repository is modularly structured, separating concerns across distinct environments to ensure maintainability and scalability.

```text
relic/
├── backend/       # Core REST API, database models, and AI/NLP processing pipelines
├── frontend/      # React-based user interface, state management, and styling
├── extension/     # Chrome browser extension for one-click content capture
└── README.md
```

## Engineering Philosophy

Relic was engineered with a strong emphasis on clean code, modular architecture, and user experience.
The integration of a sophisticated AI pipeline alongside a traditional CRUD architecture demonstrates a commitment to building modern, robust, and forward-thinking applications. Every layer of the stack prioritizes security, scalable data handling, and an intuitive user journey.

## Let’s Connect & Collaborate

If you found this project useful or interesting, feel free to connect with me! I'm always open to discussions, feedback, and collaboration opportunities.

[LinkedIn](https://www.linkedin.com/in/rayala07/)
[X](https://x.com/ReyZox_07)

⭐ If you liked this project, consider giving it a star.. it really helps :)
