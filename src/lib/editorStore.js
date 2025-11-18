// module-level store for the Strudel editor instance
let editor = null;

// Save the current editor so other modules can use it
export function setEditor(instance) {
    editor = instance;
}

// Access the shared editor instance 
export function getEditor() {
    return editor;
}