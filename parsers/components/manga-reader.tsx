"use client";

import { useState } from "react";
import type { Manga } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Home,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { ChaptersSidebar } from "./chapters-sidebar";

interface MangaReaderProps {
  manga: Manga;
  chapter: number;
  pages: Array<{ number: number; image: string }>;
  previousChapter: number | null;
  nextChapter: number | null;
}

export function MangaReader({
  manga,
  chapter,
  pages,
  previousChapter,
  nextChapter,
}: MangaReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const handlePreviousChapter = () => {
    if (previousChapter !== null) {
      window.location.href = `/manga/${manga.id}/chapter/${previousChapter}`;
    }
  };

  const handleNextChapter = () => {
    if (nextChapter !== null) {
      window.location.href = `/manga/${manga.id}/chapter/${nextChapter}`;
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* --- TOP CONTROL BAR --- */}
      {showControls && (
        <div className="bg-card/80 backdrop-blur border-b border-border/50 sticky top-0 z-40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="gap-2"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
              <Link href={`/manga/${manga.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {manga.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Chapter {chapter}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton
                mangaId={manga.id}
                chapterNumber={chapter}
                pageNumber={1}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(false)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN READER AREA --- */}
      <div className="flex flex-1 relative">
        {/* --- SIDEBAR (independent scroll, fixed position) --- */}
        {sidebarOpen && (
          <aside className="w-72 border-r border-border/30 overflow-y-auto fixed left-0 top-[4rem] bottom-0 bg-background z-30">
            <ChaptersSidebar manga={manga} />
          </aside>
        )}

        {/* --- MANGA PAGES (independent scroll) --- */}
        <div
          className={`flex-1 flex flex-col bg-black/50 ${
            sidebarOpen ? "ml-72" : ""
          }`}
        >
          {/* Scrollable Pages Section */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center gap-4 p-4">
            <div className="w-full max-w-2xl space-y-4">
              {pages.map((page) => (
                <div
                  key={page.number}
                  className="relative group rounded-lg overflow-hidden shadow-2xl border border-border/30 hover:border-primary/50 transition-all"
                >
                  <img
                    src={page.image || "/placeholder.svg"}
                    alt={`Page ${page.number}`}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Page {page.number}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- CHAPTER NAVIGATION BAR (sticky bottom) --- */}
          {showControls && (
            <div className="bg-card/80 backdrop-blur border-t border-border/50 p-4 sticky bottom-0">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousChapter}
                  disabled={previousChapter === null}
                  className="gap-2 flex-1 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Card className="px-4 py-2 text-center flex-1 bg-card/50">
                  <p className="text-sm font-medium">Chapter {chapter}</p>
                </Card>

                <Button
                  variant="outline"
                  onClick={handleNextChapter}
                  disabled={nextChapter === null}
                  className="gap-2 flex-1 bg-transparent"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
