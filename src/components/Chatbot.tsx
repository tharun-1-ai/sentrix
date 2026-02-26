import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLangSelected, setChatLangSelected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0 && !chatLangSelected) {
      // Show language selection prompt
      setMessages([{
        role: "assistant",
        content: "Please select your preferred language / உங்கள் மொழியை தேர்ந்தெடுக்கவும் / अपनी भाषा चुनें",
        timestamp: new Date(),
      }]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && chatLangSelected) inputRef.current?.focus();
  }, [open, chatLangSelected]);

  const selectChatLanguage = (lang: "en" | "ta" | "hi") => {
    setLanguage(lang);
    setChatLangSelected(true);
    const welcomeMap = {
      en: "Hello! I'm the Sentrix AI Assistant, specialized in job scam detection and cybersecurity guidance. How can I help you today?",
      ta: "வணக்கம்! நான் Sentrix AI உதவியாளர், வேலை மோசடி கண்டறிதல் மற்றும் சைபர் பாதுகாப்பு வழிகாட்டுதலில் நிபுணத்துவம் பெற்றவர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      hi: "नमस्ते! मैं Sentrix AI सहायक हूं, नौकरी घोटाला पहचान और साइबर सुरक्षा मार्गदर्शन में विशेषज्ञ। आज मैं आपकी कैसे मदद कर सकता हूं?",
    };
    setMessages([
      { role: "assistant", content: "Please select your preferred language / உங்கள் மொழியை தேர்ந்தெடுக்கவும் / अपनी भाषा चुनें", timestamp: new Date() },
      { role: "user", content: lang === "en" ? "English" : lang === "ta" ? "தமிழ்" : "हिंदी", timestamp: new Date() },
      { role: "assistant", content: welcomeMap[lang], timestamp: new Date() },
    ]);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sentrix-chat", {
        body: { message: text.trim(), language, history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data?.reply || "I apologize, I couldn't process that request.", timestamp: new Date() }]);
    } catch {
      const errorMap = {
        en: "Sorry, I couldn't process your request. Please try again.",
        ta: "மன்னிக்கவும், கோரிக்கையை செயலாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        hi: "क्षमा करें, आपका अनुरोध संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।",
      };
      setMessages(prev => [...prev, { role: "assistant", content: errorMap[language], timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, language, messages]);

  const chips = [t("chip1"), t("chip2"), t("chip3"), t("chip4"), t("chip5")];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)" }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-card border rounded-xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-xl">
            <Shield className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t("chatbotTitle")}</p>
              <p className="text-[10px] opacity-80">{t("chatbotSubtitle")}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-primary-foreground/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-[9px] mt-1 ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Language selection buttons (before chat starts) */}
          {!chatLangSelected && messages.length > 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2 justify-center">
              <button onClick={() => selectChatLanguage("en")}
                className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                English
              </button>
              <button onClick={() => selectChatLanguage("ta")}
                className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                தமிழ்
              </button>
              <button onClick={() => selectChatLanguage("hi")}
                className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                हिंदी
              </button>
            </div>
          )}

          {/* Quick chips */}
          {chatLangSelected && messages.length <= 3 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {chips.map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 text-foreground transition-colors">
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[9px] text-center text-muted-foreground px-3 pb-1">{t("chatbotDisclaimer")}</p>

          {/* Input */}
          {chatLangSelected && (
            <div className="border-t p-2 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder={t("typeMessage")}
                className="flex-1 bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
