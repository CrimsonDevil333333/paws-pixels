"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Sun, Moon } from "lucide-react";

function AnimalCard({ animal, isDarkMode, isFavorited, toggleFavorite }: any) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !animal.image || animal.image.trim() === "") return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`rounded-2xl overflow-hidden shadow-md cursor-pointer group transition-colors ${
        isDarkMode ? "bg-slate-800" : "bg-white"
      }`}
    >
      <div className={`${isDarkMode ? animal.darkColor : animal.color} h-64 overflow-hidden`}>
        <img
          src={animal.image}
          alt={animal.name}
          onError={() => {
            console.log("Blocking broken image:", animal.image);
            setHasError(true);
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4 flex justify-between items-center">
        <span className={`font-semibold truncate pr-2 ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
          {animal.name}
        </span>
        <motion.button
          whileTap={{ scale: 1.5 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(animal);
          }}
          className={`transition-colors text-2xl flex-shrink-0 ${
            isFavorited ? "text-pink-500" : isDarkMode ? "text-slate-600" : "text-pink-100"
          } hover:text-pink-400`}
        >
          <Heart size={24} fill={isFavorited ? "currentColor" : "none"} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"discover" | "favorites">("discover");

  // Persist Favorites
  useEffect(() => {
    const saved = localStorage.getItem("paws_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("paws_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (animal: any) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === animal.id);
      if (exists) return prev.filter((f) => f.id !== animal.id);
      return [...prev, animal];
    });
  };

  const performFetch = async (query: string) => {
    setViewMode("discover");
    setIsLoading(true);
    try {
      const q = query.trim() || "cute animals";
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&t=${Date.now()}`);
      const data = await res.json();
      setResults(data.results || []);
      
      if (query.trim()) {
        const params = new URLSearchParams();
        params.set("q", q);
        router.push(`?${params.toString()}`, { scroll: false });
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performFetch(search);
  }, []);

  const displayResults = useMemo(() => {
    if (viewMode === "favorites") return favorites;
    return results;
  }, [viewMode, results, favorites]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#0f172a] text-slate-200" : "bg-[#fdf6f0] text-gray-800"}`}>
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center space-x-2" onClick={() => { setViewMode("discover"); setSearch(""); performFetch(""); }} style={{ cursor: 'pointer' }}>
          <span className="text-3xl">🐾</span>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>Paws & Pixels</h1>
        </div>
        <nav className={`hidden md:flex space-x-8 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          <button onClick={() => { setViewMode("discover"); setSearch(""); performFetch(""); }} className={`transition-colors ${viewMode === 'discover' ? 'text-pink-500' : 'hover:text-pink-500'}`}>Discover</button>
          <button onClick={() => setViewMode("favorites")} className={`transition-colors ${viewMode === 'favorites' ? 'text-pink-500' : 'hover:text-pink-500'}`}>
            My Favorites ({favorites.length})
          </button>
        </nav>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-pink-100 text-pink-600'}`}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setViewMode("favorites")} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-pink-600 transition-all active:scale-95">
            {viewMode === 'favorites' ? 'Viewing Likes' : 'My Favorites'}
          </button>
        </div>
      </header>

      <section className="max-w-4xl mx-auto text-center py-16 px-4">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold mb-6">
          {viewMode === 'favorites' ? 'Your favorite ' : 'Find your daily dose of '} <span className="text-pink-500">{viewMode === 'favorites' ? 'fluff.' : 'cute.'}</span>
        </motion.h2>

        {viewMode === 'discover' && (
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for kittens, puppies, or baby capybaras..."
              className={`w-full py-4 px-6 rounded-full border-2 focus:outline-none focus:border-pink-500 shadow-xl text-lg backdrop-blur-md transition-all ${
                isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white/70 border-pink-200 text-gray-800 placeholder-gray-400'
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performFetch(search)}
            />
            <button onClick={() => performFetch(search)} className="absolute right-2 top-2 bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-all active:scale-90 shadow-md">
              {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Search size={24} /></motion.div> : <Search size={24} />}
            </button>
          </div>
        )}

        {isLoading && <div className="mt-4 text-pink-500 font-semibold animate-pulse">Refreshing the cute feed... 🔄</div>}

        {viewMode === 'discover' && (
          <div className="mt-6 flex justify-center flex-wrap gap-2">
            {["#Kittens", "#Puppies", "#Capybara", "#RedPanda"].map((tag) => (
              <span key={tag} onClick={() => { const q = tag.replace("#", ""); setSearch(q); performFetch(q); }} className={`px-4 py-1 rounded-full text-sm border transition-all shadow-sm active:scale-95 cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-pink-400 hover:bg-slate-700' : 'bg-white border-pink-100 text-pink-500 hover:bg-pink-50'}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {displayResults.map((animal) => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                isDarkMode={isDarkMode} 
                isFavorited={!!favorites.find(f => f.id === animal.id)} 
                toggleFavorite={toggleFavorite} 
              />
            ))}
          </AnimatePresence>
        </div>
        {displayResults.length === 0 && !isLoading && (
          <p className="text-center text-slate-500 mt-10 text-xl">
            {viewMode === 'favorites' ? "You haven't liked any animals yet! 😿" : "No fluff found. Try another search! 🐾"}
          </p>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
