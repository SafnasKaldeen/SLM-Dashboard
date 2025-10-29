export interface Manga {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  chapters: number
  status: "ongoing" | "completed"
  genre: string[]
  description: string
  views: number
}

export const trendingMangas: Manga[] = [
  {
    id: "1",
    title: "Eternal Echoes",
    author: "Sakura Tanaka",
    cover: "/anime-manga-cover-eternal-echoes.jpg",
    rating: 4.8,
    chapters: 156,
    status: "ongoing",
    genre: ["Action", "Fantasy", "Adventure"],
    description: "A thrilling journey through mystical realms where echoes of the past shape the future.",
    views: 2500000,
  },
  {
    id: "2",
    title: "Neon Hearts",
    author: "Yuki Yamamoto",
    cover: "/anime-manga-cover-neon-hearts-cyberpunk.jpg",
    rating: 4.6,
    chapters: 89,
    status: "ongoing",
    genre: ["Sci-Fi", "Romance", "Cyberpunk"],
    description: "In a neon-lit future, two souls find connection amidst the digital chaos.",
    views: 1800000,
  },
  {
    id: "3",
    title: "Shadow's Requiem",
    author: "Kenji Nakamura",
    cover: "/anime-manga-cover-dark-shadow-mystery.jpg",
    rating: 4.7,
    chapters: 203,
    status: "completed",
    genre: ["Mystery", "Thriller", "Supernatural"],
    description: "A dark tale of secrets, shadows, and the price of truth.",
    views: 3200000,
  },
  {
    id: "4",
    title: "Starlight Academy",
    author: "Hana Suzuki",
    cover: "/anime-manga-cover-school-academy-magic.jpg",
    rating: 4.5,
    chapters: 124,
    status: "ongoing",
    genre: ["School", "Magic", "Comedy"],
    description: "Where young mages learn to harness their powers and discover friendship.",
    views: 1600000,
  },
  {
    id: "5",
    title: "Crimson Tide",
    author: "Riku Sato",
    cover: "/anime-manga-cover-ocean-adventure.jpg",
    rating: 4.9,
    chapters: 178,
    status: "ongoing",
    genre: ["Adventure", "Action", "Fantasy"],
    description: "Epic naval adventures on seas filled with mystery and danger.",
    views: 2900000,
  },
  {
    id: "6",
    title: "Whispered Dreams",
    author: "Aiko Nakamura",
    cover: "/anime-manga-cover-romance-slice-of-life.jpg",
    rating: 4.4,
    chapters: 95,
    status: "ongoing",
    genre: ["Romance", "Slice of Life", "Drama"],
    description: "A gentle story of love, dreams, and the beauty of everyday moments.",
    views: 1400000,
  },
]

export const allGenres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Supernatural",
  "Thriller",
]
