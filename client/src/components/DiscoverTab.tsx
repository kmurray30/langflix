import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Video } from '../types';
import './DiscoverTab.css';

function DiscoverTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideosAndSavedStatus();
  }, []);

  const loadVideosAndSavedStatus = async () => {
    try {
      setLoading(true);
      const [fetchedVideos, savedVideos] = await Promise.all([
        api.getVideos(),
        api.getSavedVideos()
      ]);
      
      setVideos(fetchedVideos);
      setSavedVideoIds(new Set(savedVideos.map(savedVideo => savedVideo.id)));
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = async (videoId: string, event: React.MouseEvent) => {
    // Prevent navigation to video detail page
    event.stopPropagation();
    
    const isSaved = savedVideoIds.has(videoId);
    
    try {
      if (isSaved) {
        await api.unsaveVideo(videoId);
        setSavedVideoIds(previousSavedIds => {
          const newSavedIds = new Set(previousSavedIds);
          newSavedIds.delete(videoId);
          return newSavedIds;
        });
      } else {
        await api.saveVideo(videoId);
        setSavedVideoIds(previousSavedIds => new Set(previousSavedIds).add(videoId));
      }
    } catch (err) {
      console.error('Failed to toggle save status:', err);
      alert('Failed to save/unsave video. Please try again.');
    }
  };

  if (loading) {
    return <div className="message">Loading videos...</div>;
  }

  if (error) {
    return <div className="message error">{error}</div>;
  }

  return (
    <div className="discover-tab">
      <h2>Discover Videos</h2>
      <div className="video-grid">
        {videos.map((video) => {
          const isSaved = savedVideoIds.has(video.id);
          
          return (
            <div
              key={video.id}
              className="video-card"
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <div className="thumbnail-container">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="thumbnail"
                />
                <button
                  className="star-button"
                  onClick={(event) => handleStarClick(video.id, event)}
                  aria-label={isSaved ? 'Remove from My Videos' : 'Add to My Videos'}
                >
                  {isSaved ? (
                    // Filled star SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="star-icon filled"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ) : (
                    // Unfilled star SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="star-icon"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </button>
              </div>
              <h3 className="video-title">{video.title}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DiscoverTab;
