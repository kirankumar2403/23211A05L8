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

