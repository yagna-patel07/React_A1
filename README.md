# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



---



# Strudel – Live Coding Studio

This project is a Strudel-based live coding environment built to make beats of your own choice. It lets you edit pattern code, preprocess it, and then play it with a mixer, FX, kit selector, and a live D3 visualiser, all inside one page.

## Controls and What They Do

### Transport bar (top right)
- **Play** - Evaluates the current Strudel code and starts audio playback.
- **Stop** - Stops playback and resets the visualiser.
- **Preprocess** - Runs the preprocessing step once and updates the editor with the preprocessed code (CPM, volume, and kit placeholders are replaced).
- **Proc & Play** - Preprocesses the text and immediately starts playback in one step.

### Text to Preprocess (Code Lab – top left)
- Large textarea where you write your “template” Strudel code.
- Supports placeholders:
  - `{{CPM}}` - Replaced with the current cycles-per-minute value.
  - `{{VOLUME}}` - Replaced with the current master volume.
  - `{{KIT}}` - Replaced with the selected drum kit name.
- The **Preprocess** and **Proc & Play** buttons use this section to generate the final code sent to the editor.

### Editor
- Shows the actual Strudel code that is sent to the Strudel REPL.
- Updated automatically when:
  - You change CPM, volume, kit, FX, or DJ mode.
  - You click **Preprocess** / **Proc & Play**.
  - You load or reset a preset.
- You can still manually edit patterns here before pressing **Play**.

### Mixer
- **CPM (Cycles per minute)** - Controls the playback speed of patterns.
  - Input box only accepts digits; invalid values stop playback.
- **Master Volume** - Slider from 0-1 that controls the overall loudness for all patterns.
  - This value is also baked into the preprocessed text via `{{VOLUME}}`.

### DJ Controls (p1 mode)
- **p1: ON** - Normal playback. Drum tracks (`drums`, `drums2`) play as written.
- **p1: HUSH** - "Mutes" drum blocks by rewriting them internally so they no longer play, while leaving other parts of the song running.

### Kit Select
- Dropdown to choose the current drum kit (e.g. Roland-style kits).
- Selected kit name is injected into the text using the `{{KIT}}` placeholder during preprocessing.

### FX Panel
- **Reverb** - Toggle + amount slider (`reverbAmt`).
- **Delay** - Toggle + amount slider (`delayAmt`).
- **Low-pass filter (LPF)** - Toggle + cutoff slider (`lpfCut`).
- All FX values are passed into `makeTune(...)`, which builds the final Strudel pattern with the chosen FX setup.

### Presets (JSON handling)
- **Save Preset** - Saves the current state into a downloadable JSON file:
  - `cpmText`, `volume`, `kit`, `fx` object, and `body` (preprocess text).
- **Load Preset** - Loads a preset JSON file from disk and updates:
  - CPM, volume, kit, FX controls, preprocess text, and the Editor.
- **Reset** - Restores a sensible default:
  - CPM 120, volume 1, default FX settings, default tune (`stranger_tune`), p1 mode = ON.
  - Also updates the editor and restarts playback if it was already running.
- This fulfills the JSON read/write requirement in a useful way (saving and restoring full control state).

### Live Visualiser (D3 graph)
- Animated bar + line visualiser that updates while the song is playing.
- Gives a quick sense of overall groove / intensity instead of detailed audio analysis.

### Piano Roll
- Canvas that shows the piano roll view generated by Strudel's `drawPianoroll`.
- Follows the currently playing patterns in real time.
- Helpful for seeing timing and pitch distribution of your pattern.

### Keyboard shortcuts
- **Space** - Toggle Play / Stop (depending on current Strudel state).
- **S** - Force Stop.
- **Arrow Up / Arrow Down** - Nudge master volume up or down in small steps and clamp between 0 and 1.

---

## Demonstration Video

A short demonstration video that walks through the main features is available here:

**Demo video:** - ``

The video shows:
1. Editing the "Text to preprocess" section and running Preprocess.
2. Using the Transport controls (Play, Stop, Proc & Play).
3. Changing CPM, volume, kits, and FX while the song is running.
4. Saving and loading presets via JSON.
5. Watching the D3 visualiser and piano roll respond to playback.