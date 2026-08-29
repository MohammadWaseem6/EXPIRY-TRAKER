import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { useAuth } from "../context/AuthContext";
import {
  MessageCircle,
  X,
  Upload,
  Copy,
  Check,
  Bot,
  FileText,
  Image,
} from "lucide-react";

const COLORS = {
  bg: "#0a1a2f",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  active: "#4a9fdb",
};

const AIChatbot = ({ onItemsExtracted }) => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "👋 Upload a delivery note (Image, PDF, or Excel) and I'll extract items for you!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Handle ALL file types ----
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `📤 Uploaded: ${file.name}` },
      { role: "bot", content: "⏳ Processing file..." },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Try backend upload first (PDF, Excel)
      const response = await fetch(`http://127.0.0.1:5001/api/upload/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setExtractedItems(data.items);
        onItemsExtracted?.(data.items);
        const itemList = data.items.map((i, idx) => `${idx + 1}. ${i.name} (${i.category})`).join("\n");
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: `✅ Found ${data.count} items!\n\n${itemList}\n\nClick "Copy to Bulk Add" below.`,
          };
          return newMessages;
        });
        return;
      }

      // If backend fails, try Tesseract (images only)
      if (file.type.startsWith("image/")) {
        await extractWithTesseract(file);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: `❌ Error: ${data.error || "Unsupported file type"}`,
          };
          return newMessages;
        });
      }
    } catch (error) {
      // Fallback to Tesseract for images
      if (file.type.startsWith("image/")) {
        await extractWithTesseract(file);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: "❌ Upload failed. Please try again.",
          };
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  // ---- Tesseract fallback for images ----
  const extractWithTesseract = async (imageFile) => {
    try {
      const result = await Tesseract.recognize(imageFile, "eng");
      const text = result.data.text;
      const lines = text.split("\n").filter((line) => line.trim());
      const items = lines.map((line) => {
        const parts = line.split(/\s{2,}|\t|,/).filter((p) => p.trim());
        return {
          name: parts[0] || "Unknown",
          category: "Uncategorized",
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          quantity: 1,
          price: 0,
        };
      });

      setExtractedItems(items);
      onItemsExtracted?.(items);
      const itemList = items.map((i, idx) => `${idx + 1}. ${i.name}`).join("\n");
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          content: `✅ Found ${items.length} items (OCR)!\n\n${itemList}\n\nClick "Copy to Bulk Add" below.`,
        };
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          content: "❌ Failed to read image. Please try a clearer image.",
        };
        return newMessages;
      });
    }
  };

  const handleCopyToBulk = () => {
    if (extractedItems.length === 0) return;
    const csv = extractedItems
      .map((i) => `${i.name}, ${i.category}, ${i.expiryDate}, ${i.quantity}, ${i.price}`)
      .join("\n");
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMessages((prev) => [
      ...prev,
      { role: "bot", content: "✅ Items copied to clipboard! Go to Bulk Add and paste." },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:scale-105 transition"
        style={{ background: COLORS.active, color: "#fff" }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.panelBorder}`,
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.panelBorder }}>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" style={{ color: COLORS.active }} />
              <span className="font-semibold" style={{ color: COLORS.text }}>AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: COLORS.sub }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-white/10 text-gray-200"
                  }`}
                  style={{
                    background: msg.role === "user" ? COLORS.active : "rgba(255,255,255,0.05)",
                    color: msg.role === "user" ? "#fff" : COLORS.text,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1" />
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150 mr-1" />
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Copy Button */}
          {extractedItems.length > 0 && (
            <div className="px-4 py-2 border-t" style={{ borderColor: COLORS.panelBorder }}>
              <button
                onClick={handleCopyToBulk}
                className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
                style={{ background: COLORS.active, color: "#fff" }}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy to Bulk Add</>}
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t flex gap-2" style={{ borderColor: COLORS.panelBorder }}>
            <input
              type="file"
              accept="image/*,.pdf,.xlsx,.xls,.csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-2"
              style={{ background: COLORS.active, color: "#fff" }}
            >
              <Upload className="w-4 h-4" /> Upload File
            </button>
            <span className="text-xs" style={{ color: COLORS.sub }}>
              (Image, PDF, Excel)
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;