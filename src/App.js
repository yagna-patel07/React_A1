import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useEffect, useRef, useState, useMemo } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import console_monkey_patch from './console-monkey-patch';

import DJControls from './components/DJControls';
import PlayButtons from './components/PlayButtons';
import ProcButtons from './components/ProcButtons';
import PreprocessTextArea from './components/PreprocessTextArea';
import EditorHost from './components/EditorHost';
import PianoRoll from './components/PianoRoll';
import MixerPanel from './components/MixerPanel';
import { stranger_tune } from './tunes';
import { makeTune, stripSetcps } from './lib/cpm';
import { setEditor, getEditor } from './lib/editorStore';

import FXPanel from './components/FXPanel';
import KitSelect from './components/KitSelect';
import PresetBar from './components/PresetBar';
import AlertToast from './components/AlertToast';
import useHotkeys from './hooks/useHotkeys';

/* ---------- Helper functions for preprocessing + tune building ---------- */

// Replace {{CPM}} and {{VOLUME}} placeholders in the raw tune body.
const preprocessBody = (raw, cpm, vol) =>
    (raw ?? "")
        .replace(/\{\{CPM\}\}/g, String(cpm))
        .replace(/\{\{VOLUME\}\}/g, String(vol))
        .replace(/\r/g, "")
        .trim();

// Insert the selected drum kit wherever {{KIT}} appears.
// Falls back to RolandTR808 if no kit is selected.
const applyKit = (raw, kitValue) =>
    (raw ?? "").replace(/\{\{KIT\}\}/g, kitValue || "RolandTR808");

// When p1 is in HUSH mode, mute drums / drums2 tracks by prefixing them with "_".
const hushBody = (raw) =>
    (raw ?? "").replace(/^( *)(drums2?)\s*:/gm, '$1_$2:');

// Build the final Strudel body we send into makeTune,
// applying CPM/VOLUME placeholders, kit selection, setcps stripping and HUSH.
function buildSongBody(rawBody, { cpm, volume, kit, p1Mode }) {
    const pre = preprocessBody(rawBody, cpm, volume);
    const withKit = applyKit(pre, kit);
    const cleaned = stripSetcps(withKit);
    return p1Mode === "hush" ? hushBody(cleaned) : cleaned;
}

/* ------------------------------------------------------------------------ */

