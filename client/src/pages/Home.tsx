import { useState } from 'react';
import VideosTab from '../components/VideosTab';
import VocabTab from '../components/VocabTab';
import './Home.css';

type TabType = 'videos' | 'vocab';

function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  return (
    <div className="home">
      <header className="header">
        <h1 className="logo">Langflix</h1>
        <nav className="tabs">
          <button
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`tab ${activeTab === 'vocab' ? 'active' : ''}`}
            onClick={() => setActiveTab('vocab')}
          >
            Vocab
          </button>
        </nav>
      </header>
      <main className="content">
        {activeTab === 'videos' ? <VideosTab /> : <VocabTab />}
      </main>
    </div>
  );
}

export default Home;

