# RAE (Research Assistant & Educator) Chatbot 🤖

A powerful AI-powered research assistant that helps users explore academic papers, generate summaries, and facilitate learning through interactive conversations.

## ✨ Features

- **Intelligent Chat Interface**: Natural language conversations about research topics
- **Paper Search & Analysis**: Search and analyze research papers from multiple sources:
  - Semantic Scholar
  - arXiv
  - CORE
- **Paper Summarization**: Get concise summaries of academic papers
- **Image Generation**: AI-powered image generation for research concepts
- **PDF Processing**: Extract and analyze content from PDF documents
- **Multi-Source Integration**: Unified access to multiple research databases

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- API Keys for:
  - Gemini API
  - Hugging Face
  - CORE API (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/creativeluziana/RAE---FULL.git
cd RAE---FULL
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key
HUGGING_FACE_API_KEY=your_huggingface_api_key
CORE_API_KEY=your_core_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express
- **AI Integration**: 
  - Gemini AI for chat
  - Hugging Face for image generation
- **APIs**: 
  - Semantic Scholar
  - arXiv
  - CORE

## 🔒 Security

- API keys are securely managed through environment variables
- CORS protection enabled
- Rate limiting implemented for API endpoints

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any queries or support, please reach out to the repository owner.

---
Made with ❤️ by Luziana 