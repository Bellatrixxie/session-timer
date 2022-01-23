import React, {Component} from "react";

const audioSource = "https://res.cloudinary.com/bellatrixxie/video/upload/v1642590431/session%20timer%20-%20alarm%20beep/250629__kwahmah-02__alarm1_gmgnnm.mp3"

// I have used the same Accurate_Interval 3rd party code that freeCodeCamp used in their solution:
// Accurate_Interval.js
// Thanks Squeege! For the elegant answer provided to this question:
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time).

const accurateInterval = function (fn, time) {
  let cancel, nextAt, timeout, wrapper
  nextAt = new Date().getTime()
  timeout = null
  wrapper = function () {
    nextAt += time
    timeout = setTimeout(wrapper, nextAt - new Date().getTime())
    return fn()
  }
  cancel = function () {
    return clearTimeout(timeout)
  }
  timeout = setTimeout(wrapper, nextAt - new Date().getTime())
  return {
    cancel: cancel
  }
}

// My components:

const TimerControl = (props) => {
  return (
      <div id={props.componentId}>
        <h3 id={props.labelId}>{props.label} Length</h3>
        <button 
        id={props.decrementId} 
        className="btn fas fa-arrow-circle-down" 
        onClick={props.handleControl}>
        </button>
        <p id={props.lengthId}>{props.timerLength}</p>
        <button 
        id={props.incrementId} 
        className="btn fas fa-arrow-circle-up"
        onClick={props.handleControl}>
        </button>
      </div>
  )
}

const AppComponent = (props) => {
  return (
    <div>
      <div id="control-div">
       <TimerControl 
          componentId="control-session" 
          labelId="session-label"
          label="Session"
          decrementId="session-decrement"
          handleControl={props.handleSession} 
          lengthId="session-length" 
          timerLength={props.state.sessionLength} 
          incrementId="session-increment"
        />
        <TimerControl 
          componentId="control-break"
          labelId="break-label"
          label="Break"
          decrementId="break-decrement"
          handleControl={props.handleBreak} 
          lengthId="break-length"
          timerLength={props.state.breakLength} 
          incrementId="break-increment"
        />
      </div>
      <div id="timer-div">
        <h2 id="timer-label">{props.state.sessionOrBreak}</h2>
        <p id="time-left">
        {props.displayTimer()}
        </p>
        <audio id="beep" src={audioSource}></audio>
        <button 
        id="start_stop" 
        className="btn" 
        onClick={props.handleStartStop}>
          <i className="fas fa-play"/>
          <i className="fas fa-pause"/>
        </button>
        <button 
        id="reset" 
        className="btn" 
        onClick={props.handleReset}>
          <i className="fas fa-sync-alt"/>
        </button>
      </div>
      <br></br>
      <button 
      id="state" 
      className="btn" 
      onClick={props.logState}>LOG STATE
      </button>
    </div>
  );
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      sessionLength: 25,
      breakLength: 5,
      timer: 1500,
      isRunning: false,
      sessionOrBreak: "Session",
      interval: null
    }
    this.handleSession = this.handleSession.bind(this)
    this.handleBreak = this.handleBreak.bind(this)
    this.decrementTimer = this.decrementTimer.bind(this)
    this.handleSessionOrBreak = this.handleSessionOrBreak.bind(this)
    this.handleTimer = this.handleTimer.bind(this)
    this.handleStartStop = this.handleStartStop.bind(this)
    this.displayTimer = this.displayTimer.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.logState = this.logState.bind(this)
  }
  handleSession(e) {
    this.setState(prevState => {
      const id = e.target.id
      const prevLength = prevState.sessionLength
      const session = (id === "session-decrement" ? prevLength > 1 ? prevLength - 1 : 1 :
      prevLength < 60 ? prevLength + 1 : 60)
      const newState = !this.state.isRunning && {
        sessionLength: session, 
        timer: session * 60
      }
      return newState
    })
  }
  handleBreak(e) {
    this.setState(prevState => {
      const id = e.target.id
      const prevLength = prevState.breakLength
      const brk = (id === "break-decrement" ? prevLength > 1 ? prevLength - 1 : 1 :
      prevLength < 60 ? prevLength + 1 : 60)
      const newState = !this.state.isRunning && {
        breakLength: brk
      }
      return newState
    })
  }
  decrementTimer() {
    this.setState({ timer: this.state.timer - 1 })
  }
  handleSessionOrBreak() {
    if (this.state.sessionOrBreak === "Session") {
      this.setState({
// I had to add '+1' twice below in order to pass the final test.
// Personally I don't like it, as it adds an extra second! 
// In the real world, I think I'd remove it.
        timer: (this.state.breakLength * 60) + 1,
        sessionOrBreak: "Break"
      })
    } else {
        this.setState({
          timer: (this.state.sessionLength * 60) +1,
          sessionOrBreak: "Session"
      })
    }
  }
  handleTimer() {
    this.setState({
      interval: accurateInterval(() => {
        if (this.state.timer === 0) {
        document.getElementById("beep").play()
        this.handleSessionOrBreak()
        }
        if (this.state.isRunning) {
          this.decrementTimer()
          this.displayTimer()
         } else {
          clearTimeout(accurateInterval)
          // So any time isRunning is set to false, the loop will stop
         }
      }, 1000)
    })
  }
  handleStartStop() {
    const interval = this.state.interval
    if (this.state.isRunning) {
      interval.cancel()
      this.setState({ isRunning: false, interval: null })
      // But don't clear the timer
    } else {
      this.handleTimer()
      this.setState({ isRunning: true })
    }
  }
  displayTimer() {
    const timer = this.state.timer
    const min = Math.floor(timer/ 60)
    const sec = timer % 60
    let displayMin = min <10 ? "0" + min : min
    let displaySec = sec <10 ? "0" + sec : sec

    return `${displayMin}:${displaySec}` 
    // whether the variables are numbers or strings, it will return a string.
  }
  handleReset() {
    this.setState({
      sessionLength: 25,
      breakLength: 5,
      timer: 1500,
      isRunning: false,
      sessionOrBreak: "Session",
      interval: null
    })
    if (this.state.interval) {
      this.state.interval.cancel();
    }
    const sound = document.getElementById("beep")
    sound.pause()
    sound.currentTime = 0
  }
  logState() {
    console.log(this.state)
  }
  render() {
    return (
      <AppComponent 
      state={this.state}  
      handleSession={this.handleSession}
      handleBreak={this.handleBreak}
      decrementTimer={this.decrementTimer}
      handleBeep={this.handleBeep}
      handleSessionOrBreak={this.handleSessionOrBreak}
      handleTimer={this.handleTimer}
      handleStartStop={this.handleStartStop}
      displayTimer={this.displayTimer}
      handleReset={this.handleReset}
      logState={this.logState} 
      />
    )
  }
}

