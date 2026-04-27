# markpad

A brutalist, monospaced markdown notes app. Plain text first, no lock-in, syncs via your own cloud drive.

---

## philosophy

- One `.md` file per note. Your notes are just files.
- Sync via Dropbox, iCloud Drive, or Google Drive — no backend required.
- Monospaced, high-contrast UI. No gradients, no rounded corners, no fluff.
- Tags via frontmatter. Search that works.

---

## structure

```
markpad/
├── markpad-desktop/     # Tauri v2 + React + TypeScript
└── markpad-mobile/      # Expo (React Native) — iOS, Android, Web
```

---

## desktop (Tauri)

### prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) toolchain
- Xcode Command Line Tools (macOS): `xcode-select --install`

### setup

```bash
cd markpad-desktop
npm install
npm run tauri dev
```

### build

```bash
npm run tauri build
```

Output is in `src-tauri/target/release/bundle/`.

### features

- Pick any folder as your notes directory
- Folder name shown in sidebar header
- Create, rename, delete notes
- Tag editing inline in the editor (press `,` or `Enter` to add, `Backspace` to remove last)
- Sidebar tag filter
- Sidebar search — filters by title, body, and tags
- `Cmd+K` global search overlay
- Split / preview / edit modes
- Autosave after 800ms of inactivity
- Custom titlebar with minimize, maximize, close
- Dark mode via system preference
- Keyboard shortcuts (see below)

### keyboard shortcuts

| shortcut       | action                                    |
| -------------- | ----------------------------------------- |
| `Cmd+N`        | new note                                  |
| `Cmd+S`        | force save                                |
| `Cmd+K`        | search overlay                            |
| `Cmd+/`        | shortcut guide                            |
| `Esc`          | close overlay / cancel rename             |
| `Enter`        | confirm rename                            |
| `,`            | add tag (when in tag input)               |
| `Backspace`    | remove last tag (when tag input is empty) |
| `Double click` | rename note in sidebar                    |

### note format

Each note is a `.md` file with YAML frontmatter:

```
---
title: my note
tags: [work, dev]
createdAt: 2026-04-27T10:00:00.000Z
updatedAt: 2026-04-27T12:00:00.000Z
---

note body here
```

Title updates automatically from the first line of the body.

---

## mobile (Expo)

### prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Xcode (for iOS simulator)
- Android Studio (for Android emulator, optional)

### setup

```bash
cd markpad-mobile
npm install --legacy-peer-deps
npx expo start
```

Press `i` for iOS simulator, `a` for Android, `w` for web browser.

### features

- iOS, Android, and web from one codebase
- Swipe left on a note to reveal delete button
- Tap `•••` for options: rename or delete
- Tag editing in the editor
- Sidebar search + tag filter
- Autosave after 800ms of inactivity
- Dark mode via system preference
- On web: notes stored in `localStorage`
- On native: notes stored as `.md` files in the app's document directory

### known issues

- `react-native-reanimated` must stay on `3.16.7` — v4 has a worklets compatibility issue with Expo SDK 54
- Web platform uses `localStorage` only — no file system access in the browser

---

## sync

Point both apps at the same folder inside your Dropbox, iCloud Drive, or Google Drive directory. The apps read and write plain `.md` files so any file sync tool works.

On mobile, the notes folder lives inside the app's sandboxed document directory. To access it from Files on iOS, enable "On My iPhone → markpad" in the Files app.

---

## tech stack

| layer       | desktop                           | mobile                             |
| ----------- | --------------------------------- | ---------------------------------- |
| framework   | Tauri v2 + React 18               | Expo SDK 54 + React Native         |
| language    | TypeScript                        | TypeScript                         |
| storage     | `.md` files via `tauri-plugin-fs` | `.md` files via `expo-file-system` |
| markdown    | `marked`                          | plain text editor                  |
| frontmatter | custom parser                     | custom parser                      |
| styling     | CSS variables, monospace          | StyleSheet, JetBrains Mono         |
| search      | in-memory string match            | in-memory string match             |

---

## development notes

### adding a new permission (desktop)

Add the permission string to `src-tauri/capabilities/default.json`. Valid values are listed in `src-tauri/gen/schemas/desktop-schema.json`.

### frontmatter parser

Lives in `lib/frontmatter.ts` on both desktop and mobile. The parser is identical — copy changes to both repos manually if you modify it.

### autosave

Both apps debounce saves by 800ms. The status bar shows `unsaved` during the debounce window and `saved` after the write completes.

---

## license

<!-- MIT -->