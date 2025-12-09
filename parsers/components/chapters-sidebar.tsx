"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Manga } from "@/lib/mock-data"
import { Lock, ChevronRight } from "lucide-react"
import Link from "next/link"

interface ChaptersSidebarProps {
  manga: Manga
  currentChapter?: number
}

export function ChaptersSidebar({ manga, currentChapter }: ChaptersSidebarProps) {
  const [hasMore, setHasMore] = useState(true)
  const [displayedChapters, setDisplayedChapters] = useState(50)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Generate mock chapters
  const allChapters = Array.from({ length: manga.chapters }, (_, i) => ({
    number: manga.chapters - i,
    title: `Chapter ${manga.chapters - i}`,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    isLocked: i > 5,
  }))

  const chapters = allChapters.slice(0, displayedChapters)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    if (element.scrollHeight - element.scrollTop < 300 && hasMore) {
      if (displayedChapters < manga.chapters) {
        setDisplayedChapters((prev) => Math.min(prev + 25, manga.chapters))
      } else {
        setHasMore(false)
      }
    }
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-card/80 to-card/40 border-r border-border/50 backdrop-blur-md flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-card/60 backdrop-blur">
        <h2 className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Chapters
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{manga.chapters} total chapters</p>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent flex-1"
      >
        <div className="p-3 space-y-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={chapter.isLocked ? "#" : `/manga/${manga.id}/chapter/${chapter.number}`}
              className={chapter.isLocked ? "pointer-events-none" : ""}
            >
              <div
                className={`p-3 rounded-lg transition-all duration-200 group border flex items-center justify-between ${
                  currentChapter === chapter.number
                    ? "bg-primary/20 border-primary/60 shadow-lg shadow-primary/20"
                    : "bg-card/40 border-border/30 hover:bg-card/60 hover:border-primary/40"
                } ${chapter.isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex flex-col gap-0.5 flex-1">
                  <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">{chapter.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {chapter.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {!chapter.isLocked && (
                    <ChevronRight className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Loading indicator */}
        {displayedChapters < manga.chapters && (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Scroll for more...</p>
          </div>
        )}
      </div>
    </aside>
  )
}
