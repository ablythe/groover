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
      <div id="gameboard">
        {this.props.board.map(row => (
          <div>{row.map(value => <Square filled={value} />)}</div>
        ))}
        {this.notificationBar()}
      </div>
    )
  }
}
