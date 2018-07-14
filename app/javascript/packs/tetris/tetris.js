import React from 'react'
import update from 'immutability-helper'
import TetrisView from './TetrisView.js'
import { BoardSquare, DefaultBoard } from './board.js'
import { O, T, I, L, S, Z, J } from './shapes.js'

export default class TetrisContainer extends React.Component {
  constructor(props) {
    super(props)
    this.startingState = {
      y: 0,
      x: 3,
      rotation: 0,
      piece: O,
      lastMove: Date.now(),
      paused: false,
      finished: false,
      score: 0
    }

    this.state = {
      ...this.startingState,
      board: new DefaultBoard().board,
      inProgress: false
    }
  }

  componentDidMount() {
    document.body.addEventListener('keydown', e => {
      if (e.keyCode === 32) {
        this.pause()
      }
      if (!this.state.paused) {
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
      }
    })
    this.setInterval()
  }

  setInterval() {
    const interval = setInterval(() => this.main(), 500)
    this.setState({ interval })
  }

  componentDidUpdate(_prevProps, prevState) {
    if (this.state.finished) {
      clearInterval(this.state.interval)
    }
  }

  pause() {
    this.setState({ paused: !this.state.paused, lastMove: Date.now() })
  }
  start() {
    this.setState({
      inProgress: true,
      ...this.startingState,
      board: new DefaultBoard().board
    })
    this.setInterval()
  }

  main() {
    if (this.state.paused || this.state.finished || !this.state.inProgress) {
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
    this.state.piece.positions[this.state.rotation].forEach(coordinates => {
      const newX = this.state.x + coordinates[0]
      const newY = this.state.y + coordinates[1]
      board[newY][newX].filled = false
      board[newY][newX].color = 'gray'
    })
    this.setState({ board })
  }

  updateBoard(xOffset = 0, yOffset = 0, moved = false) {
    let board = [...this.state.board]
    const x = xOffset + this.state.x
    const y = yOffset + this.state.y
    this.state.piece.positions[this.state.rotation].forEach(coordinates => {
      const newX = x + coordinates[0]
      const newY = y + coordinates[1]
      board[newY][newX].filled = true
      board[newY][newX].color = this.state.piece.color
    })
    const optionalState = moved ? { lastMove: Date.now() } : {}
    this.setState({ board: board, x: x, y: y, ...optionalState })
  }

  setPiece() {
    let board = update(this.state.board, {})
    this.state.piece.positions[this.state.rotation].forEach(coordinates => {
      const newX = this.state.x + coordinates[0]
      const newY = this.state.y + coordinates[1]
      board[newY][newX].filled = true
      board[newY][newX].color = this.state.piece.color
    })

    this.setState({ board })
  }

  clearFilledLines() {
    let board = [...this.state.board]
    let y = 0
    let linesCleared = 0
    for (let line of board) {
      if (line.every(square => square.filled === true)) {
        let y2 = y
        while (y2 > 0) {
          let row = board[y2 - 1].map(square => {
            return new BoardSquare(square.filled, square.color)
          })
          board[y2] = row
          y2--
        }
        board[0].forEach(square => {
          square.filled = false
          square.color = 'gray'
        })
        linesCleared++
      }
      y++
    }
    if (linesCleared > 0) {
      const points = this.calculateScore(linesCleared)
      this.setState({ board, score: this.state.score + points })
    }
  }

  calculateScore(linesCleared) {
    if (linesCleared === 1) {
      return 40
    } else if (linesCleared === 2) {
      return 100
    } else if (linesCleared === 3) {
      return 300
    } else {
      return 1200
    }
  }

  getNextPiece() {
    const pieces = [O, T, I, L, S, Z, J]
    const index = Math.floor(Math.random() * pieces.length)
    const newPiece = pieces[index]
    this.setState({ piece: newPiece, rotation: 0, x: 3, y: 0 })
  }

  checkOver() {
    if (this.state.board[0].some(square => square.filled === true)) {
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
      return this.state.board[newY][newX].filled
    })
  }

  moveRight() {
    this.undraw()
    if (
      !this.collision(
        this.state.x + 1,
        this.state.y,
        this.state.piece.positions[this.state.rotation]
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
        this.state.piece.positions[this.state.rotation]
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
        this.state.piece.positions[this.state.rotation]
      )
    ) {
      this.updateBoard(0, 1, true)
    } else {
      this.setPiece()
      this.clearFilledLines()
      this.checkOver()
      if (!this.state.finished) {
        this.getNextPiece()
        this.updateBoard()
      }
    }
  }

  rotate() {
    const newRotation =
      (this.state.rotation + 1) % this.state.piece.positions.length
    this.undraw()
    if (
      this.collision(
        this.state.x,
        this.state.y,
        this.state.piece.positions[newRotation]
      )
    ) {
      this.updateBoard()
      return false
    }
    this.setState({ rotation: newRotation })
    this.updateBoard()
  }

  render() {
    return (
      <TetrisView
        {...this.state}
        pause={() => this.pause()}
        start={() => this.start()}
      />
    )
  }
}
