import { Form } from "react-bootstrap";

// FX control panel for reverb, delay and low-pass filter
export default function FXPanel({ value = {}, onChange = () => { } }) {
    // Destructure with sensible defaults so the UI always has something to show
    const {
        reverb = false, reverbAmt = 0.25,
        delay = false, delayAmt = 0.20,
        lpf = false, lpfCut = 8000,
    } = value || {};

    // Small helper: merge a patch into the current FX object
    const set = (patch) => onChange({ ...value, ...patch });

    return (
        // Prevent accidental form submits on Enter
        <Form onSubmit={(e) => e.preventDefault()}>
            {/* Reverb toggle + amount */}
            <Form.Check
                type="checkbox"
                label="Reverb"
                checked={reverb}
                onChange={(e) => set({ reverb: e.target.checked })}
            />
            <Form.Range min={0} max={1} step={0.01}
                value={reverbAmt}
                onChange={(e) => set({ reverbAmt: Number(e.target.value) })}
            />

            {/* Delay toggle + amount */}
            <Form.Check
                type="checkbox"
                label="Delay"
                checked={delay}
                onChange={(e) => set({ delay: e.target.checked })}
            />
            <Form.Range min={0} max={1} step={0.01}
                value={delayAmt}
                onChange={(e) => set({ delayAmt: Number(e.target.value) })}
            />

            {/* Low-pass filter toggle + cutoff */}
            <Form.Check
                type="checkbox"
                label="Low-pass filter"
                checked={lpf}
                onChange={(e) => set({ lpf: e.target.checked })}
            />
            <Form.Range min={200} max={20000} step={50}
                value={lpfCut}
                onChange={(e) => set({ lpfCut: Number(e.target.value) })}
            />
        </Form>
    );
}