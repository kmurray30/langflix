import { useState } from 'react';
import DiscoverTab from '../components/DiscoverTab';
import MyVideosTab from '../components/MyVideosTab';
import './Home.css';

type TabType = 'discover' | 'myVideos';

function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  return (
    <div className="home">
      <header className="header">
        <h1 className="logo">Langflix</h1>
        <nav className="tabs">
          <button
            className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button
            className={`tab ${activeTab === 'myVideos' ? 'active' : ''}`}
            onClick={() => setActiveTab('myVideos')}
          >
            My Videos
          </button>
        </nav>
      </header>
      <main className="content">
        {activeTab === 'discover' ? <DiscoverTab /> : <MyVideosTab />}
      </main>
    </div>
  );
}

export default Home;

