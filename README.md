# RAE Assistant Chatbot

A modern, feature-rich chatbot built with React and Node.js, leveraging advanced AI capabilities for natural conversations and image generation.

## Features

- 🤖 Natural Language Conversation using Google's Gemini API
- 🎨 Image Generation with Hugging Face API
- 📄 PDF Analysis and Text Extraction
- 🗣️ Voice Interaction (Speech-to-Text and Text-to-Speech)
- 📝 Conversation History Management
- 🌓 Light/Dark Theme Support
- 📱 Responsive Design for All Devices
- 💾 Local Storage for Settings and History
- 🔍 Conversation Search Functionality
- ⚙️ Customizable Settings

## Tech Stack

### Frontend
- React.js
- FontAwesome Icons
- Axios for API requests
- Custom CSS for styling

### Backend
- Node.js
- Express.js
- Multer for file uploads
- PDF-Parse for document analysis
- Dotenv for environment variables
- Node-Fetch for API requests

### APIs
- Google Gemini API for intelligent responses
- Hugging Face API for image generation

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/leothedev0705/Rae-Chatbot.git
   cd Rae-Chatbot
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd Backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create `.env` file in the Backend directory with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   HUGGING_FACE_API_KEY=your_huggingface_api_key
   ```

4. Start the servers:
   ```bash
   # Start backend server (from Backend directory)
   npm start

   # Start frontend server (from frontend directory)
   npm start
   ```

## Usage

1. **Chat Interface**: Type your message in the input field and press Enter or click the send button.
2. **Image Generation**: Use commands like "generate an image of..." to create AI-generated images.
3. **PDF Analysis**: Upload PDF files using the file upload button for text extraction and analysis.
4. **Voice Features**: Click the microphone icon to use voice input or the speaker icon for text-to-speech.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 