export default function StrudelDemo() {
    const hasRun = useRef(false);

    // --- top-level state owned by the parent component ---
    const initialCpm = 120;
    const [cpmText, setCpmText] = useState(String(initialCpm));
    const [volume, setVolume] = useState(1);
    const [body, setBody] = useState(() => stripSetcps(stranger_tune));

    const [kit, setKit] = useState("");
    const [fx, setFx] = useState({
        reverb: false, reverbAmt: 0.4,
        delay: false, delayAmt: 0.25,
        lpf: false, lpfCut: 6000
    });

    // p1 ON/HUSH toggle
    const [p1Mode, setP1Mode] = useState("on");

    // toast feedback for presets / actions
    const [toast, setToast] = useState(null);

    // ----- Derive final tune text that goes into Strudel -----
    const songText = useMemo(() => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : initialCpm;

        const finalBody = buildSongBody(body, { cpm, volume, kit, p1Mode });
        return makeTune(cpm, volume, finalBody, fx, kit);
    }, [cpmText, volume, body, fx, kit, p1Mode]);

    // Global keyboard shortcuts:
    // - Space: play / stop
    // - S: stop
    // - ArrowUp/Down: adjust master volume
    useHotkeys({
        onPlay: () => {
            const ed = getEditor();
            if (!ed) return;
            if (ed.repl?.state?.started) {
                ed.stop();
            } else {
                ed.evaluate();
            }
        },
        onStop: () => getEditor()?.stop(),
        onVol: (delta) => {
            setVolume(prev => {
                const next = prev + delta;
                return Math.max(0, Math.min(1, next)); // clamp 0–1
            });
        }
    });

    // CPM text input: keep only digits for safety.
    const handleCpmInput = (raw) => {
        const onlyDigits = raw.replace(/[^\d]/g, '');
        setCpmText(onlyDigits);
    };

    // Preprocess just the text area body (CPM/VOLUME placeholders),
    // update state, and push the new tune into the editor.
    const runPreprocess = () => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : initialCpm;

        const newBody = preprocessBody(body, cpm, volume);
        setBody(newBody);

        const ed = getEditor();
        if (ed) {
            ed.setCode(makeTune(cpm, volume, newBody, fx, kit));
        }
    };

    const runProcAndPlay = () => {
        runPreprocess();
        getEditor()?.evaluate();
    };

    const handlePlay = () => getEditor()?.evaluate();
    const handleStop = () => getEditor()?.stop();

    const handleP1ModeChange = (mode) => {
        setP1Mode(mode);
    };

    // ----- One-time Strudel initialisation + piano roll drawing -----
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        console_monkey_patch();

        const canvas = document.getElementById('roll');
        canvas.width = canvas.width * 2;
        canvas.height = canvas.height * 2;
        const drawContext = canvas.getContext('2d');
        const drawTime = [-2, 2]; // time window of drawn haps

        const editor = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById('editor'),
            drawTime,
            onDraw: (haps, time) =>
                drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
            prebake: async () => {
                // Needed so browsers allow audio to start after a user click.
                initAudioOnFirstClick();

                const loadModules = evalScope(
                    import('@strudel/core'),
                    import('@strudel/draw'),
                    import('@strudel/mini'),
                    import('@strudel/tonal'),
                    import('@strudel/webaudio'),
                );
                await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
            }
        });

        setEditor(editor);
        editor.setCode(songText);
    }, [songText]);

    // Whenever CPM / volume / body / FX / kit / p1Mode changes,
    // rebuild the tune text and hot-reload it into Strudel.
    useEffect(() => {
        const ed = getEditor();
        if (!ed) return;

        if (cpmText === '') {
            ed.stop();
            return;
        }

        const n = parseInt(cpmText, 10);
        if (!Number.isFinite(n) || n <= 0) {
            ed.stop();
            return;
        }

        const finalBody = buildSongBody(body, { cpm: n, volume, kit, p1Mode });
        const updated = makeTune(n, volume, finalBody, fx, kit);
        ed.setCode(updated);

        if (ed.repl?.state?.started) ed.evaluate();
    }, [cpmText, volume, body, fx, kit, p1Mode]);

    return (
        <div data-bs-theme="dark" className="min-vh-100 bg-body">
            <header className="app-bar d-flex align-items-center justify-content-between">
                <h1 className="brand m-0">Strudel</h1>
                <span className="badge-soft">live coding</span>
            </header>

            <main className="container-fluid py-2">
                <div className="row gx-3 gy-3">
                    {/* Left column: transport, mixer, DJ controls, kit, FX, presets */}
                    <aside className="col-lg-4">
                        <div className="sticky-lg">
                            <nav className="panel mb-3">
                                <div className="card-header">Transport</div>
                                <div className="card-body d-grid gap-2">
                                    <PlayButtons onPlay={handlePlay} onStop={handleStop} />
                                    <ProcButtons
                                        onProc={runPreprocess}
                                        onProcPlay={runProcAndPlay}
                                    />
                                </div>
                            </nav>

                            <div className="panel mb-3">
                                <div className="card-header">Mixer</div>
                                <div className="card-body">
                                    <MixerPanel
                                        cpmText={cpmText}
                                        onCpmText={handleCpmInput}
                                        volume={volume}
                                        onVolume={setVolume}
                                    />
                                </div>
                            </div>

                            <div className="panel">
                                <div className="card-header">DJ Controls</div>
                                <div className="card-body">
                                    <DJControls
                                        mode={p1Mode}
                                        onModeChange={handleP1ModeChange}
                                    />
                                </div>
                            </div>

                            {/* Drum kit chooser */}
                            <div className="panel mb-3">
                                <div className="card-header">Kit</div>
                                <div className="card-body">
                                    <KitSelect
                                        kit={kit}
                                        onKit={setKit}
                                    />
                                </div>
                            </div>

                            {/* FX controls */}
                            <div className="panel mb-3">
                                <div className="card-header">FX</div>
                                <div className="card-body">
                                    <FXPanel value={fx} onChange={setFx} />
                                </div>
                            </div>

                            {/* Presets (save + load + reset via JSON file) */}
                            <div className="panel mb-3">
                                <div className="card-header">Presets</div>
                                <div className="card-body">
                                    <PresetBar
                                        stateForSave={{ cpmText, volume, kit, fx, body }}
                                        onLoadJson={(p) => {
                                            const defaultsFx = {
                                                reverb: false,
                                                reverbAmt: 0.4,
                                                delay: false,
                                                delayAmt: 0.25,
                                                lpf: false,
                                                lpfCut: 6000
                                            };

                                            setCpmText(String(p.cpmText ?? initialCpm));
                                            setVolume(Number(p.volume ?? 1));
                                            setKit(p.kit ?? "");
                                            setFx(p.fx ?? defaultsFx);
                                            setBody(p.body ?? "");

                                            // Refresh editor immediately with loaded values.
                                            const n = parseInt(p.cpmText ?? initialCpm, 10);
                                            const cpm = Number.isFinite(n) && n > 0 ? n : initialCpm;
                                            const ed = getEditor();
                                            if (ed) {
                                                const finalBody = buildSongBody(
                                                    p.body ?? "",
                                                    {
                                                        cpm,
                                                        volume: p.volume ?? 1,
                                                        kit: p.kit ?? "",
                                                        p1Mode
                                                    }
                                                );
                                                ed.setCode(makeTune(cpm, p.volume ?? 1, finalBody, p.fx ?? defaultsFx, p.kit ?? ""));
                                                if (ed.repl?.state?.started) ed.evaluate();
                                            }
                                        }}
                                        onReset={() => {
                                            const defaultsFx = {
                                                reverb: false,
                                                reverbAmt: 0.4,
                                                delay: false,
                                                delayAmt: 0.25,
                                                lpf: false,
                                                lpfCut: 6000
                                            };
                                            const defaultCpm = initialCpm;
                                            const defaultVol = 1;
                                            const defaultBody = stripSetcps(stranger_tune);

                                            setCpmText(String(defaultCpm));
                                            setVolume(defaultVol);
                                            setKit("");
                                            setFx(defaultsFx);
                                            setBody(defaultBody);
                                            setP1Mode("on"); // Reset p1 to ON

                                            const ed = getEditor();
                                            if (ed) {
                                                const finalBody = buildSongBody(
                                                    defaultBody,
                                                    {
                                                        cpm: defaultCpm,
                                                        volume: defaultVol,
                                                        kit: "",
                                                        p1Mode: "on"
                                                    }
                                                );
                                                ed.setCode(makeTune(defaultCpm, defaultVol, finalBody, defaultsFx, ""));
                                                if (ed.repl?.state?.started) ed.evaluate();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <AlertToast
                                show={!!toast}
                                onHide={() => setToast(null)}
                                message={toast?.msg || ""}
                            />
                        </div>
                    </aside>

                    {/* Right column: text area, editor, and piano roll */}
                    <section className="col-lg-8">
                        <div className="panel mb-3">
                            <div className="card-header">Text to preprocess</div>
                            <div className="card-body">
                                <PreprocessTextArea value={body} onChange={setBody} />
                            </div>
                        </div>

                        <div className="panel mb-3">
                            <div className="card-header">Editor</div>
                            <div className="card-body editor-pane">
                                <EditorHost />
                            </div>
                        </div>

                        <div className="panel">
                            <div className="card-header">Piano Roll</div>
                            <div className="card-body p-2">
                                <PianoRoll />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
