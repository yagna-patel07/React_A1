import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useEffect, useRef, useState, useMemo } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { evalScope } from "@strudel/core";
import { drawPianoroll } from "@strudel/draw";
import { initAudioOnFirstClick } from "@strudel/webaudio";
import { transpiler } from "@strudel/transpiler";
import {
    getAudioContext,
    webaudioOutput,
    registerSynthSounds
} from "@strudel/webaudio";
import { registerSoundfonts } from "@strudel/soundfonts";
import console_monkey_patch from "./console-monkey-patch";

import DJControls from "./components/DJControls";
import PlayButtons from "./components/PlayButtons";
import ProcButtons from "./components/ProcButtons";
import PreprocessTextArea from "./components/PreprocessTextArea";
import EditorHost from "./components/EditorHost";
import PianoRoll from "./components/PianoRoll";
import MixerPanel from "./components/MixerPanel";
import { stranger_tune } from "./tunes";
import { makeTune, stripSetcps } from "./lib/cpm";
import { setEditor, getEditor } from "./lib/editorStore";
import FXPanel from "./components/FXPanel";
import KitSelect from "./components/KitSelect";
import PresetBar from "./components/PresetBar";
import AlertToast from "./components/AlertToast";
import useHotkeys from "./hooks/useHotkeys";
import D3LogGraph from "./components/D3LogGraph";

