const canvas = document.getElementById("tetris");
// gives the canvas 2d attributes
const context = canvas.getContext("2d");
//blows up the 1 by 1 to 2000%
context.scale(20, 20);

// fills the 2d canvas with black
context.fillStyle = "#000";
//location to start fill and width and height of fill
context.fillRect(0, 0, canvas.width, canvas.height);

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  //loops through the rows of matrix
  for (let y = 0; y < m.length; ++y) {
    //loops through the column of matrix
    for (let x = 0; x < m[y].length; ++x) {
      //checks if the player matrix doesnt have 0s
      if (
        m[y][x] !== 0 &&
        //checks if the arena has a  a row based on
        //player position if there is no row it will be undefined
        //not which is also !==0
        (arena[y + o.y] &&
          //checks if the arena has column and if
          //the column dont == 0
          //checks the sides which will be undefined or the
          //another shape that will have ones.
          arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }

  return false;
}

// creates an h amount of arrays filled with w amount of 0s
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "T") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ];
  } else if (type === "O") {
    return [
      [2, 2],
      [2, 2]
    ];
  } else if (type === "L") {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ];
  } else if (type === "J") {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ];
  } else if (type === "I") {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0]
    ];
  } else if (type === "S") {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ];
  } else if (type === "Z") {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ];
  }
}

function draw() {
  //clear old position first
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  //then draw new position
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

// iterates row by row all the x values seeking for
//non os if it is a non 0 then a red rectangle is drawn at the x index
//plus offset of y to creat the location for a 1 by 1 pixel to be drawn
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

//iterates through the players matrix(the shape)
//and merges it to the arenas table.
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}
//unpack
function arenaSweep() {
  let rowCount = 1;
  //iterate through the arena rows atarting at the bottom
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      //checks each rows columns for 0s if there is a 0
      //then go to the next row up and repeat
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    //creates an empty row filled with 0s at the index 0f y.
    const row = arena.splice(y, 1)[0].fill(0);
    //adds the row of zeros to the top
    arena.unshift(row);

    //because we removed a y index we have to add the index back
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = "ILJOTSZ";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

//need to unpack exactly how this works
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    console.log(offset);
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => {
      row.reverse();
    });
  } else {
    matrix.reverse();
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
  //need a differential of time
  const deltaTime = time - lastTime;
  //
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    player.pos.y++;
    dropCounter = 0;
  }

  draw();
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }

  requestAnimationFrame(update);
}
function updateScore() {
  document.getElementById("score").innerText = player.score;
}
const colors = [
  null,
  "red",
  "blue",
  "violet",
  "green",
  "purple",
  "orange",
  "pink"
];

const arena = createMatrix(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};
//way to find keycode of any key you press and all other info
// or just go to https://keycode.info/
document.addEventListener("keydown", event => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(+1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(+1);
  }
});

playerReset();
updateScore();

update();
