# Stage 2

## Notification Storage Design

For storing notification data, I would choose **PostgreSQL**. I chose PostgreSQL because the notification data has a clear structure, and SQL is useful when we want to search, filter, sort, and update records reliably. It also works well when the data grows and when we need transactions for read and update operations.

## Why this DB

- It stores structured data in a simple way.
- It is good for the REST APIs from Stage 1.
- It supports indexing, so fetching notifications will be faster.
- It can handle growth better when the number of users and notifications increases.

