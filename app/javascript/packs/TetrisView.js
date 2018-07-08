import React from 'react'
import Square from './Square.js'

export default class TetrisView extends React.Component {
  render() {
    return (
      <div>
        <div>
          {this.props.board.map(row => (
            <div>{row.map(value => <Square filled={value} />)}</div>
          ))}
        </div>
      </div>
    )
  }
}
