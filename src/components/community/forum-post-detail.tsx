"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { ForumPost, ForumReply } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ForumPostDetail({ postId }: { postId: number }) {
  const { user } = useUser();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchReplies();
      incrementViewCount();
      checkFollowStatus();
    }
  }, [postId, user]);

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/community/forum/posts/${postId}/view`, {
        method: 'POST',
      });
      // Note: We don't need to update the local state since the view count
      // will be updated when fetchPost is called, but we could optimize this
      // by updating the local post state directly if needed
    } catch (err) {
      // Silently fail - view counting is not critical
      console.warn('Failed to increment view count:', err);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      // Fixed: Fetch the specific post by ID instead of fetching all posts in category 1
      const response = await fetch(`/api/community/forum/posts/${postId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError('Kon post niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/community/forum/replies?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      
      const data = await response.json();
      setReplies(data.replies);
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  const handleCreateReply = async () => {
    if (!user || !newReply.trim()) return;

    try {
      const response = await fetch('/api/community/forum/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          postId,
          content: newReply
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reply');
      }

      // Reset form and refresh replies
      setNewReply('');
      fetchReplies();
    } catch (err) {
      setError('Kon reactie niet plaatsen');
      console.error(err);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user || !post || !editTitle.trim() || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/community/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: editTitle.trim(),
          content: editContent.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      // Refresh post data and exit edit mode
      await fetchPost();
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Kon post niet bijwerken: ' + (err instanceof Error ? err.message : 'Onbekende fout'));
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setError(null);
  };

  const handleReport = async (reason: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: user.id,
          targetType: 'post',
          targetId: postId,
          reason,
          content: `Post: "${post?.title}"`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      alert('Report verzonden. Moderators zullen dit bekijken.');
    } catch (err) {
      console.error('Error reporting post:', err);
      alert('Er ging iets mis bij het verzenden van de report.');
    }
  };

  const handleReportReply = async (replyId: number, reason: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: user.id,
          targetType: 'reply',
          targetId: replyId,
          reason,
          content: `Reply in post: "${post?.title}"`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      alert('Report verzonden. Moderators zullen dit bekijken.');
    } catch (err) {
      console.error('Error reporting reply:', err);
      alert('Er ging iets mis bij het verzenden van de report.');
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !postId) return;

    try {
      const response = await fetch(`/api/community/follow?userId=${user.id}&targetType=post&targetId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.follows.length > 0);
      } else {
        // Follow functionality not available yet, default to not following
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
      // Default to not following if API fails
      setIsFollowing(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !postId) return;

    setFollowLoading(true);
    try {
      const response = await fetch('/api/community/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetType: 'post',
          targetId: postId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.action === 'followed');
      } else if (response.status === 503) {
        // Follow functionality not available yet
        alert('Follow functionaliteit is nog niet beschikbaar. Probeer het later opnieuw.');
      } else {
        alert('Er ging iets mis. Probeer het opnieuw.');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Er ging iets mis bij het volgen. Probeer het opnieuw.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="py-8 text-center">
          <Lucide.MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Post niet gevonden</h3>
          <p className="text-muted-foreground">De opgevraagde post kon niet worden gevonden.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <Card className="bg-secondary/50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Post titel"
                    className="text-2xl font-bold"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    placeholder="Post inhoud"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm">
                      <Lucide.Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm">
                      <Lucide.X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Lucide.User className="h-4 w-4" />
                      <span>{post.user?.name || 'Anoniem'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lucide.Clock className="h-4 w-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lucide.Eye className="h-4 w-4" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {user && post.userId === user.id && !isEditing && (
                <Button onClick={handleEditPost} variant="outline" size="sm">
                  <Lucide.Edit className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
              )}
              {user && (
                <>
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    variant={isFollowing ? "default" : "outline"}
                    size="sm"
                  >
                    {followLoading ? (
                      <Lucide.Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : isFollowing ? (
                      <Lucide.BookmarkCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <Lucide.Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {isFollowing ? 'Gevolgd' : 'Volgen'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Lucide.MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleReport('spam')}
                        className="text-red-600"
                      >
                        <Lucide.Flag className="h-4 w-4 mr-2" />
                        Report als Spam
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReport('inappropriate')}
                        className="text-red-600"
                      >
                        <Lucide.Flag className="h-4 w-4 mr-2" />
                        Report als Ongepast
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReport('harassment')}
                        className="text-red-600"
                      >
                        <Lucide.Flag className="h-4 w-4 mr-2" />
                        Report als Pesterij
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {!isEditing && (
          <CardContent>
            <div className="prose max-w-none">
              <p>{post.content}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Reacties ({replies.length})
          </h2>
        </div>

        {/* Replies List */}
        <div className="space-y-4">
          {replies.map((reply) => (
            <Card key={reply.id} className="bg-secondary/50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {reply.user?.profilePictureUrl ? (
                    <img 
                      src={reply.user.profilePictureUrl} 
                      alt={reply.user.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lucide.User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{reply.user?.name || 'Anoniem'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString('nl-NL')} om {new Date(reply.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {reply.isSolution && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <Lucide.Check className="h-3 w-3 mr-1" />
                          Oplossing
                        </span>
                      )}
                    </div>
                    <div className="prose max-w-none">
                      <p>{reply.content}</p>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <Button variant="ghost" size="sm">
                        <Lucide.ThumbsUp className="h-4 w-4 mr-1" />
                        Vind ik leuk
                      </Button>
                      {user && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Lucide.MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleReportReply(reply.id, 'spam')}
                              className="text-red-600"
                            >
                              <Lucide.Flag className="h-4 w-4 mr-2" />
                              Report als Spam
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReportReply(reply.id, 'inappropriate')}
                              className="text-red-600"
                            >
                              <Lucide.Flag className="h-4 w-4 mr-2" />
                              Report als Ongepast
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReportReply(reply.id, 'harassment')}
                              className="text-red-600"
                            >
                              <Lucide.Flag className="h-4 w-4 mr-2" />
                              Report als Pesterij
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {user && (
          <Card className="bg-secondary/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Plaats een reactie</h3>
              <Textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={4}
                placeholder="Schrijf je reactie hier..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  onClick={handleCreateReply}
                  disabled={!newReply.trim()}
                >
                  Plaats reactie
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}