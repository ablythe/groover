import React from 'react'
import Square from './Square.js'

export default class TetrisView extends React.Component {
  notificationBar() {
    if (!this.props.paused && !this.props.finished) {
      return
    }
    let message = this.props.paused ? 'Paused' : 'Game Over'

    return <span id="notificationBar">{message}</span>
  }
  speed() {
    if (this.props.speedIndex === 0) {
      return '0.5x'
    } else {
      return `${this.props.speedIndex}x`
    }
  }
  render() {
    return (
      <React.Fragment>
        <span id="score">Score: {this.props.score}</span>
        <div id="gameboard">
          {this.props.board.map((row, rowIndex) => (
            <div key={rowIndex}>
              {row.map((square, columnIndex) => (
                <Square
                  key={`${rowIndex}${columnIndex}`}
                  color={square.color}
                />
              ))}
            </div>
          ))}
          {this.notificationBar()}
        </div>
        <button onClick={this.props.start}>Start</button>
        <button onClick={this.props.startDemo}>Demo</button>
        <button onClick={this.props.pause}>Pause</button>
        <div>
          Speed:{this.speed()}
          <button onClick={this.props.decreaseSpeed}>-</button>
          <button onClick={this.props.increaseSpeed}>+</button>
        </div>
      </React.Fragment>
    )
  }
}
