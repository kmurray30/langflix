import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { VideoWithDeck } from '../types';
import './VideoDetail.css';

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoWithDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingDeck, setAddingDeck] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  useEffect(() => {
    if (id) {
      loadVideo(id);
    }
  }, [id]);

  // Load YouTube IFrame API script
  useEffect(() => {
    // Check if script is already loaded
    if (window.YT && window.YT.Player) {
      return;
    }

    // Load the IFrame Player API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize YouTube player when video is loaded
  useEffect(() => {
    if (!video || !playerContainerRef.current) return;

    const videoId = extractVideoId(video.videoUrl);
    if (!videoId) {
      console.error('Could not extract video ID from URL:', video.videoUrl);
      return;
    }

    const initializePlayer = () => {
      // Clear existing player if any
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Create new player
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    // Wait for YT API to be ready
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [video]);

  const onPlayerReady = () => {
    console.log('YouTube player ready');
  };

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      // Start polling current time when playing
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      
      timeUpdateIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      }, 250); // Poll every 250ms
    } else {
      // Stop polling when paused or stopped
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }
  };

  // Update current subtitle based on current time
  useEffect(() => {
    if (!video?.subtitles || video.subtitles.length === 0) {
      setCurrentSubtitle('');
      return;
    }

    // Find the subtitle that matches the current time
    const subtitle = video.subtitles.find(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    setCurrentSubtitle(subtitle ? subtitle.text : '');
  }, [currentTime, video?.subtitles]);

  const loadVideo = async (videoId: string) => {
    try {
      setLoading(true);
      const fetchedVideo = await api.getVideo(videoId);
      setVideo(fetchedVideo);
    } catch (err) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeck = async () => {
    if (!video?.deck) return;

    try {
      setAddingDeck(true);
      await api.addDeckToVocab(video.deck.id);
      // Navigate to flashcard page after adding
      navigate(`/flashcards/${video.deck.id}`);
    } catch (err) {
      console.error('Failed to add deck:', err);
      alert('Failed to add deck to vocab');
    } finally {
      setAddingDeck(false);
    }
  };

  if (loading) {
    return (
      <div className="video-detail">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-detail">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message error">{error || 'Video not found'}</div>
      </div>
    );
  }

  return (
    <div className="video-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="video-container">
        <h1 className="video-title">{video.title}</h1>
        <div className="video-player">
          <div ref={playerContainerRef} />
        </div>
        
        {/* Subtitle display window */}
        <div className="subtitle-window">
          <div className="subtitle-text">
            {currentSubtitle || '\u00A0'}
          </div>
        </div>
      </div>

      {video.deck && (
        <div className="deck-section">
          <h2>Vocabulary Deck</h2>
          <div className="deck-info">
            <div className="deck-header">
              <h3>{video.deck.name}</h3>
              <p className="word-count">{video.deck.words.length} words</p>
            </div>
            <button
              className="add-deck-button"
              onClick={handleAddDeck}
              disabled={addingDeck}
            >
              {addingDeck ? 'Adding...' : 'Add to My Vocab & Practice'}
            </button>
          </div>
          <div className="word-preview">
            {video.deck.words.slice(0, 3).map((word, index) => (
              <div key={index} className="word-preview-item">
                <span className="english">{word.english}</span>
                <span className="separator">→</span>
                <span className="spanish">{word.spanish}</span>
              </div>
            ))}
            {video.deck.words.length > 3 && (
              <p className="more-words">
                +{video.deck.words.length - 3} more words
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDetail;

