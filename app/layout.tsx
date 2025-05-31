import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ping Chatr - Your message, an echo in the shadows",
    description: "A real-time chat application where your messages echo in the shadows",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>{children}</body>
        </html>
    );
}
