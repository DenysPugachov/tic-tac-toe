import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

// receive value from the Board & passes value back => Square = Controlled component
function Square(props) {
  return (
    <button className={"square " + (props.isWinSquare ? "square--win" : null)}
      onClick={props.onClick}>
      {props.value}
    </button>
  )
}

function Board(props) {
  const renderSquare = (i) => {
    return (
      <Square
        value={props.squares[i]}
        onClick={() => props.onClick(i)}
        isWinSquare={props.winSquaresLine.includes(i)}
      />
    )
  }
  const renderBoard = (colsNum, rowsNum) => {
    let boardSquaresArr = []
    for (let r = 0; r < rowsNum; r++) {
      let boardRowsArr = []
      for (let c = 0; c < colsNum; c++) {
        boardRowsArr.push(<span key={(r * colsNum) + c}>{renderSquare((r * colsNum) + c)}</span>);
      }
      boardSquaresArr.push(<div className="board-row" key={r}>{boardRowsArr}</div>);
    }
    return boardSquaresArr
  }
  return (
    <div>
      {renderBoard(3, 3)}
    </div>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      isMovesListDescending: false,
    }
  }

  handleClick(i) {
    //[col, row]
    const locations = [
      [1, 1],
      [2, 1],
      [3, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3]
    ];
    const history = this.state.history.slice(0, this.state.stepNumber + 1)//if “go back in time” => delete “future” history that would now become incorrect
    const current = history[history.length - 1]
    const squares = [...current.squares] // bug {...arr} => {} 

    if (calculateWinner(squares) || squares[i]) { return }

    squares[i] = this.state.xIsNext ? "X" : "O"

    this.setState({
      history: history.concat([{
        squares,
        location: locations[i]
      }]),
      stepNumber: history.length,// ensures we don’t get stuck showing the same move after a new one has been made
      xIsNext: !this.state.xIsNext
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0, //:bool
    })
  }

  sortMovesList() {
    this.setState({ isMovesListDescending: !this.state.isMovesListDescending })
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winnerObj = calculateWinner(current.squares)

    const moves = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move} => ${history[move].location} (col, row)`
        : "Go to game start"
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber
              ? <b>{desc}</b>
              : desc}
          </button>
        </li>
      )
    })

    let status
    if (winnerObj) {
      status = `Winner: ${winnerObj.winner}`
      // } else if (!current.squares.includes("x")) {// bug: => drawn from start on game
    } else if (this.state.stepNumber === 9) {// 9 => all squares is filled
      status = "The game is drawn."
    } else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"} `;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winSquaresLine={winnerObj ? winnerObj.winLine : []}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <hr></hr>
          <label>Sort by:</label>
          <button
            onClick={() => this.sortMovesList()} >
            {this.state.isMovesListDescending ? "Ascending" : "Descending"}
          </button>
          <ul>
            {this.state.isMovesListDescending ? moves.reverse() : moves}
          </ul>
        </div>
      </div >
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winLine: [a, b, c] }
    }
  }
  return null;
}