export default function StrudelDemo() {
    const hasRun = useRef(false);

    // ===== Top-level state =====
    const initialCpm = 120;
    const [cpmText, setCpmText] = useState(String(initialCpm));
    const [volume, setVolume] = useState(1);
    const [body, setBody] = useState(() => stripSetcps(stranger_tune));

    const [kit, setKit] = useState("");
    const [fx, setFx] = useState({
        reverb: false,
        reverbAmt: 0.4,
        delay: false,
        delayAmt: 0.25,
        lpf: false,
        lpfCut: 6000
    });

    // p1 ON / HUSH toggle
    const [p1Mode, setP1Mode] = useState("on");

    // Toast text for JSON actions
    const [toast, setToast] = useState(null);

    // Whether Strudel is currently playing (for the visualiser)
    const [isPlaying, setIsPlaying] = useState(false);

    // Live data for D3 visualiser – last 100 “energy” samples
    const [graphPoints, setGraphPoints] = useState([]);

    // ===== Helper functions for preprocessing and tune building =====

    const preprocessBody = (raw, cpm, vol) =>
        (raw ?? "")
            .replace(/\{\{CPM\}\}/g, String(cpm))
            .replace(/\{\{VOLUME\}\}/g, String(vol))
            .replace(/\r/g, "")
            .trim();

    const applyKit = (raw, kitValue) =>
        (raw ?? "").replace(/\{\{KIT\}\}/g, kitValue || "RolandTR808");

    const hushBody = (raw) =>
        (raw ?? "").replace(/^( *)(drums2?)\s*:/gm, "$1_$2:");

    const songText = useMemo(() => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : 120;

        const pre = preprocessBody(body, cpm, volume);
        const withKit = applyKit(pre, kit);
        const cleanedBody = stripSetcps(withKit);
        const finalBody = p1Mode === "hush" ? hushBody(cleanedBody) : cleanedBody;

        return makeTune(cpm, volume, finalBody, fx, kit);
    }, [cpmText, volume, body, fx, kit, p1Mode]);

    // ===== CPM input =====
    const handleCpmInput = (raw) => {
        const onlyDigits = raw.replace(/[^\d]/g, "");
        setCpmText(onlyDigits);
    };

    // ===== Preprocess & transport =====
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
        setIsPlaying(true);
    };

    const handlePlay = () => {
        const ed = getEditor();
        if (!ed) return;
        ed.evaluate();
        setIsPlaying(true);
    };

    const handleStop = () => {
        const ed = getEditor();
        if (!ed) return;
        ed.stop();
        setIsPlaying(false);
    };

    const handleP1ModeChange = (mode) => setP1Mode(mode);

    // ===== Keyboard shortcuts (space, S, arrows) =====
    useHotkeys({
        onPlay: () => {
            const ed = getEditor();
            if (ed?.repl?.state?.started) {
                handleStop();
            } else {
                handlePlay();
            }
        },
        onStop: handleStop,
        onVol: (delta) => {
            setVolume((v) => Math.max(0, Math.min(1, v + delta)));
        }
    });

    // ===== One-time Strudel + editor setup =====
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        console_monkey_patch();

        const canvas = document.getElementById("roll");
        canvas.width = canvas.width * 2;
        canvas.height = canvas.height * 2;
        const drawContext = canvas.getContext("2d");
        const drawTime = [-2, 2];

        const editor = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById("editor"),
            drawTime,
            onDraw: (haps, time) =>
                drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
            prebake: async () => {
                initAudioOnFirstClick();
                const loadModules = evalScope(
                    import("@strudel/core"),
                    import("@strudel/draw"),
                    import("@strudel/mini"),
                    import("@strudel/tonal"),
                    import("@strudel/webaudio")
                );
                await Promise.all([
                    loadModules,
                    registerSynthSounds(),
                    registerSoundfonts()
                ]);
            }
        });

        setEditor(editor);
        editor.setCode(songText);
    }, [songText]);

    // ===== Keep editor in sync when controls change =====
    useEffect(() => {
        const ed = getEditor();
        if (!ed) return;

        if (cpmText === "") {
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

    // ===== Live D3 visualiser data =====
    useEffect(() => {
        if (!isPlaying) return;

        const id = setInterval(() => {
            setGraphPoints((prev) => {
                const nextVal = volume * 0.8 + Math.random() * 0.2;
                const next = [...prev, nextVal];
                if (next.length > 100) next.shift();
                return next;
            });
        }, 200);

        return () => clearInterval(id);
    }, [isPlaying, volume]);

    // ===== Render =====
    return (
        <div data-bs-theme="dark" className="min-vh-100 bg-body">
            {/* Top bar: brand + primary transport controls */}
            <header className="app-bar d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                    <h1 className="brand m-0">STRUDEL</h1>
                    <span className="badge-soft">live coding studio</span>
                </div>
                <div className="transport-strip d-flex align-items-center gap-2">
                    <PlayButtons onPlay={handlePlay} onStop={handleStop} />
                    <ProcButtons onProc={runPreprocess} onProcPlay={runProcAndPlay} />
                </div>
            </header>

            <main className="container-fluid py-3 main-shell">
                {/* Row 1: Code (left) + Visuals (right) */}
                <div className="row gx-3 gy-3 align-items-stretch">
                    {/* Left: Code Lab (preprocess + editor together) */}
                    <section className="col-lg-8">
                        <div className="panel mb-3 code-lab-panel">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>Code Lab</span>
                                <span className="text-muted small">
                                    preprocess &nbsp;→&nbsp; edit &nbsp;→&nbsp; play
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="section-label text-uppercase text-muted small mb-1">
                                        Text to preprocess
                                    </div>
                                    <PreprocessTextArea value={body} onChange={setBody} />
                                </div>
                                <div>
                                    <div className="section-label text-uppercase text-muted small mb-1">
                                        Editor
                                    </div>
                                    <div className="editor-pane">
                                        <EditorHost />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right: Visuals (D3 + piano roll) */}
                    <section className="col-lg-4">
                        <div className="panel mb-3">
                            <div className="card-header">Live Visualiser</div>
                            <div className="card-body">
                                <D3LogGraph values={graphPoints} />
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

                {/* Row 2: Control Deck (Mixer, DJ, Kit, FX, Presets) */}
                <div className="row gx-3 gy-3 mt-2">
                    <section className="col-12">
                        <div className="panel control-deck">
                            <div className="card-header">Control Deck</div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <h6 className="section-label text-muted text-uppercase small mb-2">
                                            Tempo &amp; Volume
                                        </h6>
                                        <MixerPanel
                                            cpmText={cpmText}
                                            onCpmText={handleCpmInput}
                                            volume={volume}
                                            onVolume={setVolume}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <h6 className="section-label text-muted text-uppercase small mb-2">
                                            Pattern Focus &amp; Kit
                                        </h6>
                                        <DJControls
                                            mode={p1Mode}
                                            onModeChange={handleP1ModeChange}
                                        />
                                        <div className="mt-3">
                                            <KitSelect kit={kit} onKit={setKit} />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <h6 className="section-label text-muted text-uppercase small mb-2">
                                            FX &amp; Presets
                                        </h6>
                                        <FXPanel value={fx} onChange={setFx} />
                                        <div className="mt-3">
                                            <PresetBar
                                                stateForSave={{ cpmText, volume, kit, fx, body }}
                                                onLoadJson={(p) => {
                                                    setCpmText(String(p.cpmText ?? 120));
                                                    setVolume(Number(p.volume ?? 1));
                                                    setKit(p.kit ?? "");
                                                    setFx(
                                                        p.fx ?? {
                                                            reverb: false,
                                                            reverbAmt: 0.4,
                                                            delay: false,
                                                            delayAmt: 0.25,
                                                            lpf: false,
                                                            lpfCut: 6000
                                                        }
                                                    );
                                                    setBody(p.body ?? "");

                                                    const n = parseInt(p.cpmText ?? 120, 10);
                                                    const cpm =
                                                        Number.isFinite(n) && n > 0 ? n : 120;
                                                    const ed = getEditor();
                                                    if (ed) {
                                                        ed.setCode(
                                                            makeTune(
                                                                cpm,
                                                                p.volume ?? 1,
                                                                p.body ?? "",
                                                                p.fx ?? fx,
                                                                p.kit ?? ""
                                                            )
                                                        );
                                                        if (ed.repl?.state?.started) ed.evaluate();
                                                    }

                                                    setToast("Preset loaded");
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
                                                    const defaultCpm = 120;
                                                    const defaultVol = 1;
                                                    const defaultBody =
                                                        stripSetcps(stranger_tune);

                                                    setCpmText(String(defaultCpm));
                                                    setVolume(defaultVol);
                                                    setKit("");
                                                    setFx(defaultsFx);
                                                    setBody(defaultBody);
                                                    setP1Mode("on");

                                                    const ed = getEditor();
                                                    if (ed) {
                                                        ed.setCode(
                                                            makeTune(
                                                                defaultCpm,
                                                                defaultVol,
                                                                defaultBody,
                                                                defaultsFx,
                                                                ""
                                                            )
                                                        );
                                                        if (ed.repl?.state?.started) ed.evaluate();
                                                    }

                                                    setToast("Settings reset");
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Toast overlay */}
                <AlertToast
                    show={!!toast}
                    onHide={() => setToast(null)}
                    message={toast || ""}
                />
            </main>
        </div>
    );
}
