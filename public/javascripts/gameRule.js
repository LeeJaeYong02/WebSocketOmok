/*
게임 보드:
    오목은 15x15 크기의 정사각형 보드를 사용합니다.
    각 교차점에 돌을 놓을 수 있습니다.
차례:
    흑돌과 백돌이 번갈아가며 돌을 놓습니다.
    게임이 시작될 때 한 쪽이 선공(흑돌)을 가집니다.
목표:
    가로, 세로, 대각선으로 다섯 개의 돌을 연속으로 놓으면 해당 플레이어가 승리합니다.
    먼저 다섯 개의 돌을 놓은 플레이어가 이기거나, 모든 교차점이 돌로 차면 무승부가 됩니다.
돌 놓기:
    플레이어는 놓고자 하는 교차점에 돌을 놓습니다.
금수:
    흑돌과 백돌은 같은 위치에 돌을 놓을 수 없습니다.
    어느 한 쪽이 승리하면 더 이상 돌을 놓을 수 없습니다.
게임 종료:
    한 플레이어가 이기면 게임이 종료되며 승리한 플레이어가 화면에 표시됩니다.
    모든 교차점이 돌로 차거나 무승부가 될 경우 게임이 종료됩니다.
퇴장:
    플레이어가 게임 중간에 나가면 해당 플레이어의 패배로 처리됩니다.
*/

class startOmokGame {
    constructor(webSocket, gameBoardDiv) {
        this.ws = webSocket;
        this.gameBoard = gameBoardDiv;

        this.boardData = matrix(15, 15, 0);

        this.handleCellClick = this.handleCellClick.bind(this);

        this.cellClickEvent;

        this.gameEnd = false;
    }

    // 게임 보드를 생성하는 함수
    createGameBoard = function() {
        const boardSize = 15;

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('game-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameBoard.appendChild(cell);
            }
        }

        // 이벤트 리스너 등록
        this.gameBoard.addEventListener('click', this.handleCellClick);
    }

    // 셀을 클릭했을 때 호출되는 함수
    handleCellClick = function(event) {
        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;

        if(this.cellClickEvent instanceof Function) {
            this.cellClickEvent(cell, row, col);
        } else {
            console.log("셀 클릭 이벤트가 설정되지 않았습니다.");
        }
    }

    setCellClickEvent = function(callBackMethod) {
        this.cellClickEvent = callBackMethod;
    }

    moveOmok = function(row, col, stoneColor) {

        var elementsWithAttributeRow = document.querySelectorAll('[data-row="' + row + '"]');
        for(var cols of elementsWithAttributeRow) {
            if(cols.getAttribute("data-col") == col) {
                cols.style.pointerEvents = "none"; // 클릭이 안되도록 비활성화
                cols.style.backgroundColor = stoneColor
                cols.className = "game-cell selected";

                this.boardData[row][col] = stoneColor;

                if(this.checkWin(this.boardData, row, col, stoneColor)) {
                    this.gameEnd = true;
                }

                break;
            }
        }
    }

    // 승리 확인
    checkWin = function(board, row, col, color) {
        return (
            this.checkDirection(board, Number(row), Number(col), color, 1, 0) || // 가로
            this.checkDirection(board, Number(row), Number(col), color, 0, 1) || // 세로
            this.checkDirection(board, Number(row), Number(col), color, 1, 1) || // 대각선 \
            this.checkDirection(board, Number(row), Number(col), color, 1, -1)   // 대각선 /
        );
    }

    checkDirection(board, row, col, color, rowIncrement, colIncrement) {
        const rowCount = board.length;
        const colCount = board[0].length;
        const consecutiveStones = [];

        // 현재 위치에서 시작하여 주어진 방향으로 이동하며 돌의 색을 확인
        for (let i = -4; i <= 4; i++) {
            const currentRow = row + i * rowIncrement;
            const currentCol = col + i * colIncrement;

            if (currentRow >= 0 && currentRow < rowCount && currentCol >= 0 && currentCol < colCount) {
                consecutiveStones.push(board[currentRow][currentCol]);
            } else {
                consecutiveStones.push(null);
            }
        }

        // 5개의 돌이 연속되어 있는지 확인
        const consecutiveString = consecutiveStones.join('');
        return consecutiveString.includes(color.repeat(5));
    }

    logBoardData = function() {
        console.log(this.boardData);
    }

    getBoardCellData = function(row, col) {
        return this.boardData[row][col];
    }

    getGameEndFlag = function() {
        return this.gameEnd;
    }

    boardDisabled = function(flag) {
        if(flag) {
            const targetDiv = this.gameBoard;

            // 특정 div의 위치와 크기를 기반으로 반투명 객체 생성
            const transparentOverlay = document.createElement('div');
            const rect = targetDiv.getBoundingClientRect();

            transparentOverlay.id = "boardDivBlur"
            transparentOverlay.style.position = 'absolute';
            transparentOverlay.style.top = rect.top + 'px';
            transparentOverlay.style.left = rect.left + 'px';
            transparentOverlay.style.width = rect.width + 'px';
            transparentOverlay.style.height = rect.height + 'px';
            //transparentOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // 반투명 백그라운드 색상
            transparentOverlay.style.zIndex = '1'; // 필요에 따라 조절

            document.body.appendChild(transparentOverlay);
        } else {
            if(document.getElementById("boardDivBlur") != null) {
                document.getElementById("boardDivBlur").remove();
            }
        }
    }
}

matrix = function (m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = initial;
        }
        mat[i] = a;
    }
    return mat;
};