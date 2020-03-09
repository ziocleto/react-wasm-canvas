import React, {useEffect} from 'react'
import axios from 'axios'

export const loadWasmComplete = async (
  preFolder,
  project,
  canvasRef,
  argumentList,
  mandatoryWebGLVersionSupportNumber,
  dispatch,
  wasmState,
) => {
  try {
    if (!checkWasmSupport()) {
      throw new Error('Web assembly not supported')
    }
    const webglVersion = mandatoryWebGLVersionSupportNumber || 'webgl'
    if (!checkWebGLSupport(webglVersion)) {
      throw new Error(webglVersion + ' not supported')
    }

    let wasmAxios = axios.create()
    wasmAxios.defaults.baseURL = preFolder || ''

    let downloadConfig = {
      url: project + '.wasm',
      method: 'get',
      responseType: 'arraybuffer'
    }
    const binaryContent = await wasmAxios(downloadConfig)
    const wasmBinary = new Uint8Array(binaryContent.data)

    downloadConfig = {
      url: project + '.js',
      method: 'get',
      responseType: 'text'
    }
    const content = await wasmAxios(downloadConfig)

    const wasmScript = content.data
    window.wasmBinary = wasmBinary
    window.wasmScript = wasmScript
  } catch (ex) {
    console.log(ex)
    return null
  }

  window.Module = {
    doNotCaptureKeyboard: true,
    arguments: argumentList,
    print: text => {
      console.log('[WASM] ' + text)
      if (dispatch && wasmState) dispatch(wasmAddConsoleTextInternal(wasmState, text))
    },
    printErr: text => {
      console.log('[WASM-ERROR] ' + text)
    },
    canvas: canvasRef,
    onRuntimeInitialized: () => {
      console.log("WASM runtime initialized");
    },
    instantiateWasm: (imports, successCallback) => {
      WebAssembly.instantiate(window.wasmBinary, imports)
        .then(function (output) {
          console.log("WASM initiated successfully");
          if (dispatch) dispatch(null)
          successCallback(output.instance)
        })
        .catch(function (e) {
          console.log("WASM initiated failed because: ", e.message);
        })
      return {}
    }
  }

  const s = document.createElement('script')
  s.text = window.wasmScript
  document.body.appendChild(s)
}

const checkWasmSupport = () => {
  return typeof WebAssembly === 'object'
}

const checkWebGLSupport = (webGLVersion) => {
  let canvas = document.createElement('canvas')
  try {
    if (canvas.getContext(webGLVersion) !== null) {
      return true
    }
  } catch (ex) {
    return false
  }
}

const WasmCanvas = props => {
  let canvasRef = React.useRef(null);

  const [wasmState, wasmStore] = props.dispatcher ? props.dispatcher : [null,null]

  useEffect(() => {
    loadWasmComplete(
      props.preFolder,
      props.wasmName,
      canvasRef.current,
      props.argumentList,
      props.mandatoryWebGLVersionSupporNumber,
      wasmStore,
      wasmState,
    ).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const rect = props.canvasContainer ? props.canvasContainer.getBoundingClientRect() : props.initialRect;
  const visibility = props.canvasContainer ? "visible" : props.initialVisibility;

  const canvasSizeX = rect.width.toString() + 'px'
  const canvasSizeY = rect.height.toString() + 'px'

  const canvasClientSizeX =
    (rect.width * (window.devicePixelRatio || 1)).toString() + 'px'
  const canvasClientSizeY =
    (rect.height * (window.devicePixelRatio || 1)).toString() + 'px'

  const canvasPadding = props.padding ? props.padding : '0px'
  const canvasMargin = props.margin ? props.margin : '0px'
  const canvasRadius = props.borderRadius ? props.borderRadius : '0px'

  const canvasStyle = {
    visibility: visibility,
    width: canvasSizeX,
    height: canvasSizeY,
    margin: canvasMargin,
    padding: canvasPadding,
    borderRadius: canvasRadius
  }

  return (
    <canvas
      id='WasmCanvas'
      width={canvasClientSizeX}
      height={canvasClientSizeY}
      style={canvasStyle}
      ref={canvasRef}
      onContextMenu={e => e.preventDefault()}
    />
  )
}

export default WasmCanvas

const wasmAddConsoleTextInternal = (state, action) => {
  if (state === null) {
    return {
      consoleOutput: action,
      consoleOutputDirty: true
    }
  }
  return {
    ...state,
    consoleOutput: [...state.consoleOutput, action],
    consoleOutputDirty: !state.consoleOutputDirty
  }
}
