import { useEffect, useMemo, useState } from 'react';

const API_URL = '/evaluation-service/notifications';
const TOKEN = import.meta.env.VITE_AUTH_TOKEN || '';
const TYPE_OPTIONS = ['','Event','Result','Placement'];

function loadViewed() {
  try {
    return JSON.parse(localStorage.getItem('viewed-notifications') || '[]');
  } catch {
    return [];
  }
}


function saveViewed(ids) {
  localStorage.setItem('viewed-notifications', JSON.stringify(ids));
}

function score(item, viewedSet) {
  const typeScore = { Placement: 3, Result: 2, Event: 1 }[item.type] || 0;
  const unreadScore = viewedSet.has(item.id) ? 0 : 1000;
  const timeScore = Date.parse(item.timestamp) || 0;
  return unreadScore + typeScore * 1000000 + timeScore;
}

export default function App() {
  const [tab, setTab] = useState('priority');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [viewed, setViewed] = useState(loadViewed);

  useEffect(() => {
    saveViewed(viewed);
  }, [viewed]);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(Math.min(limit, 10)),
        });
        if (type) params.set('notification_type', type);
        const response = await fetch(`${API_URL}?${params.toString()}`, {
          headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load notifications');
        }
        const data = await response.json();
        const list = Array.isArray(data.notifications) ? data.notifications : [];
        setItems(list.map((item) => ({
          id: item.ID || item.id,
          type: item.Type || item.type,
          message: item.Message || item.message,
          timestamp: item.Timestamp || item.timestamp,
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [page, limit, type]);

  const viewedSet = useMemo(() => new Set(viewed), [viewed]);
  const allItems = items;
  const priorityItems = useMemo(
    () => [...items].sort((a, b) => score(b, viewedSet) - score(a, viewedSet)).slice(0, topN),
    [items, topN, viewedSet]
  );
  const visibleItems = tab === 'priority' ? priorityItems : allItems;

  function markViewed(id) {
    setViewed((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React App</p>
          <h1>Notification Inbox</h1>
          <p className="subtitle">All notifications and priority notifications in one clean dashboard.</p>
        </div>
        <div className="hero-card">
          <strong>{visibleItems.length}</strong>
          <span>Visible items</span>
        </div>
      </section>

      <section className="toolbar">
        <button className={tab === 'priority' ? 'active' : ''} onClick={() => setTab('priority')}>Priority</button>
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All</button>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option || 'all'} value={option}>{option || 'All'}</option>
            ))}
          </select>
        </label>
        <label>
          Page
          <input type="number" min="1" value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} />
        </label>
        <label>
          Limit
          <input type="number" min="1" max="10" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 10)} />
        </label>
        <label>
          Top N
          <input type="number" min="1" max="20" value={topN} onChange={(e) => setTopN(Number(e.target.value) || 10)} />
        </label>
      </section>

      <section className="summary">
        <div><strong>{items.length}</strong><span>Loaded</span></div>
        <div><strong>{priorityItems.length}</strong><span>Priority</span></div>
        <div><strong>{viewed.length}</strong><span>Viewed</span></div>
      </section>

      {loading && <p className="status">Loading notifications...</p>}
      {error && <p className="status error">{error}</p>}

      <section className="grid">
        {visibleItems.map((item) => {
          const isViewed = viewedSet.has(item.id);
          return (
            <article className="card" key={item.id}>
              <div className="card-top">
                <span className="tag">{item.type}</span>
                <span className={isViewed ? 'badge viewed' : 'badge new'}>{isViewed ? 'Viewed' : 'New'}</span>
              </div>
              <p>{item.message}</p>
              <small>{item.timestamp}</small>
              <button onClick={() => markViewed(item.id)}>Mark viewed</button>
            </article>
          );
        })}
      </section>
    </main>
  );
}
