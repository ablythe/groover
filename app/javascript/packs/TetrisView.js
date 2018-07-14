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
        <button onClick={this.props.pause}>Pause</button>
      </React.Fragment>
    )
  }
}
