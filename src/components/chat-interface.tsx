"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Mic, MoreVertical, Phone, Video } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ContactList from "./contact-list"
import MessageBubble from "./message-bubble"
import { useMobile } from "@/hooks/use-mobile"
import Image from 'next/image'

// Update the interface definitions to match the API response
interface ApiMessage {
  id: number
  created_at: string
  id_chat: string
  message: string
  isUser: boolean
}

interface ApiChat {
  data: ApiMessage[]
  name: string
  wa_id: string
}

// Update the Message interface to match our needs
interface Message {
  id: number
  text: string
  sender: "me" | "them"
  timestamp: string
  status: "sending" | "sent" | "delivered" | "read" | "failed"
}

export interface Contact {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
  isTyping: boolean
  avatar: string
  status: "online" | "offline" | "away"
  messages: Message[]
  wa_id: string // Add WhatsApp ID
}

// Mock data for contacts and their messages
const mockContacts: Contact[] = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Perfect! I'll make a reservation.",
    time: "09:51",
    unread: 0,
    isTyping: false,
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
    status: "online",
    messages: [
      { id: 1, text: "Hey there! How are you?", sender: "them", timestamp: "09:41", status: "read" },
      { id: 2, text: "I'm good, thanks! How about you?", sender: "me", timestamp: "09:42", status: "read" },
      {
        id: 3,
        text: "Doing well. Did you check out that new restaurant downtown?",
        sender: "them",
        timestamp: "09:45",
        status: "read",
      },
      {
        id: 4,
        text: "Not yet, but I heard it's amazing. Want to go this weekend?",
        sender: "me",
        timestamp: "09:47",
        status: "read",
      },
      {
        id: 5,
        text: "Sounds great! Let's plan for Saturday evening.",
        sender: "them",
        timestamp: "09:50",
        status: "read",
      },
      { id: 6, text: "Perfect! I'll make a reservation.", sender: "me", timestamp: "09:51", status: "read" },
    ],
    wa_id: "1234567890",
  },
  {
    id: 2,
    name: "Jane Smith",
    lastMessage: "See you tomorrow!",
    time: "09:30",
    unread: 2,
    isTyping: false,
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
    status: "online",
    messages: [
      { id: 1, text: "Hi Jane, are we still meeting tomorrow?", sender: "me", timestamp: "09:25", status: "read" },
      { id: 2, text: "Yes, at the coffee shop at 10 AM", sender: "them", timestamp: "09:27", status: "read" },
      { id: 3, text: "Great! Looking forward to it", sender: "me", timestamp: "09:28", status: "read" },
      { id: 4, text: "See you tomorrow!", sender: "them", timestamp: "09:30", status: "read" },
    ],
    wa_id: "0987654321",
  },
  {
    id: 3,
    name: "Alex Johnson",
    lastMessage: "Thanks for the info",
    time: "Yesterday",
    unread: 0,
    isTyping: false,
    avatar: "/placeholder.svg?height=40&width=40&text=AJ",
    status: "away",
    messages: [
      {
        id: 1,
        text: "Hey Alex, here's the document you asked for",
        sender: "me",
        timestamp: "Yesterday",
        status: "read",
      },
      { id: 2, text: "Thanks for the info", sender: "them", timestamp: "Yesterday", status: "read" },
    ],
    wa_id: "1122334455",
  },
  {
    id: 4,
    name: "Sarah Williams",
    lastMessage: "Can you send me the document?",
    time: "Yesterday",
    unread: 1,
    isTyping: false,
    avatar: "/placeholder.svg?height=40&width=40&text=SW",
    status: "offline",
    messages: [
      { id: 1, text: "Hi there, how's the project going?", sender: "them", timestamp: "Yesterday", status: "read" },
      { id: 2, text: "It's going well, almost finished", sender: "me", timestamp: "Yesterday", status: "read" },
      { id: 3, text: "Can you send me the document?", sender: "them", timestamp: "Yesterday", status: "read" },
    ],
    wa_id: "6677889900",
  },
  {
    id: 5,
    name: "Mike Brown",
    lastMessage: "Let's catch up soon",
    time: "Monday",
    unread: 0,
    isTyping: false,
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
    status: "online",
    messages: [
      { id: 1, text: "Hey Mike, long time no see", sender: "me", timestamp: "Monday", status: "read" },
      { id: 2, text: "Yeah, it's been a while!", sender: "them", timestamp: "Monday", status: "read" },
      { id: 3, text: "Let's catch up soon", sender: "them", timestamp: "Monday", status: "read" },
    ],
    wa_id: "5544332211",
  },
]