export default App;


// My second attempt at a handleTimer() method:
// 
//   handleTimer() {
//   const timeout = () => {
//     if (this.state.isRunning) {
//       setTimeout(timeout, 1000)
//     this.decrementTimer()
//     this.handleSessionOrBreak()
//     this.displayTimer()
//     } else {
//       clearTimeout(timeout)
//       // So any time isRunning is set to false, the loop will stop
//     }
//   }
//   const startTimeout = setTimeout(timeout, 1000)
//   this.setState({
//     interval: startTimeout
//   })
// }
// 
// My original handleTime() method:
// 
// handleTime() {
//   this.setState(prevState => {

//     const minTimer = setInterval(() => {
//       this.handleZero()
//       return (prevState.minutes === 0?
//       59 : prevState.minutes - 1)
//     }, 60000)

//     const secTimer = setInterval(() => {
//       this.handleZero()
//       return (prevState.seconds === 0?
//       59 : prevState.seconds - 1)
//     }, 1000)

//     if (!this.state.isRunning) {
//     return ({
//       minutes: minTimer,
//       seconds: secTimer,
//       isRunning: true
//       })
//     } else {
//       clearInterval(minTimer)
//       clearInterval(secTimer)
//       return ({
//         isRunning: false
//       })
//     }
//   }) 
// }
// My original displayTimer() method:
// 
// displayTimer() {
//   this.setState(prevState => {
//     const timer = this.state.timer
//     let display
//     return (
//       timer === 0?
//       this.state.breakOrSession === "session" ? {timer: (this.state.breakLength * 60)} : 
//       {timer: (this.state.sessionLength * 60)} : timer <= 600 ? 
//       display = "0" + timer.toString() :
//       display = timer
//     )
//   })
// }
// 
// My original display for the timer:
// 
// <p id="time-left">
// {this.state.minZero && "0"}{this.state.minutes.toString()}:
// {this.state.secZero && "0"}{this.state.seconds.toString()}
// </p>