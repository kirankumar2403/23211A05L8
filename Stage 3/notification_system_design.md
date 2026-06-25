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

