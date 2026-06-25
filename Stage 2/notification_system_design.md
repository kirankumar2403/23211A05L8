# Stage 2

## Notification Storage Design

For storing notification data, I would choose **PostgreSQL**. I chose PostgreSQL because the notification data has a clear structure, and SQL is useful when we want to search, filter, sort, and update records reliably. It also works well when the data grows and when we need transactions for read and update operations.

## Why this DB

- It stores structured data in a simple way.
- It is good for the REST APIs from Stage 1.
- It supports indexing, so fetching notifications will be faster.
- It can handle growth better when the number of users and notifications increases.

## Simple DB Schema

### notifications table

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | logged user |
| title | VARCHAR(200) |title description |
| message | TEXT | message |
| type | VARCHAR(50) | Notification type |
| read | BOOLEAN | Read or unread |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

### sample sql


```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id); 
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

These indexes will help to fetch notifications for a specific user and also filter by read/unread status **efficiently**.

### How the data grows

If the number of notifications becomes large, I would solve it by:

- adding indexes on `user_id` and `read`(clustered index) to make queries faster
- paging the results instead of loading everything at once
- archiving old notifications after some time
- using a queue if notifications are created in high volume

## REST API Queries
```

### 1. Get all notifications

```sql
SELECT id, title, message, type, read, created_at
FROM notifications
WHERE user_id = id
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### 2. Get one notification by id

```sql
SELECT id, title, message, type, read, created_at
FROM notifications
WHERE user_id = $1 AND id = $2;
```

### 3. Mark one notification as read

```sql
UPDATE notifications
SET read = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1 AND id = $2;
```

### 4. Mark all notifications as read

```sql
UPDATE notifications
SET read = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1 AND read = FALSE;
```

### 5. Real-time notification insert

```sql
INSERT INTO notifications (id, user_id, title, message, type, read)
VALUES ($1, $2, $3, $4, $5, FALSE);
```

## How I would handle it

When a new notification is created, the backend inserts it into the database and also sends it to the frontend through the real-time stream. The frontend can update the notification badge immediately, so the user does not need to refresh the page.

## Conclusion

I think PostgreSQL is a good choice for this problem because it is simple, reliable, and fits the notification system well. It supports the Stage 1 APIs nicely and can still work when the application grows.
