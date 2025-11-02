function PlayButtons({ onPlay, onStop }) {
    return (
        <nav className="btn-group" role="group" aria-label="Transport controls">
            <button id="play" className="btn btn-outline-primary" onClick={onPlay}>Play</button>
            <button id="stop" className="btn btn-outline-primary" onClick={onStop}>Stop</button>
        </nav>
    )
}
export default PlayButtons;



