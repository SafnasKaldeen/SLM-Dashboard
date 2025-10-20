"use client"

import { useState } from "react"
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Comment } from "@/lib/mock-comments"

interface CommentItemProps {
  comment: Comment
  onReply?: (commentId: string) => void
  level?: number
}

export function CommentItem({ comment, onReply, level = 0 }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [likes, setLikes] = useState(comment.likes)
  const [showReplies, setShowReplies] = useState(level === 0)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const paddingClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : ""

  return (
    <div className={`${paddingClass} space-y-4`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
          <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>

          <p className="text-sm text-foreground mt-2 break-words">{comment.content}</p>

          <div className="flex items-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1 hover:text-primary"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
              <span>{likes}</span>
            </Button>

            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1 hover:text-secondary"
                onClick={() => onReply(comment.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 border-l border-border pl-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </>
            )}
          </Button>

          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
