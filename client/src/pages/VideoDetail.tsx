import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import FlashcardWidget from '../components/FlashcardWidget';
import '../components/FlashcardWidget.css';
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
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [userClosedWidget, setUserClosedWidget] = useState(false);
  const [resettingProgress, setResettingProgress] = useState(false);
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
    // Start polling immediately even when not playing (for scrubbing support)
    startPolling(50);
  };

  const startPolling = (interval: number) => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, interval);
  };

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      // Poll at 100ms when playing
      startPolling(100);
    }
    // For all other states (paused, buffering, etc), keep polling at 50ms
    // This ensures scrubbing works smoothly
  };

  // Update current subtitle based on current time
  useEffect(() => {
    if (!video?.subtitles || video.subtitles.length === 0) {
      setCurrentSubtitle('');
      return;
    }

    // Find all subtitles that match the current time
    const matchingSubtitles = video.subtitles.filter(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    // If multiple subtitles overlap, show the one that started most recently
    const subtitle = matchingSubtitles.length > 0
      ? matchingSubtitles.reduce((latest, current) => 
          current.startTime > latest.startTime ? current : latest
        )
      : null;

    setCurrentSubtitle(subtitle ? subtitle.text : '');
  }, [currentTime, video?.subtitles]);

  const loadVideo = async (videoId: string, skipAutoOpen: boolean = false) => {
    try {
      setLoading(true);
      const fetchedVideo = await api.getVideo(videoId);
      setVideo(fetchedVideo);
      
      // Auto-open flashcards if there are unlearned words and user hasn't closed it
      // Skip auto-open if explicitly requested (e.g., after closing flashcards)
      if (!skipAutoOpen && fetchedVideo.deck && fetchedVideo.deck.words.length > 0 && !userClosedWidget) {
        // Check if not all words are learned by looking at deck stats
        const allWordsLearned = fetchedVideo.deck.learnedCount === fetchedVideo.deck.totalCount 
          && (fetchedVideo.deck.totalCount ?? 0) > 0;
        
        if (!allWordsLearned) {
          setShowFlashcards(true);
        }
      }
    } catch (err) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFlashcards = async () => {
    setShowFlashcards(false);
    setUserClosedWidget(true);
    
    // Reload video to get updated progress stats, but skip auto-open
    if (id) {
      await loadVideo(id, true);
    }
  };

  const handleOpenFlashcards = () => {
    setShowFlashcards(true);
  };

  const handleResetProgress = async () => {
    if (!video?.deck) return;
    
    const confirmReset = window.confirm(
      'Are you sure you want to reset all progress for this video? This will mark all words as unlearned.'
    );
    
    if (!confirmReset) return;
    
    try {
      setResettingProgress(true);
      await api.resetDeckProgress(video.deck.id);
      // Reload video to get fresh deck with all words
      if (id) {
        await loadVideo(id);
      }
      // Reset the userClosedWidget flag so flashcards can auto-open again
      setUserClosedWidget(false);
    } catch (err) {
      console.error('Failed to reset progress:', err);
      alert('Failed to reset progress');
    } finally {
      setResettingProgress(false);
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

      {/* Progress Section */}
      {video.deck && (video.deck.totalCount ?? 0) > 0 && (
        <div className="progress-section">
          {video.deck.learnedCount === video.deck.totalCount ? (
            // Completion banner when all words are learned
            <div className="completion-banner">
              <div className="completion-message">
                🎉 Amazing! You've learned all {video.deck.totalCount} words! 🎉
              </div>
            </div>
          ) : (
            // Progress bar when still learning
            <>
              <div className="progress-header">
                Vocabulary Progress: {video.deck.learnedCount}/{video.deck.totalCount}
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${video.deck.percentLearned}%` }}
                  />
                </div>
                <div className="progress-text">
                  {video.deck.learnedCount} / {video.deck.totalCount} learned ({video.deck.percentLearned}%)
                </div>
              </div>
            </>
          )}
          
          <div className="progress-actions">
            <button 
              className="practice-button" 
              onClick={handleOpenFlashcards}
              disabled={video.deck.learnedCount === video.deck.totalCount}
            >
              Practice Vocabulary
            </button>
            <button 
              className="reset-button" 
              onClick={handleResetProgress}
              disabled={resettingProgress}
            >
              {resettingProgress ? 'Resetting...' : 'Reset Progress'}
            </button>
          </div>
        </div>
      )}

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

      {/* Flashcard Modal Overlay */}
      {showFlashcards && video.deck && (
        <div className="flashcard-modal-overlay">
          <div className="flashcard-modal-content">
            <FlashcardWidget 
              deckId={video.deck.id}
              videoTitle={video.title}
              learnedCount={video.deck.learnedCount}
              totalCount={video.deck.totalCount}
              onClose={handleCloseFlashcards}
              onResetProgress={handleResetProgress}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDetail;

