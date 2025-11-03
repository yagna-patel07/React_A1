

import { getEditor } from "./editorStore";

// console handler
export const handleD3Data = (event) => {
    console.log(event.detail);
};

// wire up existing buttons by ID 
export function SetupButtons() {
    const ed = getEditor();
    document.getElementById('play').addEventListener('click', () => ed.evaluate());
    document.getElementById('stop').addEventListener('click', () => ed.stop());
    document.getElementById('process').addEventListener('click', () => { Proc(); });
    document.getElementById('process_play').addEventListener('click', () => {
        if (getEditor() != null) {
            Proc();
            getEditor().evaluate();
        }
    });
}

// called by radio change
export function ProcAndPlay() {
    const ed = getEditor();
    if (ed && ed.repl?.state?.started === true) {
        console.log(ed);
        Proc();
        ed.evaluate();
    }
}

// text replacement
export function ProcessText(match, ...args) {
    let replace = "";
    if (document.getElementById('flexRadioDefault2').checked) {
        replace = "_";
    }
    return replace;
}

// preprocess
export function Proc() {
    const ed = getEditor();
    let proc_text = document.getElementById('proc').value;
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    ProcessText(proc_text);
    ed.setCode(proc_text_replaced);
}

