"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useFavorites } from "@/hooks/use-favorites"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { trendingMangas } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function LibraryPage() {
  const { favorites, removeFavorite, isLoaded: favLoaded } = useFavorites()
  const { bookmarks, removeBookmark, isLoaded: bookLoaded } = useBookmarks()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !favLoaded || !bookLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Loading your library...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const favoriteMangas = trendingMangas.filter((m) => favorites.includes(m.id))
  const bookmarkedMangas = trendingMangas.filter((m) => bookmarks.some((b) => b.mangaId === m.id))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Library</h1>
          <p className="text-muted-foreground">Manage your favorites and bookmarks</p>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks ({bookmarks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-8">
            {favoriteMangas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteMangas.map((manga) => (
                  <Card key={manga.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/manga/${manga.id}`}>
                      <div className="relative overflow-hidden bg-muted h-64">
                        <img
                          src={manga.cover || "/placeholder.svg"}
                          alt={manga.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/manga/${manga.id}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1 hover:text-primary">{manga.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3">{manga.author}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{manga.rating}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(manga.id)}
                        className="w-full gap-2 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No favorites yet</p>
                <Link href="/">
                  <Button>Explore Manga</Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-8">
            {bookmarkedMangas.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedMangas.map((manga) => {
                  const bookmark = bookmarks.find((b) => b.mangaId === manga.id)
                  return (
                    <Card key={manga.id} className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/manga/${manga.id}`} className="flex-shrink-0">
                          <img
                            src={manga.cover || "/placeholder.svg"}
                            alt={manga.title}
                            className="w-24 h-32 object-cover rounded"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/manga/${manga.id}`}>
                            <h3 className="font-semibold text-lg mb-1 hover:text-primary">{manga.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-2">{manga.author}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="text-sm">{manga.rating}</span>
                            </div>
                            <Badge variant="outline">
                              Chapter {bookmark?.chapterNumber} • Page {bookmark?.pageNumber}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/manga/${manga.id}/chapter/${bookmark?.chapterNumber}`}>
                              <Button size="sm">Continue Reading</Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeBookmark(manga.id)}
                              className="gap-2 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No bookmarks yet</p>
                <Link href="/">
                  <Button>Start Reading</Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
