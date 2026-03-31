"use client"

import { useState, useCallback } from "react"
import { Sparkles, Send, X, Loader2, Bot, User, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "Why was KYC v2 selected?",
  "Why did the simulation fail?",
  "How do I add a fallback provider?",
  "What fields are mandatory?",
]

const mockResponses: Record<string, string> = {
  "Why was KYC v2 selected?":
    "KYC v2 was selected based on your requirements for identity verification. The AI detected that you need document validation and biometric checks, which are only available in v2. Additionally, v2 offers better compliance with recent regulatory requirements and has a 95% confidence match with your stated requirements.",
  "Why did the simulation fail?":
    "The simulation failed due to a connection timeout with the Payment Gateway service. The primary provider (Stripe) was unavailable, and the fallback provider (PayPal) also failed to respond within the 30-second timeout window. I recommend checking your network connectivity and verifying that both provider API keys are correctly configured.",
  "How do I add a fallback provider?":
    "To add a fallback provider, go to the Config Engine and navigate to Step 3 (Generate Config). In the services section, you can click 'Add Fallback' next to any primary service. You'll be prompted to select an alternative provider and configure the failover conditions (timeout threshold, retry count, etc.).",
  "What fields are mandatory?":
    "Based on your current configuration, the mandatory fields are: customer_id, first_name, last_name, email, and document_number. These fields are required for KYC verification and cannot be null. Optional fields include phone, address, and document_type. You can modify field requirements in the Mappings section of the Config Engine.",
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response =
        mockResponses[question] ||
        "I understand you're asking about your integration configuration. Based on the current project settings, I can help you troubleshoot issues, explain AI decisions, or guide you through the configuration process. Could you please provide more specific details about what you'd like to know?"

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    },
    [isLoading]
  )

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(question)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg border-primary/50 bg-background hover:bg-primary hover:text-primary-foreground transition-all z-50"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            AI Assistant
          </SheetTitle>
          <SheetDescription>
            Ask questions about your integration configurations
          </SheetDescription>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  How can I help you?
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Ask me anything about your integration projects, configurations, or simulation results.
                </p>
              </div>

              {/* Suggested Questions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Suggested questions
                  </span>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left text-sm text-foreground bg-muted/50 hover:bg-muted rounded-lg px-4 py-3 transition-colors border border-border"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "user"
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 rounded-lg px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 rounded-lg px-4 py-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(input)
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
