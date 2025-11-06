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

export default function StrudelDemo() {

    const hasRun = useRef(false);

    // --- state ---
    const initialCpm = 120;
    const [cpmText, setCpmText] = useState(String(initialCpm));  
    const [volume, setVolume] = useState(1); 
    const [body, setBody] = useState(() => stripSetcps(stranger_tune));

    const songText = useMemo(() => {
        const n = parseInt(cpmText, 10);
        const cpm = Number.isFinite(n) && n > 0 ? n : 120;
        return makeTune(cpm, volume, body);    
    }, [cpmText, volume, body]);

    // CPM input change 
    const handleCpmInput = (raw) => {
        const onlyDigits = raw.replace(/[^\d]/g, ''); 
        setCpmText(onlyDigits);
    };

    const [toggles, setToggles] = useState({ D1: true, D2: true, S1: true });
    const onToggle = (k, v) => setToggles(t => ({ ...t, [k]: v }));

    const handlePlay = () => getEditor()?.evaluate();
    const handleStop = () => getEditor()?.stop();

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

        const updated = makeTune(n,volume, body);
        ed.setCode(updated);

        if (ed.repl?.state?.started) ed.evaluate();
    }, [cpmText,volume, body]);

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
                                    <ProcButtons onProc={() => { }} onProcPlay={() => { }} />
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
                                        toggles={toggles}
                                        onToggle={onToggle}
                                    />
                                </div>
                            </div>

                            <div className="panel">
                                <div className="card-header">DJ Controls</div>
                                <div className="card-body">
                                    <DJControls />
                                </div>
                            </div>
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