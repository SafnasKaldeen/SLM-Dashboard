"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentItem } from "@/components/comment-item";
import { mockComments } from "@/lib/mock-comments";
import type { Comment } from "@/lib/mock-comments";

interface CommentsSectionProps {
  mangaId: string;
}

export function CommentsSection({ mangaId }: CommentsSectionProps) {
  const [comments, setComments] = useState(mockComments.comments);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: "You",
      avatar: "/user-avatar.jpg",
      content: newComment,
      timestamp: "just now",
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes - a.likes;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-pink-500" />
        <h2 className="text-2xl font-bold text-white">Community Discussion</h2>
        <span className="text-sm text-white/60 ml-auto">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Input */}
      <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-lg p-4 space-y-3 backdrop-blur-sm">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src="/abstract-user-representation.png" alt="You" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Share your thoughts about this manga..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-20 resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
                className="bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30"
              >
                Clear
              </Button>
              <Button
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-pink-500/20"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort and Filter */}
      <div className="flex items-center justify-between">
        <Tabs
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "newest" | "popular")}
        >
          <TabsList className="grid w-fit grid-cols-2 bg-white/5 border border-white/10 backdrop-blur-sm">
            <TabsTrigger
              value="newest"
              className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/20"
            >
              Newest
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/20"
            >
              Most Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-white/10 pb-6 last:border-b-0"
            >
              <CommentItem
                comment={comment}
                onReply={(commentId) => setReplyingTo(commentId)}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
