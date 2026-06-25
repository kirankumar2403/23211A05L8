# Stage 5

## Problem

The given design is not reliable because `send_email` fails for some students in the middle. Also, if we do email, DB save, and app notification one by one, one step can fail while the others succeed.

## Shortcomings

- It is slow because one student is handled after another.
- If email fails, the whole process becomes unsafe.
- DB insert and notification should not depend fully on the email step.
- It may create missing records if something stops in between.

## What I Would Do

I would separate the work into two parts:

1. Save the notification in the database first.
2. Send email and app notification in background jobs.

This way the main process finishes fast and the other work can happen later.

## Should DB save and email happen together?

I do not think this DB save and email will happen in the same direct step. If we keep everything together, one failure can affect the full process. The database record is more important, so I would save it first. After that, email and app notification can be sent separately.

## Better Pseudocode

```text
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        save_to_db(student_id, message)
        send_email(student_id, message)
        push_to_app(student_id, message)
```

## Why This Is Better

- It is faster.
- It is safer.
- It is easier to retry failed email jobs.
- It keeps the notification record in the database even if email fails.

## Final Answer

The old implementation is not good for large scale because it can fail in the middle and it is slow. I would recommend to save the notification first and then send email and app notification in background jobs.
