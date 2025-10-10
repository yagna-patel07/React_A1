import './cors-redirect';
import './App.css';
import { initStrudel, note, hush, evalScope, getAudioContext, webaudioOutput, registerSynthSounds, initAudioOnFirstClick, transpiler } from "@strudel/web";
//import "@strudel/repl";
import { useEffect, useRef } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { registerSoundfonts } from '@strudel/soundfonts';
import { drawPianoroll } from '@strudel/draw';
import { stranger_tune } from './tunes';


export function initRepl() {
  console.log('Effect ran only once!');

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
    initialCode: stranger_tune,
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
    },
  });

  document.getElementById('play').addEventListener('click', () => editor.evaluate());
  document.getElementById('stop').addEventListener('click', () => editor.stop());
}

export function StrudelDemo() {


  const hasRun = useRef(false);

  useEffect(() => {

    if (!hasRun.current) {
      hasRun.current = true;
      initStrudel();
      initRepl();
    }

  }, []);


  return (
    <div>
      <h2>Strudel Demo</h2>
      <main>
        <nav>
          <button id="play">eval</button>
          <button id="stop">stop</button>
        </nav>
        <div class="container">
          <div id="editor"></div>
          <div id="output"></div>
        </div>
        <canvas id="roll"></canvas>
      </main>
    </div>
  );


}

export default StrudelDemo;
