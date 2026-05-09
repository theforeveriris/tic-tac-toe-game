let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let winningLine = [];
let phase = 'place';
let selectedIndex = null;
let moveCount = 0;

const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const phaseInfo = document.getElementById('phaseInfo');

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function getEmptyCells() {
    return board.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
}

function initGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    winningLine = [];
    phase = 'place';
    selectedIndex = null;
    moveCount = 0;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.disabled = false;
    });

    updateStatus();
    statusDiv.classList.remove('game-over');
    resetBtn.classList.add('hidden');
    phaseInfo.textContent = '放置阶段：轮流放置棋子';
}

function updateStatus() {
    if (gameOver) return;

    if (phase === 'place') {
        statusDiv.textContent = `当前回合：${currentPlayer} | 请放置棋子`;
    } else {
        if (selectedIndex !== null) {
            statusDiv.textContent = `当前回合：${currentPlayer} | 选择目标位置移动`;
        } else {
            statusDiv.textContent = `当前回合：${currentPlayer} | 选择自己的棋子移动`;
        }
    }
}

function checkWinner() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: pattern };
        }
    }
    return { winner: null, line: [] };
}

function checkPhase() {
    const pieceCount = board.filter(c => c !== '').length;
    if (pieceCount >= 6) {
        phase = 'move';
        phaseInfo.textContent = '移动阶段：移动棋子到任意空格';
    }
}

function highlightMovable() {
    cells.forEach((cell, index) => {
        cell.classList.remove('movable', 'target', 'selected');

        if (gameOver) return;

        if (phase === 'move' && board[index] === currentPlayer) {
            const emptyCells = getEmptyCells();
            if (emptyCells.length > 0) {
                cell.classList.add('movable');
            }
        }
    });
}

function highlightTargets() {
    cells.forEach((cell, index) => {
        cell.classList.remove('movable', 'target', 'selected');

        if (gameOver) return;

        if (board[index] === '') {
            cell.classList.add('target');
        }
    });
}

function handlePlace(index) {
    if (board[index] !== '') {
        showMessage('该位置已有棋子！');
        return;
    }

    board[index] = currentPlayer;
    moveCount++;

    const cell = cells[index];
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    const result = checkWinner();
    if (result.winner) {
        endGame(result.winner, result.line);
        return;
    }

    checkPhase();

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    if (phase === 'move') {
        highlightMovable();
    }
}

function handleMove(index) {
    if (selectedIndex === null) {
        if (board[index] !== currentPlayer) {
            if (board[index] === '') {
                showMessage('请点击自己的棋子！');
            } else {
                showMessage('这是对方的棋子！');
            }
            return;
        }

        const emptyCells = getEmptyCells();
        if (emptyCells.length === 0) {
            showMessage('没有空格可以移动！');
            return;
        }

        selectedIndex = index;
        cells[index].classList.add('selected');
        highlightTargets();
        updateStatus();
        return;
    }

    if (index === selectedIndex) {
        selectedIndex = null;
        highlightMovable();
        updateStatus();
        return;
    }

    if (board[index] !== '') {
        showMessage('只能移动到空格！');
        return;
    }

    const fromCell = cells[selectedIndex];
    const toCell = cells[index];

    board[index] = currentPlayer;
    board[selectedIndex] = '';

    toCell.textContent = currentPlayer;
    toCell.classList.add(currentPlayer.toLowerCase());
    toCell.disabled = false;

    fromCell.textContent = '';
    fromCell.classList.remove(currentPlayer.toLowerCase(), 'selected');
    fromCell.disabled = false;

    selectedIndex = null;

    const result = checkWinner();
    if (result.winner) {
        endGame(result.winner, result.line);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    highlightMovable();
}

function endGame(winner, line) {
    gameOver = true;
    winningLine = line;

    winningLine.forEach(i => {
        cells[i].classList.add('winning');
    });

    statusDiv.textContent = `${winner} 获胜！`;
    statusDiv.classList.add('game-over');
    phaseInfo.textContent = '游戏结束';
    resetBtn.classList.remove('hidden');

    cells.forEach(cell => {
        cell.classList.remove('movable', 'target', 'selected');
    });
}

function showMessage(message) {
    const originalText = statusDiv.textContent;
    statusDiv.textContent = message;
    setTimeout(() => {
        if (!gameOver) {
            statusDiv.textContent = originalText;
        }
    }, 1500);
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (gameOver) return;

        const index = parseInt(cell.dataset.index);

        if (phase === 'place') {
            handlePlace(index);
        } else {
            handleMove(index);
        }
    });
});

resetBtn.addEventListener('click', initGame);

initGame();
