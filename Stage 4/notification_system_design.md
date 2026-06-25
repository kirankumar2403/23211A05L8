# Stage 4

## Problem

The notifications are getting fetched on every page load for every student. Because of that, the database is getting overloaded and the app is becoming slow.

## My Suggestion

I would not fetch all notifications every time the page loads. Instead, I would use these ideas:

1. Cache the notifications for a short time using local cache.
2. Load only the latest notifications first.
3. Use pagination if there are many records.
4. Use real-time updates only for new notifications.

## How It Will Help

If we use caching, the server does not need to hit the database again and again for the same data. This will make the app faster.

If we use pagination, the app will load only some notifications at a time. This reduces the load on the database.

If we use real-time updates, only new notifications will come through the stream, so the whole list does not need to be fetched again.

## Tradeoffs

- Caching is fast, but the data can become a little old.
- Pagination is simple, but the user may need to click next page.
- Real-time updates are good, but they are a little more complex to build.

## Final Answer

I think the best solution is to combine caching, pagination, and real-time updates. This will reduce the database load and improve the user experience.
