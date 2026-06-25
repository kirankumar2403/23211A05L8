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

```sample sql


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

## How the data grows

If the number of notifications becomes large, I would solve it by:

- adding indexes on `user_id` and `read`(clustered index) to make queries faster
- paging the results instead of loading everything at once
- archiving old notifications after some time
- using a queue if notifications are created in high volume