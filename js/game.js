'use strict'
var gBoard;
var gSize;
var gTime;
var gTimeInterval;
var gCount = 0;
var gCountNegs;
var gMineLocations = [];
var gUserLifes = 3;
var gMarkedCount = 0;
const MINE = '💣';
const FLAG = '⛳'
const LIFE = '💝'
const NORMAL = '😀'
const LOSE = '🤯'
const WIN = '😎'
const EASYMINES = 2;
const HARDMINES = 14;
const BRAVEMINES = 32;
var gNumMines;
var gIsFirstClick = true;
var gIsOn;

function onInit(size = 4) {
    stopTime();
    gSize = size;
    if (size === 4) {
        gNumMines = EASYMINES;
    } else if (size === 8) {
        gNumMines = HARDMINES;
    } else if (size === 12) {
        gNumMines = BRAVEMINES;
    }
    gBoard = buildBoard(gSize);
    gTime = Date.now();
    document.querySelector('.timer span').innerText = 0;
    gIsFirstClick = true;
    gCount = 0;
    document.querySelector('.emoji').innerText = NORMAL;
    gUserLifes = 3;
    gMarkedCount = 0;
    renderLifes(LIFE);
    renderBoard(gBoard, '.board')
    gIsOn = true;


}

function onCellClicked(elCell, i, j) {
    if (!gIsOn) return;
    if (gIsFirstClick) {
        setMineLocations(gNumMines);
        gIsFirstClick = false;
    }
    if (!gTimeInterval) startTime();
    var currCell = gBoard[i][j];
    if (currCell.isRevealed) return;
    if (currCell.isMarked) return;
    if (currCell.isMine) {
        revealMine(elCell, currCell);
        renderLifes(LIFE);
        if (gUserLifes <= 0) {
            revealMines(gMineLocations);
            gameOver();
        }
        return
    }
    if (!currCell.isMine) {

        elCell.classList.add('clicked');
        gCountNegs = calNegs(i, j, gBoard);
        if (!gCountNegs) {
            elCell.innerText = gCountNegs;
            currCell.isRevealed = true;
            elCell.mNegs = gCountNegs;
            openNegsCells(i, j, elCell);
            gCount++;
            return
        }
        elCell.mNegs = gCountNegs;
        elCell.innerText = gCountNegs;
        currCell.isRevealed = true;
        gCount++;
        checkVictory();

    }

}
function mark(elCell, i, j, ev) {
    if (!gIsOn) return;
    if (gMarkedCount > gNumMines - 1) return;
    if (gIsFirstClick) {
        setMineLocations(gNumMines);
        gIsFirstClick = false;
    }
    if (gMarkedCount < 0) gMarkedCount = 0;
    if (!gTimeInterval) startTime();
    var currCell = gBoard[i][j];
    if (currCell.isRevealed) return;
    if (currCell.isMarked) {
        elCell.classList.toggle('mark');
        currCell.isMarked = false;
        elCell.innerText = '';
        gMarkedCount--;
        gCount--;
    } else {
        elCell.classList.toggle('mark');
        currCell.isMarked = true;
        elCell.innerText = FLAG;
        gMarkedCount++
        gCount++;
        checkVictory();
    }
    if (gMarkedCount < 0) gMarkedCount = 0;

}



function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                isRevealed: false,
                isMarked: false,
                isMine: false,
                mNegs: 0,

            }
            row.push(cell);
        }
        board.push(row);

    }
    console.log(board);
    return board;
}
function calNegs(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;

            if (mat[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}
function startTime() {

    gTime = Date.now();
    gTimeInterval = setInterval(runTime, 1000);
}
function runTime() {
    var currRunTime = Date.now() - gTime;
    var toSeconds = (currRunTime / 1000).toFixed(0);
    document.querySelector('.timer span').innerText = toSeconds;
}
function stopTime() {
    gIsOn=false;
    clearInterval(gTimeInterval);
}
function gameOver() {
    document.querySelector('.emoji').innerText = LOSE;
    revealMines();
    stopTime();
}
function revealMines() {
    for (var k = 0; k < gMineLocations.length; k++) {
        var tempLocation = gMineLocations[k];
        if (gBoard[tempLocation.i][tempLocation.j].isMine) {
            var elCell = document.querySelector(`.cell-${tempLocation.i}-${tempLocation.j}`);
            elCell.innerText = MINE;
            elCell.classList.add('boom');
            if (elCell.classList.contains('mark')) {
                elCell.classList.toggle('mark');
            }
        }
    }
}

function revealMine(elCell, currCell) {
    if (currCell.isRevealed) return;
    gCount++;
    gUserLifes--;
    elCell.innerText = MINE;
    elCell.classList.add('boom');
    currCell.isRevealed = true;

    if (elCell.classList.contains('mark')) {
        elCell.classList.toggle('mark');
    }
}

function setMineLocations() {
    for (var i = 0; i < gNumMines; i++) {
        var emptyCell = getRandomEmptyCellLocation(gBoard);
        gBoard[emptyCell.i][emptyCell.j].isMine = true;
        // console.log(emptyCell);
        gMineLocations.push(emptyCell);
        // console.log(gMineLocations[i]);
    }
}
function checkVictory() {
    console.log(gCount);
    if (gCount === gSize * gSize) {
        document.querySelector('.emoji').innerText = WIN;
        stopTime();
    }
}
function openNegsCells(cellI, cellJ, elCell) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === cellI && j === cellJ) continue
            var currCell = gBoard[i][j];
            if (!currCell.isMine && !currCell.isRevealed) {
                gCount++;
                document.querySelector(`.cell-${i}-${j}`).classList.add('clicked');
                document.querySelector(`.cell-${i}-${j}`).innerText = calNegs(i, j, gBoard);
                gCountNegs = calNegs(i, j, gBoard);
                currCell.mNegs = gCountNegs;
                currCell.innerText = gCountNegs;
                currCell.isRevealed = true;

            }
        }
    }
    checkVictory();
}
function renderLifes(symbol) {
    var elLifes = document.querySelector('.lifes span');
    var strText = ''
    for (var i = 0; i < gUserLifes; i++) {
        strText += LIFE;
    }
    elLifes.innerText = strText;
}
function resetBoard() {
    onInit(gSize);
}