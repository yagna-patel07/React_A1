import './cors-redirect';
import './App.css';
import { initStrudel, note, hush, evalScope, getAudioContext, webaudioOutput, registerSynthSounds, initAudioOnFirstClick, transpiler } from "@strudel/web";
//import "@strudel/repl";
import { useEffect, useRef } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { registerSoundfonts } from '@strudel/soundfonts';
import { drawPianoroll } from '@strudel/draw';
import { stranger_tune } from './tunes';

let globalEditor = null;

export function Test() {

  document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
  document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
}

export default function StrudelDemo() {

  const hasRun = useRef(false);

  useEffect(() => {

    if (!hasRun.current) {
      hasRun.current = true;
      (async () => {
        await initStrudel();

        globalEditor = new StrudelMirror({
          defaultOutput: webaudioOutput,
          getTime: () => getAudioContext().currentTime,
          transpiler,
          root: document.getElementById('editor'),
          initialCode: stranger_tune,
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
          },
        });

      })();
      Test()
    }


  }, []);


  return (
    <div>
      <h2>Strudel Demo</h2>
      <main>

        <div className="container-fluid">
          <div className="row">
            <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <label for="exampleFormControlTextarea1" className="form-label">Text to preprocess:</label>
              <textarea className="form-control" id="preprocess" rows="3"></textarea>
            </div>
            <div className="col-md-4">

              <nav>
                <button id="process" className="btn btn-outline-primary">Preprocess</button>
                <button id="process_play" className="btn btn-outline-primary">Proc & Play</button>
                <br />
                <button id="play" className="btn btn-outline-primary">Play</button>
                <button id="stop" className="btn btn-outline-primary">Stop</button>
              </nav>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <div id="editor" />
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" defaultChecked />
                <label className="form-check-label" for="flexRadioDefault1">
                  p1: ON
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                <label className="form-check-label" for="flexRadioDefault2">
                  p1: HUSH
                </label>
              </div>
            </div>
          </div>
        </div>

      </main >
    </div >
  );


}

