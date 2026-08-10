"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, CreditCard, Key, Settings, Users, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import LiveChat from "@/components/LiveChat";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is FiliFlix really free?",
      answer: "Yes! FiliFlix is 100% free. You do not need to enter a credit card or pay any subscription fees to enjoy our massive library of movies and TV shows."
    },
    {
      question: "Do I need to create an account?",
      answer: "Creating an account is optional but highly recommended. With an account, you can create multiple profiles, save your favorite movies and shows to your list, and pick up watching where you left off."
    },
    {
      question: "How do I add a movie to my list?",
      answer: "When browsing movies or viewing a movie's details, look for the '+' or 'Add to List' button. Clicking this will save the title to 'My List' for easy access later."
    },
    {
      question: "Can I download movies to watch offline?",
      answer: "Currently, FiliFlix only supports online streaming. You will need an active internet connection to watch our content, as we do not offer a download feature for offline viewing at this time."
    },
    {
      question: "Why won't the video player load for me?",
      answer: "If the video player is stuck loading or shows an error, it may be due to a strict Ad Blocker or browser privacy extension blocking the video source. Try temporarily disabling your ad blocker for our site and reloading the page."
    },
    {
      question: "Can I download movies to watch offline?",
      answer: "Currently, FreeMovies only supports online streaming. You will need an active internet connection to watch our content, as we do not offer a download feature for offline viewing at this time."
    },
    {
      question: "How often are new movies and shows added?",
      answer: "Our catalog is automatically updated daily! We constantly pull the latest trending movies, top-rated hits, and newly released TV shows so there is always something fresh to discover."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-netflix-dark text-white pb-20">
      <Navbar />

      {/* Hero Search Section */}
      <div className="pt-32 pb-16 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-netflix-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Hi, how can we help?</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search for answers or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black pl-14 pr-4 py-4 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red text-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-12">
        {/* Popular Articles / Search Results */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery ? "Search Results" : "Popular Articles"}
          </h2>

          <div className="bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-800 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-gray-900 transition-colors focus:outline-none"
                  >
                    <span className="font-medium text-lg text-gray-200">{faq.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed bg-gray-900/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-gray-400">
                No articles found matching "{searchQuery}". Try adjusting your search terms.
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-gray-900 to-[#141414] border border-gray-800 rounded-lg p-8 text-center flex flex-col items-center justify-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Still need help?</h2>
          <p className="text-gray-400 mb-6 max-w-lg">
            If you couldn't find the answer to your question in our articles, our support team is available 24/7 to assist you.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
            className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
          >
            Start Live Chat
          </button>
        </div>
      </div>
      <LiveChat />
    </main>
  );
}
