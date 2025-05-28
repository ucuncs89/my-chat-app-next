This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Next.js Chat App with Socket.IO, App Router, TypeScript, and Tailwind

## Tutorial & Setup

### 1. Install Dependencies

```
npm install socket.io socket.io-client
```

### 2. Tambahkan Tailwind CSS (jika belum)

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Edit `tailwind.config.js` agar content-nya:

```js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Edit `/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. **[PENTING]** Pindahkan Socket.IO Server ke `pages/api/socket.ts`

Karena App Router (`app/api/`) tidak support Socket.IO server, buat file berikut:

**Buat folder dan file:**

- `pages/api/socket.ts`

**Isi dengan kode berikut:**

```ts
import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { Server as NetServer } from "http";
import type { Socket } from "net";

type NextApiResponseWithSocket = {
  socket: Socket & {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

let users: Record<string, string> = {};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("login", (username: string) => {
        users[socket.id] = username;
        socket.broadcast.emit("user-list", Object.values(users));
        socket.emit("user-list", Object.values(users));
      });

      socket.on("private-message", ({ to, message, from }) => {
        const targetSocketId = Object.keys(users).find(
          (key) => users[key] === to
        );
        if (targetSocketId) {
          io.to(targetSocketId).emit("private-message", { from, message });
        }
      });

      socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user-list", Object.values(users));
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
```

### 4. Pastikan Client Connect ke Path yang Benar

Di file chat client (misal `app/chat/page.tsx`):

```ts
socket = io({
  path: "/api/socket_io",
});
```

### 5. Jalankan Ulang Next.js

```
npm run dev
```

### 6. Selesai! Chat app siap digunakan.

---

**Catatan:**

- Jangan gunakan `app/api/socket/route.ts` untuk Socket.IO server.
- Gunakan `pages/api/socket.ts` agar Socket.IO berjalan normal di Next.js.
