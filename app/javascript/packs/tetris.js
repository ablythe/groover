import React from 'react'
import update from 'immutability-helper'
import TetrisView from './TetrisView.js'
import { O, T, I, L, S, Z } from './shapes.js'

export default class TetrisContainer extends React.Component {
  constructor(props) {
    super(props)
    const defaultBoard = [
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false]
    ]

    this.state = {
      board: defaultBoard,
      y: 0,
      x: 3,
      rotation: 0,
      piece: Z,
      lastMove: Date.now(),
      paused: false,
      finished: false
    }
  }

  componentDidMount() {
    document.body.addEventListener('keydown', e => {
      if (e.keyCode === 40) {
        this.moveDown()
      }
      if (e.keyCode === 39) {
        this.moveRight()
      }
      if (e.keyCode === 37) {
        this.moveLeft()
      }
      if (e.keyCode === 38) {
        this.rotate()
      }
      if (e.keyCode === 32) {
        this.pause()
      }
    })
    const interval = setInterval(() => this.main(), 1000)
    this.setState({ interval })
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.piece !== this.state.piece) {
      return
    }
    if (this.state.finished) {
      clearInterval(this.state.interval)
      console.log('finished')
    }
  }

  pause() {
    this.setState({ paused: !this.state.paused, lastMove: Date.now() })
  }

  rotate() {
    const newRotation = (this.state.rotation + 1) % this.state.piece.length
    this.undraw()
    if (
      this.collision(this.state.x, this.state.y, this.state.piece[newRotation])
    ) {
      return false
    }
    this.setState({ rotation: newRotation })
    this.updateBoard()
  }

  main() {
    if (this.state.paused || this.state.finished) {
      return
    }
    const now = Date.now()
    const timeElapsed = now - this.state.lastMove
    if (timeElapsed > 1000) {
      this.moveDown()
    }
  }

  undraw() {
    let board = [...this.state.board]
    this.state.piece[this.state.rotation].forEach(coordinates => {
      const newX = this.state.x + coordinates[0]
      const newY = this.state.y + coordinates[1]
      board[newY][newX] = false
    })
    this.setState({ board })
  }

  updateBoard(xOffset = 0, yOffset = 0) {
    let board = [...this.state.board]
    const x = xOffset + this.state.x
    const y = yOffset + this.state.y
    this.state.piece[this.state.rotation].forEach(coordinates => {
      const newX = x + coordinates[0]
      const newY = y + coordinates[1]
      board[newY][newX] = true
    })

    this.setState({ board: board, x: x, y: y, lastMove: Date.now() })
  }

  setPiece() {
    let board = update(this.state.board, {})
    this.state.piece[this.state.rotation].forEach(coordinates => {
      const newX = this.state.x + coordinates[0]
      const newY = this.state.y + coordinates[1]
      board[newY][newX] = true
    })

    this.setState({ board })
  }

  emptyRow() {
    return [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]
  }

  clearFilledLines() {
    let board = [...this.state.board]
    let y = 0
    let linesToAdd = 0
    for (let line of board) {
      if (line.every(square => square === true)) {
        let y2 = y
        while (y2 > 0) {
          board[y2] = [...board[y2 - 1]]
          y2--
        }
        board[0].fill(false)
        linesToAdd++
      }
      y++
    }
    if (linesToAdd > 0) {
      this.setState({ board })
    }
  }

  getNextPiece() {
    const pieces = [O, T, I, L, S, Z]
    const index = Math.floor(Math.random() * pieces.length)
    const newPiece = pieces[index]
    this.setState({ piece: newPiece, rotation: 0, x: 3, y: 0 })
  }

  checkOver() {
    if (this.state.board[0].some(square => square === true)) {
      this.setState({ finished: true })
    }
  }

  collision(x, y, piece) {
    return piece.some(coordinates => {
      const newX = x + coordinates[0]
      const newY = y + coordinates[1]
      if (newY > 19) {
        return true
      }
      if (newX > this.state.board[0].length - 1) {
        return true
      }
      if (newX < 0) {
        return true
      }
      return this.state.board[newY][newX]
    })
  }

  moveRight() {
    this.undraw()
    if (
      !this.collision(
        this.state.x + 1,
        this.state.y,
        this.state.piece[this.state.rotation]
      )
    ) {
      this.updateBoard(1, 0)
    } else {
      this.updateBoard()
    }
  }

  moveLeft() {
    this.undraw()
    if (
      !this.collision(
        this.state.x - 1,
        this.state.y,
        this.state.piece[this.state.rotation]
      )
    ) {
      this.updateBoard(-1, 0)
    } else {
      this.updateBoard()
    }
  }

  moveDown() {
    this.undraw()
    if (
      !this.collision(
        this.state.x,
        this.state.y + 1,
        this.state.piece[this.state.rotation]
      )
    ) {
      this.updateBoard(0, 1)
    } else {
      this.setPiece()
      this.clearFilledLines()
      this.checkOver()
      this.getNextPiece()
      this.updateBoard()
    }
  }

  render() {
    return <TetrisView board={this.state.board} />
  }
}
