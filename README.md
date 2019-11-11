# react-wasm-canvas

> 

[![NPM](https://img.shields.io/npm/v/react-wasm-canvas.svg)](https://www.npmjs.com/package/react-wasm-canvas) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-wasm-canvas
```

## Intro

`WasmCanvas` is a functional component that helps you render a webGL (1,2) context coming from a WebAssembly module into a canvas.

It uses async loading through axios and keeps all the logic in sync using a redux store.

Usually you will have your wasm module (a pair of wasm and js files) somewhere around your public folder of your website, IE:

```bash
public/editor.wasm
public/editor.js
```

WasmCanvas will load `editor` module from public using axios asynchronously.

```jax
<WasmCanvas wasmName='editor'/>
```

`WasmCanvas` supports dynamic resizing and devices pixel ratio (IE retina's display) out of the box and transparently.

### `WasmCanvas` parameters list 

All optional:

    argumentList // Array of Arguments for wasm module argv argc, array
    padding // canvas padding
    borderRadius // canvas radius
    preFilter // specify your folder if your wasm is not in public/
    mandatoryWebGLVersionSupporNumber // Require a mandatory webgl version "webgl" or "weblgl2"

## Usage

```jsx
import React from 'react'
import WasmCanvas, {wasmReducer as wasm} from 'react-wasm-canvas'
import {Provider} from 'react-redux'
import {combineReducers, createStore} from 'redux'

const store = createStore(
  combineReducers({
    wasm
  }),
  {}
)

const App = () => {
  const wasmArgumentList = []
  return (
    <Provider store={store}>
      <WasmCanvas
        wasmName='YOUR_WASM_AND_JS_FILE_NAME_HERE'
        argumentList={wasmArgumentList}
        padding='1px'
        borderRadius='5px'
        mandatoryWebGLVersionSupporNumber='webgl2'
      />
    </Provider>
  )
}

export default App
```

## License

MIT © [ziocleto](https://github.com/ziocleto)
