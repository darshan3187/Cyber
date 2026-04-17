import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Image as ImageIcon, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, Target } from 'lucide-react';
import { classifyThreat } from '../utils/anthropic';

const TAGS = ['Phishing', 'Malware', 'Social Engineering', 'Awareness Tip', 'News'];

const CommunityFeedPage = () => {
  const { posts, addPost, addXp, unlockBadge } = useApp();
  const [newPostText, setNewPostText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Local state for interactions to avoid full app re-renders on simple likes
  const [likedPosts, setLikedPosts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const handlePost = async () => {
    if (!newPostText.trim() || !selectedTag) return;
    
    setIsPosting(true);
    let verified = false;
    
    try {
      // In real scenario, only run AI verify if it's a threat tag
      if (['Phishing', 'Malware', 'Social Engineering'].includes(selectedTag)) {
        const result = await classifyThreat(newPostText, 'text');
        verified = result.category === selectedTag;
      }
      
      const newPost = {
        id: Date.now(),
        author: 'You',
        initials: 'YO',
        text: newPostText,
        tag: selectedTag,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        verified
      };
      
      addPost(newPost);
      addXp(5, 'Posted to Community');
      
      // Check for Community Hero badge
      const yourPosts = posts.filter(p => p.author === 'You').length + 1;
      if (yourPosts === 3) unlockBadge('community_hero', 'Community Hero (3 Posts)');
      
      setNewPostText('');
      setSelectedTag('');
    } catch (e) {
      alert("Error posting: " + e.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (id) => {
    if (!likedPosts[id]) {
      setLikedPosts(prev => ({ ...prev, [id]: true }));
      addXp(1, 'Engaged with Community');
    } else {
      setLikedPosts(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const trendingPosts = [...posts].sort((a,b) => b.likes - a.likes).slice(0, 3);
  const activeUsers = Math.floor(Math.random() * 50) + 124;

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      <div className="flex-grow space-y-6 lg:max-w-3xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
          <p className="text-secondary-color mt-1">Share intelligence and learn from real threats spotted by others.</p>
        </div>

        {/* Compose Post */}
        <div className="surface-card p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
              YO
            </div>
            <div className="flex-grow">
              <textarea
                className="w-full bg-[var(--bg-color)] border border-soft rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 resize-none min-h-[100px]"
                placeholder="Share a threat you found or an awareness tip..."
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
              />
              
              <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-secondary-color hover:text-[var(--color-primary)] transition-colors">
                    <ImageIcon size={20} />
                    <span className="text-sm font-medium">Add Image</span>
                  </button>
                  
                  <div className="h-6 w-px bg-[var(--border-color)]"></div>
                  
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors border ${
                          selectedTag === tag 
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                            : 'bg-transparent text-secondary-color border-transparent hover:border-soft'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={handlePost} 
                  disabled={isPosting || !newPostText.trim() || !selectedTag}
                  className="btn btn-primary px-8"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map(post => {
            const isLiked = likedPosts[post.id];
            const isExpanded = expandedComments[post.id];
            
            return (
              <div key={post.id} className="surface-card p-6 animate-slideUpFade">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                      {post.initials}
                    </div>
                    <div>
                      <h4 className="font-bold flex items-center gap-1">
                        {post.author}
                      </h4>
                      <div className="text-xs text-secondary-color flex items-center gap-2">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      post.tag === 'Phishing' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      post.tag === 'Malware' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      post.tag === 'Social Engineering' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {post.tag}
                    </span>
                    {post.verified && (
                      <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                        <ShieldCheck size={14} /> AI Verified Threat
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-[var(--text-primary)] leading-relaxed mb-6">
                  {post.text}
                </p>
                
                <div className="flex border-t border-soft pt-4 gap-6 text-secondary-color">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                  >
                    <Heart size={20} className={isLiked ? 'fill-red-500 animate-bounce' : 'group-hover:fill-red-400/20'} />
                    <span className="font-medium text-sm">{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span className="font-medium text-sm">{post.comments}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 hover:text-indigo-400 transition-colors ml-auto">
                    <Share2 size={20} />
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-soft/50 animate-slideUpFade">
                    <div className="bg-[var(--bg-color)] rounded-xl p-4 flex items-center justify-center text-sm text-secondary-color italic">
                      Comments are disabled in this demo.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Trending */}
      <div className="lg:w-80 flex-shrink-0 space-y-6">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-indigo-400 mb-6 border-b border-soft pb-4">
            <Target size={20} />
            <h3 className="font-bold">Trending Threats</h3>
          </div>
          
          <div className="space-y-6">
            {trendingPosts.map((post, idx) => (
              <div key={`trend-${idx}`}>
                <div className="text-secondary-color text-xs mb-1">
                  Reported by {post.author}
                </div>
                <div className="font-medium text-sm line-clamp-2">
                  {post.text}
                </div>
                <div className="text-[var(--color-primary)] text-xs mt-2 font-bold uppercase">
                  {post.tag}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={24} />
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--surface-color)] animate-ping"></div>
            </div>
            <div>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <div className="text-xs text-secondary-color uppercase tracking-wider font-bold">Active Defenders</div>
            </div>
          </div>
        </div>
        
        <div className="surface-card p-6 bg-indigo-500/5">
          <h3 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle className="text-yellow-500" size={18}/> Threat of the Day</h3>
          <p className="text-sm text-secondary-color">
            Zero-click PDF malware campaigns are surging. Disable automatic PDF previews in your email client.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default CommunityFeedPage;
