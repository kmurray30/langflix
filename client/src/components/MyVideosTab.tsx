import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { VideoWithDeck } from '../types';
import './MyVideosTab.css';

function MyVideosTab() {
  const [videos, setVideos] = useState<VideoWithDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      setLoading(true);
      const savedVideos = await api.getSavedVideos();
      setVideos(savedVideos);
    } catch (err) {
      setError('Failed to load saved videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId: string, event: React.MouseEvent) => {
    // Prevent navigation to video detail
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to remove this video from My Videos?')) {
      return;
    }
    
    try {
      setRemovingVideoId(videoId);
      await api.unsaveVideo(videoId);
      // Reload videos to show updated list
      await loadSavedVideos();
    } catch (err) {
      console.error('Failed to remove video:', err);
      alert('Failed to remove video. Please try again.');
    } finally {
      setRemovingVideoId(null);
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) {
    return <div className="message">Loading videos...</div>;
  }

  if (error) {
    return <div className="message error">{error}</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="my-videos-tab">
        <h2>My Videos</h2>
        <div className="empty-state">
          <p>No saved videos yet.</p>
          <p>Browse Discover and star videos to add them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-videos-tab">
      <h2>My Videos</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => handleVideoClick(video.id)}
          >
            <div className="thumbnail-container">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="thumbnail"
              />
              <button
                className="trash-button"
                onClick={(event) => handleRemoveVideo(video.id, event)}
                disabled={removingVideoId === video.id}
                aria-label="Remove from My Videos"
              >
                {/* Trash icon SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="trash-icon"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              
              {/* Show progress if deck exists */}
              {video.deck && video.deck.percentLearned !== undefined && (
                <div className="progress-section">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${video.deck.percentLearned}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {video.deck.learnedCount} / {video.deck.totalCount} words learned ({video.deck.percentLearned}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyVideosTab;
