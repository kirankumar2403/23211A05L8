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
