'use strict'


const MINE = '💣';
const FLAG = '⛳'
const LIFE = '💝'
const NORMAL = '😀'
const LOSE = '🤯'
const WIN = '😎'
const EASYMINES = 2;
const HARDMINES = 14;
const BRAVEMINES = 32;
var gCountNegs;
var gTime;
var gTimeInterval;
var gMineLocations = [];
var gUserLifes = 3;
var gMarkedCount = 0;
var gIsFirstClick = true;
var gBoard;
var gGame={
    isOn:false,
    shownCount:0,
    markedCount:0,
    secsPassed:0
};
var gLevel={
    SIZE:4,
    MINES:2 
};
function initGame(size = 4) {
    stopTime();
    gLevel.SIZE=size;
    if(gLevel.SIZE===4)gLevel.MINES=EASYMINES;
    if(gLevel.SIZE===8)gLevel.MINES=HARDMINES;
    if(gLevel.SIZE===12)gLevel.MINES=BRAVEMINES;
    gBoard = buildBoard(gLevel.SIZE);
    gTime = Date.now();
    document.querySelector('.timer span').innerText = 0;
    gIsFirstClick = true;
    gGame.shownCount=0;
    gGame.markedCount=0;
    document.querySelector('.emoji').innerText = NORMAL;
    gUserLifes = 3;
    renderLifes(LIFE);
    renderBoard(gBoard)
    gGame.isOn=true;
    
    
}
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                isShown: false,
                isMarked: false,
                isMine: false,
                minesAroundCount: 0,

            }
            row.push(cell);
        }
        board.push(row);

    }
    console.log(board);
    return board;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;// game is off
    if (gIsFirstClick) {// place mines of first click
        setMinesNegsCount(gBoard);
        gIsFirstClick = false;
    }
    if (!gTimeInterval) startTime();//start time on click 
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    if (currCell.isMarked) return;
    if (currCell.isMine) {
        gGame.shownCount++;
        revealMine(elCell, currCell);
        renderLifes(LIFE);
        if (gUserLifes <= 0) {
            revealMines(gMineLocations);
            checkGameOver();
        }
        return
    }
    if (!currCell.isMine) {

        elCell.classList.add('clicked');
        calNegs(i, j,gBoard);
        if (!gBoard[i][j].minesAroundCount) {
            elCell.innerText = currCell.minesAroundCount;
            currCell.isShown = true;
            expandShown(i, j, elCell,gBoard);
            return;
        }
        elCell.innerText = gBoard[i][j].minesAroundCount;
        currCell.isShown = true;
        gGame.shownCount++;
        checkVictory();

    }

}
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gGame.markedCount > gLevel.MINES ) return;
    if (gIsFirstClick) {
        setMinesNegsCount(gLevel.MINES);
        gIsFirstClick = false;
    }
    
    if (!gTimeInterval) startTime();
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    if (currCell.isMarked) {
        elCell.classList.toggle('mark');
        currCell.isMarked = false;
        elCell.innerText = '';
        gGame.markedCount--;
        gGame.shownCount--;
    } else {
        elCell.classList.toggle('mark');
        currCell.isMarked = true;
        elCell.innerText = FLAG;
        gGame.markedCount++
        checkVictory();
    }
    if (gGame.markedCount < 0) gGame.markedCount = 0;

}



function calNegs(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;

            if (board[i][j].isMine) board[cellI][cellJ].minesAroundCount++;
        }
    }
}
function startTime() {

    gTime = Date.now();
    gTimeInterval = setInterval(runTime, 1000);
}
function runTime() {
    var currRunTime = Date.now() - gTime;
    gGame.secsPassed = (currRunTime / 1000).toFixed(0);
    document.querySelector('.timer span').innerText = gGame.secsPassed;
}
function stopTime() {
    gGame.isOn = false;
    clearInterval(gTimeInterval);
}
function checkGameOver() {
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
    if (currCell.isShown) return;
    
    gUserLifes--;
    elCell.innerText = MINE;
    elCell.classList.add('boom');
    currCell.isShown = true;

    if (elCell.classList.contains('mark')) {
        elCell.classList.toggle('mark');
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCell = getRandomEmptyCellLocation(board);
        if(!emptyCell)return;
        board[emptyCell.i][emptyCell.j].isMine = true;
        // console.log(emptyCell);
        gMineLocations.push(emptyCell);
        // console.log(gMineLocations[i]);
        calNegs(emptyCell.i, emptyCell.j, board);

    }

    return board;
}
function checkVictory() {
    console.log('shown',gGame.shownCount);
    console.log('marked',gGame.markedCount);

    if (gGame.shownCount+gGame.markedCount === gLevel.SIZE**2) {
        document.querySelector('.emoji').innerText = WIN;
        stopTime();
    }
}
function expandShown(cellI, cellJ, elCell,board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === cellI && j === cellJ) continue
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                gGame.shownCount++;
                calNegs(i, j, board);
                document.querySelector(`.cell-${i}-${j}`).classList.add('clicked');
                document.querySelector(`.cell-${i}-${j}`).innerText = currCell.minesAroundCount;
                elCell.innerText = currCell.minesAroundCount;
                currCell.isShown = true;

            }
        }
    }
    gGame.shownCount++;
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
    initGame(gLevel.SIZE);
}