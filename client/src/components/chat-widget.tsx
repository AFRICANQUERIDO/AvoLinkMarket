import { MessageCircle, Send, X, User, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: "Hello! Welcome to AvoTrade. How can I help you with market linkages today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessages = [...messages, { text: inputValue, isUser: true }];
    setMessages(newMessages);
    setInputValue("");

    // Mock reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thank you for your message. An agent will review your enquiry about availability and pricing shortly.", 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white border border-border shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto"
          >
            {/* Chat Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Support Agent</h3>
                  <p className="text-primary-foreground/70 text-xs">Online Now</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-muted/30 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.isUser 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white border border-border text-foreground rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-border flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-grow focus-visible:ring-primary"
              />
              <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90">
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-secondary text-secondary-foreground p-4 rounded-full shadow-lg shadow-secondary/30 flex items-center gap-2 pointer-events-auto"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <span className="font-bold text-sm pr-1">Chat with us</span>}
      </motion.button>
    </div>
  );
}
