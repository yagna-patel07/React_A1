import { ButtonGroup, Button } from 'react-bootstrap';

// Transport controls: main play / stop buttons
function PlayButtons({ onPlay, onStop }) {
    return (
        <ButtonGroup className="mb-3">
            {/* Start audio */}
            <Button variant="primary" onClick={onPlay}>Play</Button>
            {/* Stop audio */}
            <Button variant="danger" onClick={onStop}>Stop</Button>
        </ButtonGroup>
    )
}
export default PlayButtons;