export default function ChatInterface() {
  // Replace the useState initialization with an empty array and add a loading state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeContactId, setActiveContactId] = useState<number>(1) // Default to first contact
  const [newMessage, setNewMessage] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = useMobile()
  const [messageIdCounter, setMessageIdCounter] = useState(100) // Start from a high number to avoid conflicts
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get the active contact
  const activeContact = contacts.find((contact) => contact.id === activeContactId)

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (activeContact?.messages && !isScrolledUp) {
      scrollToBottom()
    }
  }, [activeContact?.messages, isScrolledUp])

  // Function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    }, 100) // Small delay to ensure DOM is updated
  }

  // Handle scroll events to detect when user scrolls up
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    // If we're more than 100px from the bottom, consider it "scrolled up"
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsScrolledUp(!isAtBottom)
  }

  // Add useEffect to fetch data when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://n8n.braiiin.com/webhook/f7643c48-da32-44e3-93b4-f483892ec9ae")
        const data = await response.json()

        if (data && data.length > 0 && data[0].chats) {
          const apiChats = data[0].chats

          // Transform API data to our Contact format
          const transformedContacts: Contact[] = apiChats
            .filter((chat: ApiChat) => chat.name && chat.data && chat.data.length > 0 && chat.data[0].id) // Filter out empty chats
            .map((chat: ApiChat, index: number) => {
              // Transform messages
              const messages: Message[] = chat.data
                .filter((msg: ApiMessage) => msg.id) // Filter out empty messages
                .map((msg: ApiMessage) => ({
                  id: msg.id,
                  text: msg.message || "",
                  sender: msg.isUser ? "me" : "them",
                  timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  status: "read", // Default status for existing messages
                }))

              // Get the last message for the contact preview
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

              return {
                id: index + 1,
                name: chat.name || `Contact ${index + 1}`,
                lastMessage: lastMessage ? lastMessage.text : "",
                time: lastMessage
                  ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "",
                unread: 0,
                isTyping: false,
                avatar: `/avatar.png`,
                status: "online", // Default status
                messages: messages,
                wa_id: chat.wa_id || "",
              }
            })

          if (transformedContacts.length > 0) {
            setContacts(transformedContacts)

            // Set active contact to the first one with messages
            const contactWithMessages = transformedContacts.find((c) => c.messages.length > 0)
            if (contactWithMessages) {
              setActiveContactId(contactWithMessages.id)
            }
          } else {
            // If no valid contacts were found, fall back to mock data
            console.log("No valid contacts found in API response, using mock data")
            setContacts(mockContacts)
            setActiveContactId(1)
          }
        } else {
          // If the API response is invalid, fall back to mock data
          console.log("Invalid API response, using mock data")
          setContacts(mockContacts)
          setActiveContactId(1)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        // Fallback to mock data if fetch fails
        setContacts(mockContacts)
        setActiveContactId(1)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Update the handleSendMessage function to send messages to the webhook
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !activeContact) return

    const messageId = messageIdCounter
    setMessageIdCounter((prev) => prev + 1)

    const currentTime = new Date()
    const isoTimestamp = currentTime.toISOString()
    const displayTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Create new message with 'sending' status
    const newMsg: Message = {
      id: messageId,
      text: newMessage,
      sender: "me",
      timestamp: displayTime,
      status: "sending",
    }

    // Optimistically add message to UI
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === activeContactId
          ? {
              ...contact,
              messages: [...contact.messages, newMsg],
              lastMessage: newMessage,
              time: displayTime,
            }
          : contact,
      ),
    )

    setNewMessage("")
    scrollToBottom()

    // Send message to webhook
    try {
      const messageData = {
        message: newMessage,
        chat_id: activeContact.id,
        wa_id: activeContact.wa_id,
        timestamp: isoTimestamp,
      }

      const response = await fetch("https://n8n.braiiin.com/webhook/42cb2380-d5a3-4649-85b1-3c809396efb6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      if (response.ok) {
        // Update message status to sent
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === activeContactId
              ? {
                  ...contact,
                  messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg)),
                }
              : contact,
          ),
        )

        // Then simulate delivered and read states for better UX
        setTimeout(() => {
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.id === activeContactId
                ? {
                    ...contact,
                    messages: contact.messages.map((msg) =>
                      msg.id === messageId ? { ...msg, status: "delivered" } : msg,
                    ),
                  }
                : contact,
            ),
          )
        }, 1000)

        setTimeout(() => {
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.id === activeContactId
                ? {
                    ...contact,
                    messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "read" } : msg)),
                  }
                : contact,
            ),
          )
        }, 1000)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Update message status to failed
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === activeContactId
            ? {
                ...contact,
                messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "failed" } : msg)),
              }
            : contact,
        ),
      )
    } finally {
      // Scroll to bottom regardless of success or failure
      scrollToBottom()
    }
  }

  // Update the retry function to also use the API
  const handleRetryMessage = async (messageId: number) => {
    if (!activeContact) return

    // Get the failed message
    const failedMessage = activeContact.messages.find((msg) => msg.id === messageId)
    if (!failedMessage) return

    // Update message status to sending
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === activeContactId
          ? {
              ...contact,
              messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "sending" } : msg)),
            }
          : contact,
      ),
    )

    // Send message to webhook
    try {
      const currentTime = new Date()
      const isoTimestamp = currentTime.toISOString()

      const messageData = {
        message: failedMessage.text,
        chat_id: activeContact.id,
        wa_id: activeContact.wa_id,
        timestamp: isoTimestamp,
      }

      const response = await fetch("https://n8n.braiiin.com/webhook/42cb2380-d5a3-4649-85b1-3c809396efb6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      if (response.ok) {
        // Update message status to sent
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === activeContactId
              ? {
                  ...contact,
                  messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "sent" } : msg)),
                }
              : contact,
          ),
        )

        // Then simulate delivered and read states for better UX
        setTimeout(() => {
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.id === activeContactId
                ? {
                    ...contact,
                    messages: contact.messages.map((msg) =>
                      msg.id === messageId ? { ...msg, status: "delivered" } : msg,
                    ),
                  }
                : contact,
            ),
          )

          setTimeout(() => {
            setContacts((prevContacts) =>
              prevContacts.map((contact) =>
                contact.id === activeContactId
                  ? {
                      ...contact,
                      messages: contact.messages.map((msg) =>
                        msg.id === messageId ? { ...msg, status: "read" } : msg,
                      ),
                    }
                  : contact,
              ),
            )
          }, 1000)
        }, 1000)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Update message status to failed
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === activeContactId
            ? {
                ...contact,
                messages: contact.messages.map((msg) => (msg.id === messageId ? { ...msg, status: "failed" } : msg)),
              }
            : contact,
        ),
      )
    } finally {
      // Scroll to bottom regardless of success or failure
      scrollToBottom()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle contact selection
  const handleSelectContact = (contactId: number) => {
    setActiveContactId(contactId)

    // Mark unread messages as read
    setContacts((prevContacts) =>
      prevContacts.map((contact) => (contact.id === contactId ? { ...contact, unread: 0 } : contact)),
    )

    // Close sidebar on mobile
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      )}
      {/* Sidebar - Contact List */}
      {(showSidebar || !isMobile) && (
        <div className={`${isMobile ? "absolute z-10 w-full" : "w-1/3 max-w-sm"} h-full border-r bg-white`}>
          <ContactList contacts={contacts} activeContactId={activeContactId} onSelectContact={handleSelectContact} />
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex flex-col h-full ${isMobile && showSidebar ? "hidden" : "flex-1"}`}>
        {/* Chat Header */}
        {activeContact ? (
          <div className="flex items-center justify-between p-3 border-b bg-[#f0f2f5]">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="mr-1">
                  <span className="sr-only">Back</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
              )}
              <Avatar className="h-10 w-10">
                <Image 
                  src={activeContact.avatar || "/placeholder.svg"} 
                  alt={activeContact.name}
                  width={40}
                  height={40}
                />
              </Avatar>
              <div>
                <h2 className="font-semibold">{activeContact.name}</h2>
                <p className="text-xs text-gray-500">
                  {activeContact.status === "online"
                    ? "Online"
                    : activeContact.status === "away"
                      ? "Away"
                      : "Last seen recently"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
                <span className="sr-only">Call</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
                <span className="sr-only">Video call</span>
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border-b bg-[#f0f2f5]">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="mr-1">
                  <span className="sr-only">Back</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
              )}
              <div>
                <h2 className="font-semibold">WhatsApp Chat</h2>
                <p className="text-xs text-gray-500">Select a contact to start chatting</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          className="flex-1 p-4 bg-[#e4ddd6] relative overflow-y-auto"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {activeContact ? (
            <div className="flex flex-col gap-2">
              {activeContact.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.text}
                  isMe={message.sender === "me"}
                  timestamp={message.timestamp}
                  status={message.status}
                  onRetry={message.status === "failed" ? () => handleRetryMessage(message.id) : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-800">Welcome to WhatsApp</h3>
                <p className="text-gray-600 mt-2">Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
        {isScrolledUp && activeContact && activeContact.messages.length > 10 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-6 bg-gray-200 hover:bg-gray-300 rounded-full p-3 shadow-md z-10 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span className="sr-only">Scroll to bottom</span>
          </button>
        )}

        {/* Typing Indicator */}
        {activeContact?.isTyping && (
          <div className="px-4 py-1">
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 max-w-[70%]">
              <div className="flex space-x-1">
                <div
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
                <div
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-3 border-t bg-[#f0f2f5] flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 rounded-full bg-white"
            disabled={!activeContact}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === "" || !activeContact}
          >
            {newMessage.trim() === "" ? (
              <Mic className="h-5 w-5 text-gray-600" />
            ) : (
              <Send className="h-5 w-5 text-gray-600" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

