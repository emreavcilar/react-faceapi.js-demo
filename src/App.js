import React, { Component, Fragment } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

class App extends Component {
  withBoxes = true;

  videoItemRef = React.createRef();
  canvasItemRef = React.createRef();

  componentDidMount() {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(this.startVideo)

  }

  startVideo = () => {
    navigator.getUserMedia(
      { video: {} },
      stream => this.videoItemRef.current.srcObject = stream,
      err => console.error(err)
    )
  }

  async onPlay() {

    if (this.videoItemRef.current.paused || this.videoItemRef.current.ended) {
      return setTimeout(() => this.onPlay())
    }

    // const result = await faceapi.detectAllFaces(this.videoItemRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    const result = await faceapi.detectAllFaces(this.videoItemRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    
    if (result) {
      const dims = faceapi.matchDimensions(this.canvasItemRef.current, this.videoItemRef.current, true)

      const resizedResult = faceapi.resizeResults(result, dims)
      const minConfidence = 0.05
      if (this.withBoxes) {
        faceapi.draw.drawDetections(this.canvasItemRef.current, resizedResult)
        faceapi.draw.drawFaceLandmarks(this.canvasItemRef.current,resizedResult)
        faceapi.draw.drawFaceExpressions(this.canvasItemRef.current, resizedResult)
      }
      faceapi.draw.drawFaceExpressions(this.canvasItemRef.current, resizedResult, minConfidence)
      faceapi.draw.drawFaceLandmarks(this.canvasItemRef.current,resizedResult, minConfidence)
      faceapi.draw.drawFaceExpressions(this.canvasItemRef.current, resizedResult, minConfidence)
    }
    setTimeout(() => this.onPlay())
  }

  render() {
    return (
      <Fragment>
        <div className="App">
          <div className="video-container">
            <video onLoadedMetadata={ () => { this.onPlay() }} autoPlay muted playsInline ref={this.videoItemRef}></video>
            <canvas ref={this.canvasItemRef} className="overlay" />
          </div>


        </div>
      </Fragment>
    );
  }
}

export default App;
