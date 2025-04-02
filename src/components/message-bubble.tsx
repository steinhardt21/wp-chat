"use client"

import { Check, AlertCircle, RefreshCw } from "lucide-react"

interface MessageBubbleProps {
  message: string
  isMe: boolean
  timestamp: string
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  onRetry?: () => void
  image?: string
}

export default function MessageBubble({ message, isMe, timestamp, status = "sent", onRetry, image }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 group`}>
      <div
        className={`relative max-w-[70%] px-3 py-2 rounded-lg ${
          isMe ? "bg-[#d9fdd3] text-black" : "bg-white text-black"
        } ${status === "failed" ? "opacity-70" : ""}`}
      >
        {image && (
          <img 
            src={image} 
            alt="Message attachment" 
            className="rounded-lg max-w-full mb-2"
          />
        )}
        <p className="text-sm">{message}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-500">{timestamp}</span>

          {isMe && (
            <>
              {status === "sending" && (
                <div className="text-gray-400">
                  <div className="h-3 w-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
                </div>
              )}

              {status === "sent" && (
                <div className="text-gray-500">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {status === "delivered" && (
                <div className="text-gray-500 flex">
                  <Check className="h-3 w-3" />
                  <Check className="h-3 w-3 -ml-1" />
                </div>
              )}

              {status === "read" && (
                <div className="text-blue-500 flex">
                  <Check className="h-3 w-3" />
                  <Check className="h-3 w-3 -ml-1" />
                </div>
              )}

              {status === "failed" && (
                <div className="text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3" />
                </div>
              )}
            </>
          )}
        </div>

        {status === "failed" && (
          <button
            onClick={onRetry}
            className="absolute right-0 top-0 -mt-2 -mr-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <RefreshCw className="h-4 w-4 text-red-500" />
            <span className="sr-only">Retry sending message</span>
          </button>
        )}
      </div>
    </div>
  )
}

