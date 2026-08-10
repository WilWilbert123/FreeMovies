"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { PlusCircle } from "lucide-react";
import ShinyText from "@/components/ShinyText/ShinyText";
import ShinyImage from "@/components/ShinyText/ShinyImage";

export default function ProfilesPage() {
  const router = useRouter();
  const supabase = createClient();
  const { profiles, fetchProfiles, setActiveProfile } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      await fetchProfiles();
      setLoading(false);
    };
    init();
  }, [router, supabase, fetchProfiles]);

  const handleSelectProfile = (profile: any) => {
    setActiveProfile(profile);
    router.push("/");
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setIsAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('viewing_profiles').insert({
        user_id: user.id,
        name: newProfileName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfileName}-${Date.now()}`
      });

      if (!error) {
        await fetchProfiles();
        setShowAddModal(false);
        setNewProfileName("");
      } else {
        alert("Failed to create profile: " + error.message);
      }
    }
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
      <div className="absolute top-4 md:top-8 left-4 md:left-12 cursor-pointer z-50 flex items-center gap-1 group" onClick={() => router.push('/')}>
        <ShinyImage 
          src="/logofm2.png" 
          alt="FiliFlix Logo" 
          className="h-10 md:h-12 w-auto cursor-pointer z-50 relative group-hover:scale-105 transition-transform duration-300" 
          speed={1.5} 
          delay={1.5} 
          offset={0} 
          direction="left" 
          shineColor="#ffffff" 
          spread={120} 
        />
        <ShinyText 
          text="ILIFLIX" 
          speed={1.5}
          delay={1.5}
          offset={1.5}
          direction="left"
          className="text-4xl md:text-5xl font-bold tracking-wider relative font-bebas" 
          color="#e50914" 
          shineColor="#ffffff" 
          spread={120} 
        />
      </div>

      <div className="max-w-4xl w-full px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-medium mb-8 text-center">Who's watching?</h1>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => handleSelectProfile(profile)}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all mb-4 bg-gray-800">
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">{profile.name}</span>
            </div>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <div 
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-md border-2 border-transparent group-hover:bg-white/10 transition-all mb-4 flex items-center justify-center">
                <PlusCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors">Add Profile</span>
            </div>
          )}
        </div>

        <button className="border border-gray-500 text-gray-500 px-6 py-2 uppercase tracking-widest text-sm hover:text-white hover:border-white transition-colors">
          Manage Profiles
        </button>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#141414] p-8 rounded-md w-full max-w-lg border border-gray-800">
            <h2 className="text-3xl font-medium mb-6">Add Profile</h2>
            <p className="text-gray-400 mb-6">Add a profile for another person watching FiliFlix.</p>
            
            <form onSubmit={handleAddProfile}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-24 h-24 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfileName || 'default'}`} className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="bg-[#333] text-white px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                  maxLength={15}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={isAdding || !newProfileName.trim()}
                  className="bg-white text-black px-6 py-2 font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                  {isAdding ? "Saving..." : "Continue"}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProfileName("");
                  }}
                  className="border border-gray-500 text-gray-400 px-6 py-2 hover:border-white hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
