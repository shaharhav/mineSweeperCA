'use strict'

const WIN1 = new Audio("sound/win1.wav");
const WIN2 = new Audio("sound/win2.wav");
const WIN3 = new Audio("sound/win3.wav");
const LOSE1 = new Audio("sound/lose1.mp3");
const LOSE2 = new Audio("sound/lose2.wav");
const MINESOUND = new Audio("sound/minesound1.mp3");
const EZSOUND = new Audio("sound/ez.mp3");
const HARDSOUND = new Audio("sound/hard.mp3");
const BRAVESOUND = new Audio("sound/brave.mp3");
const HINTSOUND = new Audio("sound/hellothere.mp3");
const RESTART = new Audio("sound/restart.mp3");
const MYBODY = new Audio("sound/mybody.mp3");
const RICKROLLED = new Audio("sound/rickrolled.mp3");
const MARKEDSOUND = new Audio("sound/hitmarker_1.mp3");


MINESOUND.volume = 0.2;
MYBODY.volume = 0.2;
RICKROLLED.volume = 0.2;



const MINE = '💣';
const FLAG = '⛳';
const LIFE = '💝';
const NORMAL = '😀';
const LOSE = '🤯';
const WIN = '😎';
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
var gAmountSafes = 3;
var gIsSafe = false;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gLevel = {
    SIZE: 4,
    MINES: 2
};
function initGame(size = 4) {
    document.querySelector('.hint1 ').classList.remove('hidden');
    document.querySelector('.hint2 ').classList.remove('hidden');
    document.querySelector('.hint3 ').classList.remove('hidden');
    stopTime();
    gLevel.SIZE = size;
    gIsSafe = false;
    if (gLevel.SIZE === 4) gLevel.MINES = EASYMINES;
    if (gLevel.SIZE === 8) gLevel.MINES = HARDMINES;
    if (gLevel.SIZE === 12) gLevel.MINES = BRAVEMINES;
    gBoard = buildBoard(gLevel.SIZE);
    gTime = Date.now();
    document.querySelector('.timer span').innerText = 0;
    gIsFirstClick = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    document.querySelector('.emoji').innerText = NORMAL;
    gUserLifes = 3;
    document.querySelector('.flag span').innerText = gLevel.MINES;
    renderLifes(LIFE);
    renderBoard(gBoard)
    gGame.isOn = true;


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

    if (!gTimeInterval) startTime();//start time on click 
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    if (currCell.isMarked) return;
    if (gAmountSafes > 0 && gIsSafe) {
        if (gIsFirstClick) {// place mines of first click
            setMinesNegsCount(gBoard);
            gIsFirstClick = false;
        }
        
        revealNegs(elCell, i, j);
        return;
    }
    if (currCell.isMine) {

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
        if (gIsFirstClick) {// place mines of first click
            setMinesNegsCount(gBoard);
            gIsFirstClick = false;
        }
        calNegs(i, j, gBoard);
        if (!gBoard[i][j].minesAroundCount) {
            elCell.innerText = '';
            currCell.isShown = true;
            expandShown(i, j, elCell, gBoard);
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
        document.querySelector('.flag span').innerText = +document.querySelector('.flag span').innerText + 1;

    } else {
        if (gGame.markedCount === gLevel.MINES) return;
        elCell.classList.toggle('mark');
        currCell.isMarked = true;
        elCell.innerText = FLAG;
        gGame.markedCount++
        document.querySelector('.flag span').innerText -= 1;
        markPlay();
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

    if (gLevel.MINES === HARDMINES) LOSE1.play();
    if (gLevel.MINES === BRAVEMINES) LOSE2.play();
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
    gGame.shownCount++;
    gUserLifes--;
    elCell.innerText = MINE;
    elCell.classList.add('boom');
    MINESOUND.play();
    currCell.isShown = true;
    checkVictory();

    if (elCell.classList.contains('mark')) {
        elCell.classList.toggle('mark');
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCell = getRandomEmptyCellLocation(board);
        if (!emptyCell) return;
        board[emptyCell.i][emptyCell.j].isMine = true;
        // console.log(emptyCell);
        gMineLocations.push(emptyCell);
        // console.log(gMineLocations[i]);
        calNegs(emptyCell.i, emptyCell.j, board);

    }

    return board;
}
function checkVictory() {
    console.log('shown', gGame.shownCount);
    console.log('marked', gGame.markedCount);

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        document.querySelector('.emoji').innerText = WIN;
        if (gLevel.MINES === EASYMINES) WIN1.play();
        if (gLevel.MINES === HARDMINES) WIN2.play();
        if (gLevel.MINES === BRAVEMINES) WIN3.play();
        stopTime();
    }
    if (gLevel.MINES === EASYMINES && gGame.shownCount + gGame.markedCount !== gLevel.SIZE ** 2) return;
    if (gGame.markedCount < gLevel.MINES && gGame.shownCount + (gLevel.MINES - gGame.markedCount) === gLevel.SIZE ** 2) {
        document.querySelector('.emoji').innerText = WIN;
        if (gLevel.MINES === EASYMINES) WIN1.play();
        if (gLevel.MINES === HARDMINES) WIN2.play();
        if (gLevel.MINES === BRAVEMINES) WIN3.play();
        stopTime();
    }
}
function expandShown(cellI, cellJ, elCell, board) {
    if (board[cellI][cellJ].minesAroundCount) {
        gGame.shownCount++;
        elCell.classList.add('clicked');
        elCell.innerText = board[cellI][cellJ].minesAroundCount;
        // elCell.innerText = currCell.minesAroundCount;
        board[cellI][cellJ].isShown = true;
        return;
    }
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === cellI && j === cellJ) continue
            var currCell = board[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                // gGame.shownCount++;
                calNegs(i, j, board);
                var currElCell = document.querySelector(`.cell-${i}-${j}`);
                currElCell.classList.add('clicked');
                if (currCell.minesAroundCount) currElCell.innerText = currCell.minesAroundCount;
                else currElCell.innerText = '';
                // elCell.innerText = currCell.minesAroundCount;
                currCell.isShown = true;
                expandShown(i, j, currElCell, board);
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
    RESTART.play();
    initGame(gLevel.SIZE);

}
function giveHint(elBtn) {
    var location = getPlaceForHint(gBoard);
    var currElCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elBtn.classList.add('hidden');
    if (!(currElCell.classList.contains('hint')) && !(gBoard[location.i][location.j].isMine)) {
        currElCell.classList.add('hint');
        HINTSOUND.play();
        setTimeout(removeHint, 1000, location);
    }
}
function removeHint(pos) {
    document.querySelector(`.cell-${pos.i}-${pos.j}`).classList.remove('hint');
}
function revealNegs(elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j];
            var currElCell = document.querySelector(`.cell-${i}-${j}`);
            currElCell.classList.add('clicked');
            calNegs(i, j, gBoard);
            if (currCell.isMine) currElCell.innerText = MINE;
            else if (currCell.minesAroundCount) currElCell.innerText = currCell.minesAroundCount;
            else currElCell.innerText = '';
            currCell.isShown = true;
        }
    }
    gAmountSafes--;
    gIsSafe = false;
    setTimeout(concealNegs, 1000, cellI, cellJ);
}
function concealNegs(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j];
            var currElCell = document.querySelector(`.cell-${i}-${j}`);
            currElCell.classList.remove('clicked');
            currCell.minesAroundCount = 0;
            currElCell.innerText = '';
            currCell.isShown = false;
        }
    }

}
function safeMod() {
    gIsSafe = true;
    console.log(gIsSafe)
}







function easyPlay() {
    EZSOUND.play();
}
function hardPlay() {
    HARDSOUND.play();
}
function bravePlay() {
    BRAVESOUND.play();
}
function hardPlay() {
    HARDSOUND.play();
}
function rickPlay() {
    RICKROLLED.play();
}
function bodyPlay() {
    MYBODY.play();
}
function markPlay() {
    MARKEDSOUND.play();
}
function bodyPause() {
    MYBODY.pause();
    MYBODY.currentTime = 0;
}