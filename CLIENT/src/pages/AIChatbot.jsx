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
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "https://smart-store-keeper.onrender.com/api";

const AIChatbot = ({ onItemsExtracted }) => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Upload a delivery note (Image, PDF, or Excel) and I'll extract items for you.",
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Uploaded: ${file.name}` },
      { role: "bot", content: "Processing file..." },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/upload/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (data.success) {
        setExtractedItems(data.items);
        onItemsExtracted?.(data.items);
        const itemList = data.items.map((i, idx) => `${idx + 1}. ${i.name} (${i.category})`).join("\n");
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: `Found ${data.count} items!\n\n${itemList}\n\nClick "Copy to Bulk Add" below.`,
          };
          return newMessages;
        });
        return;
      }

      if (file.type.startsWith("image/")) {
        await extractWithTesseract(file);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: `Error: ${data.error || "Unsupported file type"}`,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (file.type.startsWith("image/")) {
        await extractWithTesseract(file);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: "Upload failed. Please try again.",
          };
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

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
          content: `Found ${items.length} items (OCR)!\n\n${itemList}\n\nClick "Copy to Bulk Add" below.`,
        };
        return newMessages;
      });
    } catch (error) {
      console.error("Tesseract error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          content: "Failed to read image. Please try a clearer image.",
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
      { role: "bot", content: "Items copied to clipboard. Go to Bulk Add and paste." },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 p-3 sm:p-4 rounded-full shadow-lg hover:scale-105 transition duration-200 bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100%-24px)] sm:w-96 h-[70vh] sm:h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-[#0f2540] border border-[#1c3a5e]">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-[#1c3a5e] flex items-center justify-between bg-[#0f2540] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="font-semibold text-sm sm:text-base text-gray-100">AI Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 rounded hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0a1a2f]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm whitespace-pre-wrap ${
                    msg.role === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white/5 text-gray-200"
                  }`}
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
            <div className="px-3 sm:px-4 py-2 border-t border-[#1c3a5e] bg-[#0f2540] flex-shrink-0">
              <button
                onClick={handleCopyToBulk}
                className="w-full py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition hover:opacity-80 bg-blue-500 text-white"
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy to Bulk Add</>
                )}
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-[#1c3a5e] flex flex-col sm:flex-row gap-2 bg-[#0f2540] flex-shrink-0">
            <div className="flex flex-1 gap-2">
              <input
                type="file"
                accept="image/*,.pdf,.xlsx,.xls,.csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-1.5 bg-blue-500 text-white"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Upload
              </button>
            </div>
            <span className="text-[8px] sm:text-xs text-gray-400 text-center sm:text-left">
              Image, PDF, Excel
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;