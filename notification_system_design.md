# Stage 1

## Notification System Design

I designed a simple notification system for logged-in users. The main idea is that the user can see notifications, open one notification, mark them as read, and also get live updates when a new notification comes.

### Main actions

1. Get all notifications.
2. Get one notification by id.
3. Mark one notification as read.
4. Mark all notifications as read.
5. Receive real-time notifications.

## REST API Endpoints

### 1. Get all notifications
- Method: `GET`
- Path: `/api/notifications`
- Use: This returns all notifications of the current user.

**Response**
```json
{
  "data": [
    {
      "id": "n_123",
      "title": "New message",
      "message": "You have a new message",
      "type": "message",
      "read": false,
      "createdAt": "2026-06-25T10:30:00Z"
    }
  ]
}
```

### 2. Get one notification
- Method: `GET`
- Path: `/api/notifications/:id`
- Use: This returns a single notification.

**Response**
```json
{
  "data": {
    "id": "n_123",
    "title": "New message",
    "message": "You have a new message",
    "type": "message",
    "read": false,
    "createdAt": "2026-06-25T10:30:00Z"
  }
}
```

### 3. Mark one notification as read
- Method: `PATCH`
- Path: `/api/notifications/:id/read`
- Use: This changes one notification to read.

**Request**
```json
{}
```

**Response**
```json
{
  "message": "Notification marked as read"
}
```

### 4. Mark all notifications as read
- Method: `PATCH`
- Path: `/api/notifications/read-all`
- Use: This changes all notifications to read.

**Request**
```json
{}
```

**Response**
```json
{
  "message": "All notifications marked as read"
}
```

### 5. Real-time notifications
- Method: `GET`
- Path: `/api/notifications/stream`
- Use: This is for live notification updates using SSE or WebSocket.

## JSON Schema

The notification object can look like this:

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "string",
  "read": "boolean",
  "createdAt": "string"
}
```

### Fields
- `id`
- `title`
- `message`
- `type`
- `read`
- `createdAt`

## Real-time approach

After login, the frontend can connect to the stream endpoint. When the backend creates a new notification, it can send that notification to the frontend immediately. Then the UI can update the badge and the list without refreshing the page.

## Conclusion

This notification system is simple, easy to understand, and good for both normal API use and live updates.




# Stage 2


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
| notification_type | VARCHAR(50) | Notification type |
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
  notification_type VARCHAR(50) NOT NULL,
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
SELECT id, title, message, notification_type, read, created_at
FROM notifications
WHERE user_id = id
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### 2. Get one notification by id

```sql
SELECT id, title, message, notification_type, read, created_at
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


# Stage 3

## Query Check

The query is may be for finding unread notifications of one student:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

It will return unread notifications for student `1042` in oldest-first order.

## Why It Is Slow

This query can become slow because the table is now very large as described grown to 50000 students and 5000000 notifications. The database may need to scan many rows before finding the matching student and unread records. `SELECT *` also takes more data than needed.

## What I Would Change

I would not add indexes on every column. That is not a good idea because:

- it uses extra storage for indexes
- inserts and updates become slower
- many indexes are not useful

I would add only the useful indexes for this query, like:

- `studentID`
- `isRead`
- `createdAt`

As it contain multiple indexes we can have a combined index on `(studentID, isRead, createdAt)` which would be better for this case.

## Computation Cost

The cost will be more intially but later on using indexes it will make search faster and efficient.

## Query For Placement Notifications in Last 7 Days

```sql
SELECT id, studentID, notificationType, message, isRead, createdAt
FROM notifications
WHERE studentID = 1042
  AND notificationType = 'Placement'
  AND createdAt >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY createdAt DESC;
```

## On creating index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (studentID, isRead, createdAt);
```

If this query run often, then this index helps us to fetch the data fastly.

