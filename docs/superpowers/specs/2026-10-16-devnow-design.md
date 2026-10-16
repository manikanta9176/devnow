# devnow design

Date: 2026-10-16

devnow is a shareable status page. A teammate opens a link and sees what you are on, an optional link, and when you updated it. The status is encoded in the URL hash, so the page has no database and the text is not sent as a query string.

devbench and shiplog are separate repos.

## v1

- Fields: what you're on (required) and an optional `http` or `https` link.
- Copy link writes a hash of `{ text, link, updatedAt }` and copies the full URL.
- Opening that URL shows the status and the update time.
- A blank status shows `Write what you're on`. A bad link shows `Enter an http or https link`.
- A stable URL you can update in place is a later version.
