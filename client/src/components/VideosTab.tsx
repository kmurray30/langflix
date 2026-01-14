import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Video } from '../types';
import './VideosTab.css';

function VideosTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await api.getVideos();
      setVideos(fetchedVideos);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="message">Loading videos...</div>;
  }

  if (error) {
    return <div className="message error">{error}</div>;
  }

  return (
    <div className="videos-tab">
      <h2>Learn Spanish with Videos</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => navigate(`/video/${video.id}`)}
          >
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="thumbnail"
            />
            <h3 className="video-title">{video.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideosTab;

