interface MobileHeaderProps {
    showUsers: boolean;
    setShowUsers: (show: boolean) => void;
}

export default function MobileHeader({ showUsers, setShowUsers }: MobileHeaderProps) {
    return (
        <div className="lg:hidden bg-white shadow-md p-4">
            <div className="flex items-center justify-between">
                <button onClick={() => setShowUsers(!showUsers)} className="p-2 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-indigo-600">Ping Chatr</h1>
                </div>
                <div className="w-6"></div>
            </div>
            <div className="text-center mt-1">
                <p className="text-sm text-gray-500 italic">"Your message, an echo in the shadows"</p>
            </div>
        </div>
    );
}
