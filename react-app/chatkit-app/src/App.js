import { ChatKit, useChatKit } from "@openai/chatkit-react";

const BACKEND_URL = "http://localhost:8000";

const simpleTheme = {
  theme: {
      colorScheme: "light",
    },
    startScreen: {
      greeting: "Hello! Ask me anything.",
      prompts: [
        { label: "Help", prompt: "Help me", icon: "circle-question" },
      ],
    },
}

const darkTheme = {
  theme: {
    colorScheme: "dark",
  },
  startScreen: {
    greeting: "Hi there 👋 How can I help?",
    prompts: [
      { label: "Get Started", prompt: "Help me get started" },
      { label: "FAQs", prompt: "Show me FAQs" }
    ],
  }
};

const sunriseCoralTheme = {
  theme: {
    colorScheme: "light",
    color: {
      accent: {
        primary: "#FF6B6B",
        level: 2
      }
    },
    radius: "round",
    density: "normal",
    typography: {
      fontFamily: "'Inter', sans-serif"
    }
  },
  composer: {
    placeholder: 'Ask anything about your data…',
  },
  startScreen: {
    greeting: "Good morning! Ready to chat?",
    prompts: [
      {
        label: 'Check on the status of a ticket',
        prompt: 'Can you help me check on the status of a ticket?',
      }
    ],
  }
};


function App() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const resp = await fetch(`${BACKEND_URL}/api/chatkit/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: "user123" })
        });
        
        const json = await resp.json();
        if (!json.client_secret) {
          throw new Error('Missing client_secret in response');
        }
        return json.client_secret;
      }
    },
    // ...simpleTheme
    //...midnightBlueTheme
    ...sunriseCoralTheme
  });

  return (
   <div
      style={{
        height: "600px",
        width: "400px",
        border: "1px solid #888",
        margin: "auto",
      }}
    >
      {control ? (
        <ChatKit control={control} className="h-full w-full" />
      ) : (
        <div>Loading chat…</div>
      )}
    </div>
  );
}

export default App;
