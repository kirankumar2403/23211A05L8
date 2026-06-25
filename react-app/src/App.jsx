import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Log } from 'logging_middleware/log.js';

const API_URL = '/evaluation-service/notifications';
const TOKEN = import.meta.env.VITE_AUTH_TOKEN || '';
const TYPE_OPTIONS = ['','Event','Result','Placement'];

function logEvent(level, pkg, message) {
  Log('frontend', level, pkg, message).catch((err) => {
    console.warn('Logging failed:', err.message || err);
  });
}

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
      logEvent('info', 'api', `Fetching notifications page=${page} limit=${Math.min(limit, 10)} type=${type || 'all'}`);
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
        logEvent('info', 'api', `Fetched ${list.length} notifications`);
        setItems(list.map((item) => ({
          id: item.ID || item.id,
          type: item.Type || item.type,
          message: item.Message || item.message,
          timestamp: item.Timestamp || item.timestamp,
        })));
      } catch (err) {
        logEvent('error', 'api', `Failed to fetch notifications: ${err.message || String(err)}`);
        setError(err.message || String(err));
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
    logEvent('info', 'state', `Marked notification ${id} as viewed`);
    setViewed((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Notification Inbox
          </Typography>
          <Chip label={`${visibleItems.length} visible`} color="secondary" />
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={2}>
          <Box display="flex" gap={2} alignItems="center">
            <Button variant={tab === 'priority' ? 'contained' : 'outlined'} onClick={() => setTab('priority')}>Priority</Button>
            <Button variant={tab === 'all' ? 'contained' : 'outlined'} onClick={() => setTab('all')}>All</Button>

            <Box sx={{ minWidth: 160 }}>
              <Select value={type} onChange={(e) => setType(e.target.value)} displayEmpty>
                <MenuItem value="">All</MenuItem>
                {TYPE_OPTIONS.filter(Boolean).map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </Box>

            <TextField label="Page" type="number" size="small" value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} sx={{ width: 100 }} />
            <TextField label="Limit" type="number" size="small" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 10)} sx={{ width: 100 }} />
            <TextField label="Top N" type="number" size="small" value={topN} onChange={(e) => setTopN(Number(e.target.value) || 10)} sx={{ width: 100 }} />
          </Box>

          <Box display="flex" gap={4}>
            <Box>
              <Typography variant="subtitle2">Loaded</Typography>
              <Typography variant="h6">{items.length}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Priority</Typography>
              <Typography variant="h6">{priorityItems.length}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Viewed</Typography>
              <Typography variant="h6">{viewed.length}</Typography>
            </Box>
          </Box>

          {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            {visibleItems.map((item) => {
              const isViewed = viewedSet.has(item.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={item.type || 'Unknown'} />
                        <Chip label={isViewed ? 'Viewed' : 'New'} color={isViewed ? 'default' : 'primary'} />
                      </Box>
                      <Typography variant="body1" gutterBottom>{item.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.timestamp}</Typography>
                      <Box mt={2}>
                        <Button size="small" onClick={() => markViewed(item.id)}>Mark viewed</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
