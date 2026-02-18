import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vending Machine Planner',
    description: 'Plan your vending machine layout with drag and drop',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
