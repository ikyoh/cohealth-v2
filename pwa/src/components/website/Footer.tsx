import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="container mt-10 mb-5 px-3 mx-auto max-w-4xl">
            <div className="bg-muted flex items-center justify-between rounded-md p-4 flex-wrap">
                <span className="text-title">&copy; CoHealth 2025</span>
                <Link href="#" className="text-muted-foreground hover:text-primary text-sm">
                    Mentions légales
                </Link>
            </div>
        </footer>
    )
}

