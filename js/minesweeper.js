//global variables
var gBoard
var gBoardSize
var gMinesCount
var gTimer
var gCountdown = 0
var gIsOn = false



const CELL_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked",
}
const LEVEL_STATUSES = {
  BEGINNER: "BEGINNER",
  MEDIUM: "MEDIUM",
  EXPERT: "EXPERT",
}
const LEVELS = {
  BEGINNER: {
    BOARD_SIZE: 4,
    NUMBER_OF_MINES: 2,
  },
  MEDIUM: {
    BOARD_SIZE: 8,
    NUMBER_OF_MINES: 12,
  },
  EXPERT: {
    BOARD_SIZE: 12,
    NUMBER_OF_MINES: 30,
  },
}

//selectors
const LEVELSELECTION = document.querySelector("#level-selection")
const LEVELSELECTIONDIV = document.querySelector(".level-selection-div")
const TIMERDIV = document.querySelector(".timer-div")
const TIMER = document.querySelector("#timer")

const STARTBUTTON = document.querySelector("#start-btn")
const ELBOARD = document.querySelector(".board")
const ELTEXT = document.querySelector(".subtext")


function init() {
  gBoard = createBoard(
    LEVELS.BEGINNER.BOARD_SIZE,
    LEVELS.BEGINNER.NUMBER_OF_MINES
  )
  gBoardSize = LEVELS.BEGINNER.BOARD_SIZE
  gMinesCount = LEVELS.BEGINNER.NUMBER_OF_MINES
}
//the gameboard arrives after clicking the create board button
STARTBUTTON.addEventListener("click", () => {
  gBoard.forEach((row) => {
    row.forEach((cell) => {
      ELBOARD.append(cell.element)
      cell.element.addEventListener("click", () => {
        revealCell(gBoard, cell)
        checkGameEnd()
      })
      cell.element.addEventListener("contextmenu", (e) => {
        e.preventDefault()
        markCell(cell)
      })
    })
  })
  ELBOARD.style.setProperty("--size", gBoardSize)

  LEVELSELECTIONDIV.style.display = "none"
})


//then if the user changes the level value he can create a new board
LEVELSELECTION.onchange = () => {
  if (LEVELSELECTION.value == LEVEL_STATUSES.BEGINNER) {
    gBoard = createBoard(
      LEVELS.BEGINNER.BOARD_SIZE,
      LEVELS.BEGINNER.NUMBER_OF_MINES
    );
    gBoardSize = LEVELS.BEGINNER.BOARD_SIZE;
    gMinesCount = LEVELS.BEGINNER.NUMBER_OF_MINES;
  }
  if (LEVELSELECTION.value == LEVEL_STATUSES.MEDIUM) {
    gBoard = createBoard(
      LEVELS.MEDIUM.BOARD_SIZE,
      LEVELS.MEDIUM.NUMBER_OF_MINES
    );
    gBoardSize = LEVELS.MEDIUM.BOARD_SIZE;
    gMinesCount = LEVELS.MEDIUM.NUMBER_OF_MINES;
  }
  if (LEVELSELECTION.value == LEVEL_STATUSES.EXPERT) {
    gBoard = createBoard(
      LEVELS.EXPERT.BOARD_SIZE,
      LEVELS.EXPERT.NUMBER_OF_MINES
    );
    gBoardSize = LEVELS.EXPERT.BOARD_SIZE;
    gMinesCount = LEVELS.EXPERT.NUMBER_OF_MINES;
  }
}

//To create a board we need this function
function createBoard(boardSize, numberOfMines) {
  const BOARD = []
  const MINEPOSITIONS = getMinePositions(boardSize, numberOfMines)

  for (var x = 0; x < boardSize; x++) {
    const ROW = []
    for (var y = 0; y < boardSize; y++) {
      const ELEMENT = document.createElement("div")
      ELEMENT.dataset.status = CELL_STATUSES.HIDDEN

      const CELL = {
        element: ELEMENT,
        x,
        y,
        mine: MINEPOSITIONS.some(positionMatch.bind(null, { x, y })),
        get status() {
          return this.element.dataset.status
        },
        set status(value) {
          this.element.dataset.status = value
        }
      }

      ROW.push(CELL)
    }
    BOARD.push(ROW)
  }

  return BOARD
}

