"use client"

import { useState } from "react"
import { Search, MoreVertical } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Contact } from "./chat-interface"
import Image from 'next/image'


interface ContactListProps {
  contacts: Contact[]
  activeContactId: number
  onSelectContact: (contactId: number) => void
}

export default function ContactList({ contacts, activeContactId, onSelectContact }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 flex justify-between items-center bg-[#f0f2f5]">
        <Avatar className="h-10 w-10">
          <Image 
            src="/avatar.png" 
            alt="Your profile" 
            width={40} 
            height={40}
          />
        </Avatar>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search or start new chat"
            className="pl-9 bg-[#f0f2f5] rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                activeContactId === contact.id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectContact(contact.id)}
            >
              <Avatar className="h-12 w-12 mr-3">
                <Image 
                  src={contact.avatar || "/placeholder.svg"} 
                  alt={contact.name} 
                  width={40} 
                  height={40}
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={`font-medium truncate ${contact.unread > 0 ? "font-semibold" : ""}`}>
                    {contact.name}
                  </h3>
                  <span
                    className={`text-xs ${contact.unread > 0 ? "text-green-500 font-semibold" : "text-gray-500"} whitespace-nowrap ml-2`}
                  >
                    {contact.time}
                  </span>
                </div>
                {contact.isTyping ? (
                  <div className="text-sm text-green-600 flex items-center">
                    <span>typing</span>
                    <span className="ml-1 flex">
                      <span
                        className="animate-bounce mx-[1px] h-1 w-1 bg-green-600 rounded-full"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="animate-bounce mx-[1px] h-1 w-1 bg-green-600 rounded-full"
                        style={{ animationDelay: "200ms" }}
                      ></span>
                      <span
                        className="animate-bounce mx-[1px] h-1 w-1 bg-green-600 rounded-full"
                        style={{ animationDelay: "400ms" }}
                      ></span>
                    </span>
                  </div>
                ) : (
                  <p className={`text-sm ${contact.unread > 0 ? "text-black font-medium" : "text-gray-600"} truncate`}>
                    {contact.lastMessage}
                  </p>
                )}
              </div>
              {contact.unread > 0 && (
                <div className="ml-2 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

