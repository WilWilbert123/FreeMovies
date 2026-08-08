"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, CreditCard, Key, Settings, Users, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I sign up for FreeMovies?",
      answer: "Signing up is easy! Click on the 'Sign Up' button on the homepage, enter your email address, create a password, and follow the simple on-screen instructions to start watching your favorite movies and TV shows."
    },
    {
      question: "Why am I experiencing video buffering?",
      answer: "Buffering is usually related to your internet connection speed. We recommend a minimum download speed of 3.0 Mbps for standard definition and 5.0 Mbps for HD. Try restarting your router or switching to a wired connection."
    },
    {
      question: "How can I change my email or password?",
      answer: "You can update your email or password by navigating to your Account settings (from the profile menu in the top right). From there, select 'Update Email' or 'Update Password'."
    },
    {
      question: "Can I download movies to watch offline?",
      answer: "Yes! If you are using our mobile or tablet apps, look for the 'Download' icon next to a movie or TV show episode to save it for offline viewing."
    },
    {
      question: "How do I cancel my account?",
      answer: "You can cancel your account at any time by going to your Account settings and clicking on the 'Cancel Membership' button. There are no cancellation fees, and you can easily restart your account anytime."
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
          <button className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
            Start Live Chat
          </button>
        </div>
      </div>
    </main>
  );
}
