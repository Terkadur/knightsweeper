var rows = 16
var cols = 30
var len = 32
var mines = 99
var cells = []
var x
var y
var i
var j
var revealed = 0
var flagged = 0
var images = []
var nums = []
var time = 0
var temptime
var gameState = 0
var board_width = 26
var board_height = 46
var effect = [
  //MINESWEEPER
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1]
  //KNIGHTSWEEPER
  //[-1, -2], [1, -2], [2, -1],
  //[2,  1],          [1,  2],
  //[-1,  2], [-2,  1], [-2,  -1]
             ]

//LOAD IMAGES
function preload() {
  sheet = loadImage("images/cells.png")
  count = loadImage("images/numbers.png")
}

function setup() {
  createCanvas(cols * len, 64 + rows * len)
  
  //CREATE CELLS
  for (x = 0; x < cols; x++) {
    cells[x] = []
    for (y = 0; y < rows; y++) {
      cells[x][y] = new Cell(x, y, 0)
    }
  }
  
  //GET IMAGES
  x = 0
  y = 0
  while (true) {
    images[4 * y + x] = sheet.get(32 * x, 32 * y, 32, 32)
    x++
    if (x == 4) {
      x = 0
      y++
    }
    if (y == 3 && x == 2) {
      break
    }
  }
  for (x = 0; x <= 10; x++) {
    nums[x] = count.get(board_width * x, 0, board_width, board_height)
  }
  temptime = second()
}

function draw() {
  //DRAW COUNTERS
  board(9, 9, mines - flagged)
  board(width - 87, 9, time)
  
  translate(0, 64)
  if (gameState == 0) {
    if (revealed == rows * cols - mines && flagged == mines) {
      gameState = 2
      console.log("WINNER")
      for (x = 0; x < cols; x++) {
        for (y = 0; y < rows; y++) {
          cells[x][y].show()
        }
      }
    }
    else {
      for (x = 0; x < cols; x++) {
        for (y = 0; y < rows; y++) {
          cells[x][y].show()
          //KEEP TIME
          if (temptime != second()) {
            temptime = second()
            if (time < 999 && revealed >= 1) {
              time++
            }
          }
          //BLANKS REVEAL NEIGHBORS
          if (cells[x][y].state == 2) {
            if (cells[x][y].mine == false) {
              if (cells[x][y].cellVal() == 0) {
                revealNeighbors()
              }
            }
          }
        }
      }
    }
  }
}

//REMOVE RIGHT CLICK
document.oncontextmenu = function() {
  return false;
}

function mousePressed() {
  x = floor(mouseX / len)
  y = floor(mouseY / len) - 2
  if (mouseButton === LEFT) {
    if (cells[x][y].state == 0) {
      cells[x][y].state = 2
      revealed++
      
      if (revealed == 1) {
        plant()
      }
    }
    else if (cells[x][y].state == 2) {
      revealNeighbors()
    }
  }
  else if (mouseButton === RIGHT) {
    if (cells[x][y].state == 0) {
      fill(0)
      cells[x][y].state = 1
      flagged++
    }
    else if (cells[x][y].state == 1) {
      cells[x][y].state = 0
      flagged--
    }
    else if (cells[x][y].state == 2) {
      flagNeighbors()
    }
  }
}

function Cell(x, y) {
  this.x = x
  this.y = y
  this.mine = false
  this.state = 0
  this.show = function() {
    if (gameState != 1) {
      if (this.state <= 1) {
        image(images[this.state], this.x * len, this.y * len, len, len)
      }
      else {
        if (this.mine == true) {
          image(images[12], x * len, y * len, len, len)
          gameState = 1
          lose()
        }
        if (this.mine == false) {
          if (this.cellVal() == 0) {
            image(images[3], this.x * len, this.y * len, len, len)
            revealNeighbors()
          }
          else {
            for (i = 1; i <= 8; i++) {
              if (this.cellVal() == i) {
                image(images[i + 3], this.x * len, this.y * len, len, len)
              }
            }
          }
        }
      }
    }
  }
  this.cellVal = function() {
    this.val = 0
    for (j in effect) {
      if (typeof cells[effect[j][0] + this.x] != "undefined") {
        if (typeof cells[effect[j][0] + this.x][effect[j][1] + this.y] != "undefined") {
          if (cells[effect[j][0] + this.x][effect[j][1] + this.y].mine == true) {
            this.val++
          }
        }
      }
    }
    return this.val
  }
}
function board(x, y, val) {
  if (val <= 999) {
    if (val >= 0) {
      image(nums[floor(val/100)], x, y, board_width, board_height)
    }
    else {
      image(nums[10], x, y, board_width, board_height)
      val *= -1
    }
    image(nums[floor((val % 100)/10)], x + board_width, y, board_width, board_height)
    image(nums[val % 10], x + 2 * board_width, y, board_width, board_height)
  }
}

function lose() {
  console.log("lose")
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      if (cells[i][j].mine == true && cells[i][j].state == 0) {
        image(images[2], i * len, j * len, len, len)
      }
      else if (cells[i][j].mine == false && cells[i][j].state == 1) {
        image(images[13], i * len, j * len, len, len)
      }
    }
  }
}
function plant() {
  revealNeighbors()
  var mine = 0
  while (mine < mines) {
    x = floor(random(0, cols))
    y = floor(random(0, rows))
    if (cells[x][y].mine == false && cells[x][y].state == 0) {
      cells[x][y].mine = 1
      mine++
    }
  }
}
function revealNeighbors() {
  for (i in effect) {
    if (typeof cells[effect[i][0] + x] != "undefined") {
      if (typeof cells[effect[i][0] + x][effect[i][1] + y] != "undefined") {
        if (cells[effect[i][0] + x][effect[i][1] + y].state == 0) {
          cells[effect[i][0] + x][effect[i][1] + y].state = 2
          revealed++
        }
      }
    }
  }
}
function flagNeighbors() {
  for (i in effect) {
    if (typeof cells[effect[i][0] + x] != "undefined") {
      if (typeof cells[effect[i][0] + x][effect[i][1] + y] != "undefined") {
        if (cells[effect[i][0] + x][effect[i][1] + y].state == 0) {
          cells[effect[i][0] + x][effect[i][1] + y].state = 1
          flagged++
        }
      }
    }
  }
}
