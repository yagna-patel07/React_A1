import { Form } from "react-bootstrap";

export default function FXPanel({ value = {}, onChange = () => { } }) {
    const {
        reverb = false, reverbAmt = 0.25,
        delay = false, delayAmt = 0.20,
        lpf = false, lpfCut = 8000,
    } = value || {};

    const set = (patch) => onChange({ ...value, ...patch });

    return (
        <Form onSubmit={(e) => e.preventDefault()}>
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