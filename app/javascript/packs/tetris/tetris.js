import React from 'react'
import update from 'immutability-helper'
import TetrisView from './TetrisView.js'
import { BoardSquare, DefaultBoard } from './board.js'
import { demoMoveSeeder } from './demo.js'
import { O, T, I, L, S, Z, J } from './shapes.js'

export default class TetrisContainer extends React.Component {
  constructor(props) {
    super(props)
    this.speeds = [1, 2, 4, 6, 8, 10]
    this.startingState = {
      y: 0,
      x: 3,
      rotation: 0,
      piece: T,
      lastMove: Date.now(),
      paused: false,
      finished: false,
      score: 0,
      demo: false,
      demoMoves: [],
      demoTurn: [],
      interval: null,
      speedIndex: 1
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
  }

  setInterval(repeater) {
    const interval = setInterval(() => repeater(), 20)
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
    this.setInterval(this.main)
  }

  startDemo() {
    this.setState(
      {
        ...this.startingState,
        piece: demoMoveSeeder[0].piece,
        demo: true,
        demoMoves: demoMoveSeeder,
        board: new DefaultBoard().board
      },
      () => {
        this.setInterval(this.mainDemo)
        this.demo()
      }
    )
  }

  demo() {
    let moves = this.state.demoMoves[0].moves
    this.setState({ demoMoves: this.state.demoMoves.slice(1), demoTurn: moves })
  }

  makeDemoMove() {
    const move = this.state.demoTurn[0]
    if (move) {
      switch (move) {
        case 'Down':
          this.moveDown()
          break
        case 'Rotate':
          this.rotate()
          break
        case 'Left':
          this.moveLeft()
          break
        case 'Right':
          this.moveRight()
          break
      }
    } else {
      this.moveDown()
    }
    this.setState({ demoTurn: this.state.demoTurn.slice(1) })
  }

  mainDemo = () => {
    if (this.state.paused || this.state.finished) {
      return
    }
    const now = Date.now()
    const timeElapsed = now - this.state.lastMove
    if (timeElapsed > 600 / this.speeds[this.state.speedIndex]) {
      this.makeDemoMove()
    }
  }

  main = () => {
    if (this.state.paused || this.state.finished || !this.state.inProgress) {
      return
    }
    const now = Date.now()
    const timeElapsed = now - this.state.lastMove
    if (timeElapsed > 600 / this.speeds[this.state.speedIndex]) {
      this.moveDown()
    }
  }

  increaseSpeed() {
    const speedIndex =
      this.state.speedIndex === 5
        ? this.state.speedIndex
        : this.state.speedIndex + 1
    this.setState({ speedIndex })
  }

  decreaseSpeed() {
    const speedIndex =
      this.state.speedIndex === 0
        ? this.state.speedIndex
        : this.state.speedIndex - 1
    this.setState({ speedIndex })
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
    if (this.state.demo && this.state.demoMoves[0]) {
      this.setState({
        piece: this.state.demoMoves[0].piece,
        rotation: 0,
        x: 3,
        y: 0
      })
      this.demo()
      return
    }
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
        startDemo={() => this.startDemo()}
        increaseSpeed={() => this.increaseSpeed()}
        decreaseSpeed={() => this.decreaseSpeed()}
      />
    )
  }
}
