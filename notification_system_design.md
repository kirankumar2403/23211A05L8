# Stage 1

## Notification System Design

The notification platform should support the following core actions for logged-in users:

1. Fetch all notifications for the current user.
2. Fetch a single notification by ID.
3. Mark one notification as read.
4. Mark all notifications as read.
5. Subscribe the user to real-time notification delivery.

## REST API Endpoints

### 1. Get Notifications
- Method: `GET`
- Path: `/api/notifications`
- Description: Returns the notification list for the authenticated user.

**Response Body**
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

### 2. Get Notification By ID
- Method: `GET`
- Path: `/api/notifications/:id`
- Description: Returns one notification.

**Response Body**
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

### 3. Mark Notification As Read
- Method: `PATCH`
- Path: `/api/notifications/:id/read`
- Description: Marks a single notification as read.

**Request Body**
```json
{}
```

**Response Body**
```json
{
  "message": "Notification marked as read"
}
```

### 4. Mark All Notifications As Read
- Method: `PATCH`
- Path: `/api/notifications/read-all`
- Description: Marks every notification for the current user as read.

**Request Body**
```json
{}
```

**Response Body**
```json
{
  "message": "All notifications marked as read"
}
```

### 5. Real-Time Notification Stream
- Method: `GET`
- Path: `/api/notifications/stream`
- Description: Opens a server-sent events or websocket connection for live updates.

## JSON Schema

### Notification Object
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

### Required Fields
- `id`
- `title`
- `message`
- `type`
- `read`
- `createdAt`

## Real-Time Mechanism

For real-time notifications, the frontend should subscribe to a persistent connection after login. The backend can push new notification events through Server-Sent Events or WebSocket.

Recommended flow:
- User logs in.
- Frontend opens the stream endpoint.
- Backend emits notification payloads when a new notification is created.
- Frontend updates the notification badge and list immediately.

## Summary

This design keeps the API predictable, uses clear REST naming, and supports both polling-style access and live delivery for notifications.
