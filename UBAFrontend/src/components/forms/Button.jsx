export function Button({text, color, onButton, disabled, loading}){
    return <div className="flex">
        <button
            onClick={onButton}
            className={`w-full font-comfortaa rounded-lg h-10 mt-5 text-white flex items-center justify-center gap-2 ${color} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={disabled}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
            )}
            {text}
        </button>
    </div>
}