// ========== FOOTER COMPONENT ==========
import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a1a]">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-black text-lg mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                AnimeFlow
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Your favorite anime platform with a beautiful, modern interface
              designed for the ultimate viewing experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Library
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/donate"
                  className="text-white/60 hover:text-pink-500 transition flex items-center gap-2"
                >
                  <Heart className="w-3 h-3" />
                  Donate
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-white">Follow Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/40">
            © 2025 AnimeFlow. All rights reserved. Made with ❤️ for anime
            lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
