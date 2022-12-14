'use strict'

function renderBoard(mat) {

    var strHTML = '<table class="center" border="1"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = 'cell cell-' + i + '-' + j
            strHTML += `<td class="${className}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function getRandomEmptyCellLocation(board) {
    const emptyCells = [];
    for (var i = 0; i < board.length - 1; i++) {
        for (var j = 0; j < board[0].length - 1; j++) {
            const currCell = board[i][j]
            if ((!currCell.isMine) && (!currCell.isShown)) emptyCells.push({ i: i, j: j });
        }
    }
    if (!emptyCells.length) return null;
    var randomIdx = getRandomIntInclusive(0, emptyCells.length - 1);
    return emptyCells[randomIdx];
}
function getPlaceForHint(board) {
    while (true) {
        var emptyCell;
        var num = getRandomIntInclusive(0, board.length - 1);
        for (var i = num; i < board.length - 1; i++) {
            for (var j = 0; j < board[0].length - 1; j++) {
                const currCell = board[i][j]
                if (!(currCell.isMine) && !(currCell.isShown)) {
                    emptyCell = { i: i, j: j };
                    return emptyCell;
                }
            }
        }
    }
}