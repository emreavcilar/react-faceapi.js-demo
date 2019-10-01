import React, { Component, Fragment } from 'react';
import './App.css';
// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// import '@tensorflow/tfjs-node';
// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
// import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
// import {changeFaceDetector, TINY_FACE_DETECTOR,changeInputSize} from './utils/faceDetectionControls'


class App extends Component {
  forardTimes = [];
  withBoxes = true;

  videoItemRef = React.createRef();
  canvasItemRef = React.createRef();
  selectedFaceDetector = 'TINY_FACE_DETECTOR'
  // ssd_mobilenetv1 options
  minConfidence = 0.5

  // tiny_face_detector options
  inputSize = 512
  scoreThreshold = 0.5

  //mtcnn options
  minFaceSize = 20

  componentDidMount() {
    // this.loadModels().then(this.run)
    // this.run()
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(this.startVideo)
  }

  startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => this.videoItemRef.current.srcObject = stream,
      err => console.error(err)
    )
  }

  async getStream() {
    return await navigator.mediaDevices.getUserMedia({ video: {} })
  }

  async loadModels(){
    if (!this.isFaceDetectionModelLoaded()) {
      console.log('123')
      // await this.getCurrentFaceDetectionNet().loadFromUri('./models')
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models')
    }
  }

  async run() {
   
    

    // load face detection and face expression recognition models
    // await changeFaceDetector(TINY_FACE_DETECTOR)
    // await faceapi.loadFaceExpressionModel('/')
    // changeInputSize(224)

    // try to access users webcam and stream the images
    // to the video element
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    this.videoItemRef.current.srcObject = stream;
  }


  async onPlay() {

    if (this.videoItemRef.current.paused || this.videoItemRef.current.ended) {
      return setTimeout(() => this.onPlay())
    }

    console.log('1');
    const options = this.getFaceDetectorOptions()
    console.log('2');
    console.log('options ', options)
    const result = await faceapi.detectAllFaces(this.videoItemRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    console.log('3');

    if (result) {
      console.log('4');
      // const canvas = $('#overlay').get(0)
      const canvas = this.canvasItemRef;
      console.log('5');
      const dims = faceapi.matchDimensions(canvas, this.videoItemRef.current, true)
      console.log('6');

      const resizedResult = faceapi.resizeResults(result, dims)
      console.log('7');
      const minConfidence = 0.05
      console.log('8');
      if (this.withBoxes) {
        console.log('9');
        faceapi.draw.drawDetections(canvas, resizedResult)
      }
      console.log('10');
      faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
    }

    setTimeout(() => this.onPlay())

  }


  getFaceDetectorOptions = () => {
    console.log('selected ', this.selectedFaceDetector)

    let minConfidence = this.minConfidence;
    let inputSize = this.inputSize;
    let scoreThreshold = this.scoreThreshold;
    let minFaceSize = this.minFaceSize

    return this.selectedFaceDetector === 'SSD_MOBILENETV1'
      ? new faceapi.SsdMobilenetv1Options({ minConfidence })
      : (
        this.selectedFaceDetector === 'TINY_FACE_DETECTOR'
          ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
          : new faceapi.MtcnnOptions({ minFaceSize })
      )
  }

  isFaceDetectionModelLoaded = () => {
    return !!this.getCurrentFaceDetectionNet().params
  }

  getCurrentFaceDetectionNet = () => {
    if (this.selectedFaceDetector === 'SSD_MOBILENETV1') {
      return faceapi.nets.ssdMobilenetv1
    }
    if (this.selectedFaceDetector === 'TINY_FACE_DETECTOR') {
      return faceapi.nets.tinyFaceDetector
    }
    if (this.selectedFaceDetector === 'MTCNN') {
      return faceapi.nets.mtcnn
    }
  }






  render() {
    return (
      <Fragment>
        <div className="App">
          <div className="video-container">
            <video onLoadedMetadata={() => { this.onPlay() }} autoPlay muted playsInline ref={this.videoItemRef}></video>
            <canvas ref={this.canvasItemRef} className="overlay" />
          </div>


        </div>
      </Fragment>
    );
  }
}

export default App;
