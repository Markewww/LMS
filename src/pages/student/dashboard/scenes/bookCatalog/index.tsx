/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\student\dashboard\scenes\bookCatalog\index.tsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpenIcon, GraduationCapIcon, CompassIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

// Modular Sub-Component Layout Imports
import CatalogToolbar from "./components/CatalogToolbar";
import BookGrid from "./components/BookGrid";
import ResearchGrid from "./components/ResearchGrid";
import HorizontalShelf from "./components/HorizontalShelf";
import FeaturedResearchModal from "./components/FeaturedResearchModal";
import FeaturedBookModal from "./components/FeaturedBookModal";
import ResearchDocumentViewer from "./components/ResearchDocumentViewer";

// Card Modular Separations Imports
import ResearchCard from "./components/ResearchCard";
import BookCard from "./components/BookCard";

// Explicit type-only import syntax rules
import type { Book } from "./components/BookGrid";
import type { ResearchProject } from "./components/ResearchGrid";

const StudentBookCatalog = () => {
  // --- 1. DECLARE ALL REACT HOOKS MANDATORILY AT THE TOP UNCONDITIONALLY ---
  const [activeFullStudy, setActiveFullStudy] = useState<any | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [researches, setResearches] = useState<ResearchProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFeaturedResearchOpen, setIsFeaturedResearchOpen] = useState(false);
  const [isFeaturedBookOpen, setIsFeaturedBookOpen] = useState(false);

  // Core Lifecycle Database Fetch Loop
  useEffect(() => {
    const fetchAllCatalogData = async () => {
      try {
        setLoading(true);
        const [booksRes, researchRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/student/get_books.php`),
          axios.get(`${API_BASE_URL}/admin/get_all_research.php`)
        ]);
        if (Array.isArray(booksRes.data)) setBooks(booksRes.data);
        if (Array.isArray(researchRes.data)) {
          const approved = researchRes.data.filter((r: any) => r.status === "approved");
          setResearches(approved);
        }
      } catch (err) {
        console.error("Concurrence data loading error exception:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCatalogData();
  }, []);

  // Tokenize input search text string into independent cleaned keyword slices
  const searchKeywords = useMemo(() => {
    return searchTerm
      .toLowerCase()
      .split(/[\s,]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
  }, [searchTerm]);

  const isSearching = searchKeywords.length > 0;

  // MULTIPLE-KEYWORD RANKING FILTER ENGINE FOR BOOKS
  const filteredBooks = useMemo(() => {
    return books
      .map((book) => {
        if (!isSearching) return { ...book, matchCount: 0, totalSearched: 0 };
        const searchableBlob = `
          ${book.title || ""}
          ${book.authors || ""}
          ${book.category || ""}
          ${book.qr_data || ""}
          ${book.barcode || ""}
        `.toLowerCase();
        let matchCount = 0;
        searchKeywords.forEach((keyword) => {
          if (searchableBlob.includes(keyword.trim().toLowerCase())) matchCount++;
        });
        return { ...book, matchCount, totalSearched: searchKeywords.length };
      })
      .filter((book) => !isSearching || book.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [books, isSearching, searchKeywords]);

  // MULTIPLE-KEYWORD RANKING FILTER ENGINE FOR RESEARCHES
  const filteredResearches = useMemo(() => {
    return researches
      .map((res) => {
        if (!isSearching) return { ...res, matchCount: 0, totalSearched: 0 };
        const searchableBlob = `
          ${res.title || ""}
          ${res.authors || ""}
          ${res.type || ""}
          ${res.program || ""}
          ${res.abstract || ""}
          ${res.keywords || ""}
          ${res.code || ""}
        `.toLowerCase();
        let matchCount = 0;
        searchKeywords.forEach((keyword) => {
          if (searchableBlob.includes(keyword)) matchCount++;
        });
        return { ...res, matchCount, totalSearched: searchKeywords.length };
      })
      .filter((res) => !isSearching || res.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [researches, isSearching, searchKeywords]);

  // Slices array down to only show the 10 most recent uploads on the dashboard carousel shelf
  const limitedDashboardResearches = useMemo(() => researches.slice(0, 10), [researches]);

  // --- 2. CONDITIONAL VISUAL RENDER OVERLAYS PLACED LOWER DOWN ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 text-left">
        <div className="h-10 bg-gray-100 rounded-xl w-72" />
        <div className="h-48 bg-gray-50 rounded-2xl w-full" />
        <div className="h-64 bg-gray-50 rounded-2xl w-full" />
      </div>
    );
  }

  if (activeFullStudy) {
    return (
      <ResearchDocumentViewer
        research={activeFullStudy}
        onBack={() => setActiveFullStudy(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <CatalogToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {isSearching ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-sm font-montserrat font-black uppercase text-gray-400 tracking-widest mb-4 text-left">
              Book Search Results ({filteredBooks.length})
            </h2>
            <BookGrid books={filteredBooks} />
          </div>
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-sm font-montserrat font-black uppercase text-gray-400 tracking-widest mb-4 text-left">
              Research Search Results ({filteredResearches.length})
            </h2>
            <ResearchGrid
              items={filteredResearches}
              onSelectStudy={(study) => setActiveFullStudy(study)}
            />
          </div>
        </div>
      ) : (
        /* CASE DISCOVER DASHBOARD ACTIVE VIEW */
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* A. BANNER SPOTLIGHT SHELF */}
          <div className="space-y-4 text-left">
            <h2 className="text-2xl font-montserrat font-black text-cvsu-green-dark flex items-center gap-2">
              <CompassIcon size={24} className="text-cvsu-green-base animate-spin-slow" />
              Discover
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-linear-to-br from-cvsu-green-base to-emerald-800 p-6 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-35 group">
                <div className="z-10">
                  <span className="text-[10px] bg-white/20 border border-white/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Featured Material
                  </span>
                  <h3 className="text-lg font-bold font-montserrat mt-2 leading-tight max-w-xs">
                    Explore New Textbook Releases & Course Guides
                  </h3>
                </div>
                <BookOpenIcon size={120} className="absolute -right-4 -bottom-6 text-white/10 group-hover:scale-105 transition-transform duration-300 pointer-events-none" />
              </div>

              <div className="bg-linear-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-35 group">
                <div className="z-10">
                  <span className="text-[10px] bg-white/20 border border-white/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Academic Archive
                  </span>
                  <h3 className="text-lg font-bold font-montserrat mt-2 leading-tight max-w-xs">
                    Access Approved Student Capstones & Manuscripts
                  </h3>
                </div>
                <GraduationCapIcon size={120} className="absolute -right-4 -bottom-6 text-white/10 group-hover:scale-105 transition-transform duration-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* B. HORIZONTAL RESEARCH SHELF CONTAINER */}
          <HorizontalShelf
            title="Research"
            onSeeMoreClick={() => setIsFeaturedResearchOpen(true)}
          >
            {limitedDashboardResearches.map((res) => (
              <ResearchCard 
                key={res.uuid} 
                res={res} 
                onSelect={(study) => setActiveFullStudy(study)} 
              />
            ))}
          </HorizontalShelf>

          {/* C. HORIZONTAL TEXTBOOKS SHELF CONTAINER */}
          <HorizontalShelf 
            title="Textbooks"
            onSeeMoreClick={() => setIsFeaturedBookOpen(true)}
          >
            {books.map((book) => (
              <BookCard key={book.uuid} book={book} />
            ))}
          </HorizontalShelf>
        </div>
      )}

      {/* RENDER INJECTED RESEARCH INDEX MODAL CANVAS */}
      <FeaturedResearchModal
        isOpen={isFeaturedResearchOpen}
        onClose={() => setIsFeaturedResearchOpen(false)}
        items={researches}
        onSelectStudy={(study) => {
          setIsFeaturedResearchOpen(false);
          setActiveFullStudy(study);
        }}
      />

      {/* RENDER INJECTED BOOK INDEX MODAL CANVAS */}
      <FeaturedBookModal
        isOpen={isFeaturedBookOpen}
        onClose={() => setIsFeaturedBookOpen(false)}
        items={books}
      />
    </motion.div>
  );
};

export default StudentBookCatalog;
