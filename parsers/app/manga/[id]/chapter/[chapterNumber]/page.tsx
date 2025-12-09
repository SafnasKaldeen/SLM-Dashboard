import { trendingMangas } from "@/lib/mock-data"
import { MangaReader } from "@/components/manga-reader"
import { Header } from "@/components/header"
import { notFound } from "next/navigation"

interface ChapterPageProps {
  params: {
    id: string
    chapterNumber: string
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const manga = trendingMangas.find((m) => m.id === params.id)
  const chapterNum = Number.parseInt(params.chapterNumber)

  if (!manga || chapterNum < 1 || chapterNum > manga.chapters) {
    notFound()
  }

  // Generate mock pages for the chapter (20 pages per chapter)
  const pages = Array.from({ length: 20 }, (_, i) => ({
    number: i + 1,
    image: `/placeholder.svg?height=800&width=600&query=manga chapter ${chapterNum} page ${i + 1}`,
  }))

  const previousChapter = chapterNum > 1 ? chapterNum - 1 : null
  const nextChapter = chapterNum < manga.chapters ? chapterNum + 1 : null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MangaReader
        manga={manga}
        chapter={chapterNum}
        pages={pages}
        previousChapter={previousChapter}
        nextChapter={nextChapter}
      />
    </div>
  )
}
