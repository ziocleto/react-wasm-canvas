# react-wasm-canvas

>

[![NPM](https://img.shields.io/npm/v/react-wasm-canvas.svg)](https://www.npmjs.com/package/react-wasm-canvas) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-wasm-canvas
```

## Intro

`WasmCanvas` is a functional component that helps you render a webGL (1,2) context coming from a WebAssembly module into a canvas.
It uses async loading through axios and keeps all the logic in sync using a store provider, in my case I use reactn which I much prefer over redux, but you can use your own.

## Breaking changes since version 2.0.0

Just scroll down to see the new example, I've removed redux dependency, so you can now use your own store.

## How it works

Usually you will have your wasm module (a pair of wasm and js files) somewhere around your public folder of your website, IE:

```bash
public/editor.wasm
public/editor.js
```

WasmCanvas will load `editor` module from public using axios asynchronously.
It will take the father element `canvasContainer` as ref, that will be used internally to calculate all
sizes and scaling.
`InitialRect` and `initialVisibility` are used to determine those start values in case use pass a null `dispatcher`, declared later.

```jax
<WasmCanvas
    wasmName='editor'
    canvasContainer={fatherRef.current}
    initialRect={{top: 0, left: 0, width: 0, height: 0}}
    initialVisibility={false}
/>
```

`WasmCanvas` supports dynamic resizing and devices pixel ratio (IE retina's display) out of the box and transparently.

### `WasmCanvas` parameters list

All optional:

    dispatcher // I use ReactN instead of Redux but you can use what you want as long as they adhere to the pair of [state, setState] idiom
    argumentList // Array of Arguments for wasm module argv argc, array
    padding // canvas padding
    borderRadius // canvas radius
    preFilter // specify your folder if your wasm is not in public/
    mandatoryWebGLVersionSupporNumber // Require a mandatory webgl version "webgl" or "weblgl2"

## Usage

```jsx
import React from 'react'
import WasmCanvas from 'react-wasm-canvas'

// I use reactn (which is awesome) but you can use what you want, as long as they return a [state,setState] pair.
import {useGlobal} from "reactn";

const App = () => {
  const wasmDispatcher = useGlobal('reactWasm');
  let canvasContainer = React.useRef(null);

  const wasmArgumentList = []

  return (
      <div ref={canvasContainer}>
        <WasmCanvas
          wasmName="editor"
          dispatcher={wasmDispatcher}
          canvasContainer={canvasContainer.current}
          initialRect={{top: 0, left: 0, width: 200, height: 200}}
          initialVisibility={true}
          argumentList={wasmArgumentList}
          padding="1px"
          borderRadius="5px"
          mandatoryWebGLVersionSupporNumber="webgl2"
        />
      </div>
  )
}

export default App
```

## License

MIT © [ziocleto](https://github.com/ziocleto)
