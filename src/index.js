import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'

const WASM_LOAD_START = 'WASM_LOAD_START'
const WASM_INITIALIZE_SUCCESS = 'WASM_INITIALIZE_SUCCESS'
const WASM_INITIALIZE_FAILED = 'WASM_INITIALIZE_FAILED'
const WASM_SET_CANVAS_SIZE = 'WASM_SET_CANVAS_SIZE'
const WASM_RESIZE_CALLBACK = 'WASM_RESIZE_CALLBACK'
const WASM_SET_CANVAS_VISIBILITY = 'WASM_SET_CANVAS_VISIBILITY'
const WASM_ADD_CONSOLE_TEXT = 'WASM_ADD_CONSOLE_TEXT'

const initialState = {
  error: null,
  resize: true,
  loading: false,
  initialized: false,
  running: false,
  consoleOutput: [],
  consoleOutputDirty: false,
  canvasWidth: 1,
  canvasHeight: 1,
  canvasTop: 0,
  canvasLeft: 0,
  canvasVisible: 'hidden'
}

const updateObject = (currentObject, updatedObject) => {
  return {
    ...currentObject,
    ...updatedObject
  }
}

export const wasmSetCanvasVisibility = visible => {
  return {
    type: WASM_SET_CANVAS_VISIBILITY,
    visible: visible
  }
}

export const wasmSetCanvasSize = rect => {
  return {
    type: WASM_SET_CANVAS_SIZE,
    payload: rect
  }
}

export const wasmSetCanvasSizeCallback = () => {
  return {
    type: WASM_RESIZE_CALLBACK,
    payload: null
  }
}

export const wasmInitialized = flag => {
  return {
    type: flag === true ? WASM_INITIALIZE_SUCCESS : WASM_INITIALIZE_FAILED,
    payload: null
  }
}

export const loadWasmComplete = async (
  preFolder,
  project,
  canvasRef,
  argumentList,
  mandatoryWebGLVersionSupportNumber,
  dispatch
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

    const currentDate = new Date()
    let downloadConfig = {
      url: project + '.wasm?t=' + currentDate.getTime(),
      method: 'get',
      responseType: 'arraybuffer'
    }
    const binaryContent = await wasmAxios(downloadConfig)
    const wasmBinary = new Uint8Array(binaryContent.data)

    downloadConfig = {
      url: project + '.js?t=' + currentDate.getTime(),
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

  window.addEventListener('resize', () => {
    dispatch(wasmSetCanvasSizeCallback())
  })

  window.Module = {
    doNotCaptureKeyboard: true,
    arguments: argumentList,
    print: text => {
      console.log('[WASM] ' + text)
      if (!text.startsWith('[INFO]')) {
        dispatch({
          type: WASM_ADD_CONSOLE_TEXT,
          payload: text
        })
      }
    },
    printErr: text => {
      console.log('[WASM-ERROR] ' + text)
    },
    canvas: canvasRef,
    onRuntimeInitialized: () => {
      dispatch(wasmInitialized(true))
    },
    instantiateWasm: (imports, successCallback) => {
      WebAssembly.instantiate(window.wasmBinary, imports)
        .then(function (output) {
          successCallback(output.instance)
        })
        .catch(function (e) {
          dispatch(wasmInitialized(false))
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
  let result = false
  try {
    if (canvas.getContext(webGLVersion) !== null) {
      result = true
    }
  } catch (ex) {
  }
  return result
}

const WasmCanvas = props => {
  let canvas = React.useRef(null)
  const dispatch = useDispatch()
  const wasmState = useSelector(state => state.wasm)

  useEffect(() => {
    loadWasmComplete(
      props.preFolder,
      props.wasmName,
      canvas.current,
      props.argumentList,
      props.mandatoryWebGLVersionSupporNumber,
      dispatch
    )
  }, [canvas, dispatch, props])

  const canvasSizeX = wasmState.canvasWidth.toString() + 'px'
  const canvasSizeY = wasmState.canvasHeight.toString() + 'px'

  const canvasClientSizeX =
    (wasmState.canvasWidth * (window.devicePixelRatio || 1)).toString() + 'px'
  const canvasClientSizeY =
    (wasmState.canvasHeight * (window.devicePixelRatio || 1)).toString() + 'px'

  const canvasPadding = props.padding ? props.padding : '0px'
  const canvasMargin = props.margin ? props.margin : '0px'
  const canvasRadius = props.borderRadius ? props.borderRadius : '0px'

  const canvasStyle = {
    position: 'absolute',
    visibility: wasmState.canvasVisible,
    width: canvasSizeX,
    height: canvasSizeY,
    left: wasmState.canvasLeft,
    top: wasmState.canvasTop,
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
      ref={canvas}
      className='Canvas'
      onContextMenu={e => e.preventDefault()}
    />
  )
}
export default WasmCanvas

const wasmLoadStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true
  })
}

const wasmInitializeSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
    initialized: true,
    running: true
  })
}

const wasmInitializeFailed = (state, action) => {
  return updateObject(state, {
    initialized: false,
    running: false,
    error: action.error
  })
}

const wasmSetCanvasSizeInternal = (state, rect) => {
  return updateObject(state, {
    canvasTop: rect.top,
    canvasLeft: rect.left,
    canvasWidth: rect.width,
    canvasHeight: rect.height,
    resize: false
  })
}

const wasmSetCanvasVisibilityInternal = (state, action) => {
  return updateObject(state, {
    canvasVisible: action.visible
  })
}

const wasmAddConsoleTextInternal = (state, action) => {
  return {
    ...state,
    consoleOutput: [...state.consoleOutput, action.payload],
    consoleOutputDirty: !state.consoleOutputDirty
  }
}

const wasmResizeCallbackInternal = (state, action) => {
  return {
    ...state,
    resize: true
  }
}

export const wasmReducer = (state = initialState, action) => {
  switch (action.type) {
    case WASM_LOAD_START:
      return wasmLoadStart(state, action)
    case WASM_INITIALIZE_SUCCESS:
      return wasmInitializeSuccess(state, action)
    case WASM_INITIALIZE_FAILED:
      return wasmInitializeFailed(state, action)
    case WASM_ADD_CONSOLE_TEXT:
      return wasmAddConsoleTextInternal(state, action)
    case WASM_RESIZE_CALLBACK:
      return wasmResizeCallbackInternal(state, action)
    case WASM_SET_CANVAS_SIZE:
      return wasmSetCanvasSizeInternal(state, action.payload)
    case WASM_SET_CANVAS_VISIBILITY:
      return wasmSetCanvasVisibilityInternal(state, action)
    default:
      return state
  }
}
