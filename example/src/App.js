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
