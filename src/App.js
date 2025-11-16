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
import PianoRoll from './components/PianoRoll'
import MixerPanel from './components/MixerPanel';
import { stranger_tune } from './tunes';
import { makeTune, stripSetcps } from './lib/cpm';
import { setEditor, getEditor } from './lib/editorStore';
//import { handleD3Data, SetupButtons, Proc, ProcAndPlay } from './lib/handlers';

import FXPanel from './components/FXPanel';
import KitSelect from './components/KitSelect';
import PresetBar from './components/PresetBar';
import AlertToast from './components/AlertToast';
import useHotkeys from './hooks/useHotkeys';


export default function StrudelDemo() {

    const hasRun = useRef(false);

    // --- state ---
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

    // p1 ON/HUSH mode
    const [p1Mode, setP1Mode] = useState("on");

    // simple presets + toasts
    const [presets, setPresets] = useState([]);
    const [toast, setToast] = useState(null);

    const preprocessBody = (raw, cpm, vol) =>
        (raw ?? "")
            .replace(/\{\{CPM\}\}/g, String(cpm))
            .replace(/\{\{VOLUME\}\}/g, String(vol))
            .replace(/\r/g, "")
            .trim();

    const applyKit = (raw, kitValue) =>
        (raw ?? "").replace(/\{\{KIT\}\}/g, kitValue || "RolandTR808");

    // build the tune text sent to Strudel
    const hushBody = (raw) =>
        // Any token like D1, S3, H10, etc becomes "_"
        (raw ?? "").replace(/^( *)(drums2?)\s*:/gm, '$1_$2:');

    const songText = useMemo(() => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : 120;

        const pre = preprocessBody(body, cpm, volume);
        const withKit = applyKit(pre, kit);
        const cleanedBody = stripSetcps(withKit);
        const finalBody = p1Mode === "hush" ? hushBody(cleanedBody) : cleanedBody;

        return makeTune(cpm, volume, finalBody, fx, kit);
    }, [cpmText, volume, body, fx, kit, p1Mode]);

    const savePreset = () => {
        const p = { cpm: cpmText, volume, kit, fx, body };
        setPresets(prev => [p, ...prev].slice(0, 8));
        setToast({ variant: 'success', msg: 'Preset saved' });
    };

    const loadPreset = (p) => {
        setCpmText(String(p.cpm));
        setVolume(p.volume);
        setKit(p.kit);
        setFx(p.fx);
        setBody(p.body);
        setToast({ variant: 'info', msg: 'Preset loaded' });
    };

    useHotkeys({
        ' ': (e) => { e.preventDefault(); (getEditor()?.repl?.state?.started ? handleStop() : handlePlay()); },
        'ctrl+s': (e) => { e.preventDefault(); savePreset(); }
    });


    // CPM input change 
    const handleCpmInput = (raw) => {
        const onlyDigits = raw.replace(/[^\d]/g, '');
        setCpmText(onlyDigits);
    };

    const runPreprocess = () => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : 120;

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

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        console_monkey_patch();
        //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
        //init canvas
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
            onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
            prebake: async () => {
                initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
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

    useEffect(() => {
        const ed = getEditor();
        if (!ed)
            return;

        if (cpmText === '') {
            ed.stop();
            return;
        }

        const n = parseInt(cpmText, 10);
        if (!Number.isFinite(n) || n <= 0) {
            ed.stop();
            return;
        }

        const pre = preprocessBody(body, n, volume);
        const withKit = applyKit(pre, kit);
        const cleanedBody = stripSetcps(withKit);
        const finalBody = p1Mode === "hush" ? hushBody(cleanedBody) : cleanedBody;

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

                    <aside className="col-lg-4">
                        <div className="sticky-lg">
                            <nav className="panel mb-3">
                                <div className="card-header">Transport</div>
                                <div className="card-body d-grid gap-2">
                                    <PlayButtons onPlay={handlePlay} onStop={handleStop} />
                                    <ProcButtons onProc={runPreprocess}
                                        onProcPlay={runProcAndPlay} />
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
                                        onModeChange={handleP1ModeChange} />
                                </div>
                            </div>

                            {/* Drum kit chooser */}
                            <div className="panel mb-3">
                                <div className="card-header">Kit</div>
                                <div className="card-body">
                                    <KitSelect
                                        kit={kit}
                                        onKit={setKit} />
                                </div>
                            </div>

                            {/* FX controls */}
                            <div className="panel mb-3">
                                <div className="card-header">FX</div>
                                <div className="card-body">
                                    <FXPanel value={fx} onChange={setFx} />
                                </div>
                            </div>

                            {/* Presets (save + list) */}
                            <div className="panel mb-3">
                                <div className="card-header">Presets</div>
                                <div className="card-body">
                                    <PresetBar
                                        stateForSave={{ cpmText, volume, kit, fx, body }}
                                        onLoadJson={(p) => {
                                            setCpmText(String(p.cpmText ?? 120));
                                            setVolume(Number(p.volume ?? 1));
                                            setKit(p.kit ?? "");
                                            setFx(p.fx ?? { reverb: false, reverbAmt: 0.4, delay: false, delayAmt: 0.25, lpf: false, lpfCut: 6000 });
                                            setBody(p.body ?? "");

                                            // refresh editor immediately
                                            const n = parseInt(p.cpmText ?? 120, 10);
                                            const cpm = Number.isFinite(n) && n > 0 ? n : 120;
                                            const ed = getEditor();
                                            if (ed) {
                                                ed.setCode(makeTune(cpm, p.volume ?? 1, p.body ?? "", p.fx ?? fx, p.kit ?? ""));
                                                if (ed.repl?.state?.started) ed.evaluate();
                                            }
                                        }}
                                        onReset={() => {
                                            const defaultsFx = { reverb: false, reverbAmt: 0.4, delay: false, delayAmt: 0.25, lpf: false, lpfCut: 6000 };
                                            const defaultCpm = 120, defaultVol = 1, defaultBody = stripSetcps(stranger_tune);

                                            setCpmText(String(defaultCpm));
                                            setVolume(defaultVol);
                                            setKit("");
                                            setFx(defaultsFx);
                                            setBody(defaultBody);
                                            setP1Mode("on");

                                            const ed = getEditor();
                                            if (ed) {
                                                ed.setCode(makeTune(defaultCpm, defaultVol, defaultBody, defaultsFx, ""));
                                                if (ed.repl?.state?.started) ed.evaluate();
                                            }
                                        }}
                                    />
                                </div>
                            </div>


                            <AlertToast
                                show={!!toast}
                                variant={toast?.variant || 'info'}
                                onClose={() => setToast(null)}
                            >
                                {toast?.msg}
                            </AlertToast>

                        </div>
                    </aside>

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
        </div >
    );
}