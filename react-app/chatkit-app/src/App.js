import React, { useState, useEffect } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

const BACKEND_URL = "http://localhost:8000";

function App() {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch(`${BACKEND_URL}/api/chatkit/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: "user123" }),
      });

      if (!res.ok) {
        console.error("Failed to get session", await res.text());
        return;
      }
      const response = await res.json();
      setClientSecret(response.client_secret);
    }
    fetchSession();
  }, []);

 // Setup ChatKit
  const { control } = useChatKit({
    api: {
      clientToken: clientSecret ?? "",
      domainKey: "localhost"
    },
    theme: {
      colorScheme: "light",
    },
    startScreen: {
      greeting: "Hello! Ask me anything.",
      prompts: [
        { label: "Help", prompt: "Help me", icon: "circle-question" },
      ],
    },
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
      {clientSecret && control ? (
        <ChatKit control={control} className="h-full w-full" />
      ) : (
        <div>Loading chat…</div>
      )}
    </div>
  );
}

export default App;
