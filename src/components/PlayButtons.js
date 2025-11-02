import { ButtonGroup, Button } from 'react-bootstrap';
function PlayButtons({ onPlay, onStop }) {
    return (
        <ButtonGroup className="mb-3">
            <Button variant="primary" onClick={onPlay}>Play</Button>
            <Button variant="danger" onClick={onStop}>Stop</Button>
        </ButtonGroup>
    )
}
export default PlayButtons;