// This function marks the cell with a flag works on a right click

function markCell(cell) {
  if (
    cell.status !== CELL_STATUSES.HIDDEN &&
    cell.status !== CELL_STATUSES.MARKED
  ) {
    return
  }

  if (cell.status === CELL_STATUSES.MARKED) {
    cell.status = CELL_STATUSES.HIDDEN
    cell.element.removeChild(cell.element.childNodes[0])
  } else {
    cell.status = CELL_STATUSES.MARKED;
    const FLAGIMAGE = document.createElement("img")
    FLAGIMAGE.src = "img/flag.png"
    FLAGIMAGE.style.width = "65px"

    cell.element.appendChild(FLAGIMAGE)
  }
}

setInterval(() => {
  if (!gIsOn || ELTEXT.textContent != "") return
  TIMER.innerText = `${gCountdown++} sec`
}, 1000)

///this function responds on a left click to reveal a cell
function revealCell(board, cell) {
  gIsOn = true
  TIMERDIV.style.display = "block"

  //
  if (cell.status !== CELL_STATUSES.HIDDEN) {
    return
  }

  if (cell.mine) {
    cell.status = CELL_STATUSES.MINE
    const MINEIMAGE = document.createElement("img")
    MINEIMAGE.src = "img/mine.png"
    MINEIMAGE.style.width = "65px"

    cell.element.appendChild(MINEIMAGE)
    return
  }

  cell.status = CELL_STATUSES.NUMBER;
  const ADJACENTCELLS = neighborCells(board, cell)
  const MINES = ADJACENTCELLS.filter((c) => c.mine)
  if (MINES.length === 0) {
    ADJACENTCELLS.forEach(revealCell.bind(null, board))
  } else {
    cell.element.textContent = MINES.length
    if (MINES.length == 1) {
      cell.element.style.color = "blue"
    }
    if (MINES.length == 2) {
      cell.element.style.color = "green"
    }
    if (MINES.length > 2) {
      cell.element.style.color = "purple"
    }
  }
}
///necessary logic functions
//checks if the win conditions are met

function checkWin(board) {
  return board.every((row) => {
    return row.every((cell) => {
      return (
        cell.status === CELL_STATUSES.NUMBER ||
        (cell.mine &&
          (cell.status === CELL_STATUSES.HIDDEN ||
            cell.status === CELL_STATUSES.MARKED))
      )
    })
  })
}

//checks if the lose conditions are met

function checkLose(board) {
  return board.some((row) => {
    return row.some((cell) => {
      return cell.status === CELL_STATUSES.MINE
    })
  })
}

//checks for the game win or lose conditions
function checkGameEnd() {
  var win = checkWin(gBoard)
  var lose = checkLose(gBoard)

  if (win || lose) {
    ELBOARD.addEventListener("click", stopProp, { capture: true })
    ELBOARD.addEventListener("contextmenu", stopProp, { capture: true })
  }

  if (win) {
    ELTEXT.textContent = "You Win"
  }
  if (lose) {
    ELTEXT.textContent = "You Lose"
    gBoard.forEach((row) => {
      row.forEach((cell) => {
        if (cell.status === CELL_STATUSES.MARKED) markCell(cell)
        if (cell.mine) revealCell(gBoard, cell)
      })
    })
  }
}

//stops the right click and left click after the game has ended
function stopProp(event) {
  event.stopImmediatePropagation()
}

//checks the board for mine positions

function getMinePositions(boardSize, numberOfMines) {
  const POSITIONS = []

  while (POSITIONS.length < numberOfMines) {
    const POSITION = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    };

    if (!POSITIONS.some(positionMatch.bind(null, POSITION))) {
      POSITIONS.push(POSITION)
    }
  }

  return POSITIONS
}

function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y
}

function randomNumber(size) {
  return Math.floor(Math.random() * size)
}

//checks the nearby cells
function neighborCells(board, { x, y }) {
  const CELLS = []

  for (var xOffset = -1; xOffset <= 1; xOffset++) {
    for (var yOffset = -1; yOffset <= 1; yOffset++) {
      const CELL = board[x + xOffset]?.[y + yOffset]
      if (CELL) CELLS.push(CELL)
    }
  }

  return CELLS
}
