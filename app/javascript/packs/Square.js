import React from 'react'

const Square = props => {
  const squareType = () => {
    let className = 'square empty'
    if (props.filled) {
      className = 'square filled'
    }
    return className
  }
  return <span className={squareType()} />
}

export default Square
