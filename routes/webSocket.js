const wsModlue = require( "ws" );

module.exports = function( _server )
{
    // 방 목록을 저장할 배열
    const rooms = [];

    // 웹소켓 서버를 생성합니다.
    const wss = new wsModlue.Server( {server:_server} );

    // 클리이언트가 접속했을 때 처리하는 이벤트 메소드를 연결합니다.
    wss.on( 'connection', function( ws, req ){

        // 사용자의 ip를 파악합니다.
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log( ip + "아이피의 클라이언트로 부터 접속 요청이 있었습니다." );

        // 메시지를 받은 경우 호출되는 이벤트 메소드 입니다.
        ws.on('message', function( message ){
            // 클라이언트에 받은 메시지를 그대로 보내, 통신이 잘되고 있는지 확인
            // ws.send( "echo:" + message );

            // JSON 형식의 메시지 파싱
            const data = JSON.parse(message);

            switch (data.action) {
                case "createRoom":
                    createRoom(data);

                    break;
                case "selectRoom":
                    // 방 목록을 모든 클라이언트에게 전송
                    broadcastRoomList();

                    break;
                case "enterRoom":
                    enterRoom(data);

                    break;
                case "leaveGame":
                    var roomId = data.roomId;
                    const room = rooms.find(r => r.id == roomId);

                    leaveGame(room);

                    break;
                case "stoneColorChoice":
                    var roomId = data.roomId;

                    // 플레이어 넘버는 방 플레이어 리스트 사이즈로 지정됨
                    let opponentPlayer = getOpponentPlayer(roomId);
                    opponentPlayer.send(JSON.stringify({ action: 'opponentStoneColorChoice', opponentStoneColor : data.stoneColor, opponentPlayerColor : data.playerColor}));

                    break;
                case "moveOmok":
                    moveOmok(data);

                    break;
                case "turnOver":
                    turnOver(data);

                    break;

                case "playerList":

                    broadcastPlayerList()

                    break;
            }
        });

        // 오류가 발생한 경우 호출되는 이벤트 메소드
        ws.on('error', function(error){
            console.log( ip + "클라이언트와 연결중 오류 발생:" + error );
        })

        // 접속이 종료되면, 호출되는 이벤트 메소드
        ws.on('close', function(){
            console.log( ip + "클라이언트와 접속이 끊어 졌습니다." );

            // 게임을 진행중 이었는지 확인
            // 게임중 비정상 종료 시 후 처리를 위함
            for(const room of rooms) {
                if(room.players.indexOf(ws) != -1) {
                    leaveGame(room);
                    break;
                }
            }
        })

        // 상대 플레이어를 가져옴
        function getOpponentPlayer(roomId) {
            const room = rooms.find(r => r.id == roomId);
            if(room.players < 2) {
                return null;
            } else {
                for(let player of room.players) {
                    if(player != ws) {
                        return player;
                    }
                }
            }
        }

        // 현재 플레이어를 가져옴
        function getRequesterPlayer() {
            return ws;
        }

        function getClientServerPlayerList(data) {
            var playerList = [];
            for(var i=0; i<wss.clients.size; i++) {
                playerList.push("Guest" + i);
            }

            return playerList;
        }

        function broadcastRoomPlayersMessage(roomId, message) {
            const room = rooms.find(r => r.id == roomId);
            room.players.forEach(client => {
                client.send(message);
            });
        }

        // 방 목록을 클라이언트에 전송하는 함수
        function broadcastRoomList() {
            const roomList = rooms.map(room => ({ id: room.id, name: room.name }));
            const message = JSON.stringify({ action: 'updateRoomList', rooms: roomList });

            broadcast(message);
        }

        // 방 목록을 클라이언트에 전송하는 함수
        function broadcastPlayerList() {
            const playerList = getClientServerPlayerList();
            const message = JSON.stringify({ action: 'playerList', playerList: playerList });

            broadcast(message);
        }

        function broadcast(message) {
            // 웹소켓 서버 모든 접속자에게 전송
            wss.clients.forEach(client => {

                // readyState가 OPEN인 경우에만 전송
                if (client.readyState === ws.OPEN) {
                    client.send(message);
                }
            });
        }

        function createRoom(data) {
            try {
                const room = {
                    id: rooms[rooms.length-1] == undefined ? 1 : rooms[rooms.length-1].id + 1,
                    name: data.roomName,
                    players: []
                };

                // 새로 생성된 방을 방 목록에 추가
                rooms.push(room);

                // 방 목록을 모든 클라이언트에게 전송
                broadcastRoomList();

                getRequesterPlayer().send(JSON.stringify({ action: 'createRoomSuccess', room: room }));
            } catch (e) {
                getRequesterPlayer().send(JSON.stringify({ action: 'createRoomError', message: '방 생성 실패' }));
            }
        }

        function enterRoom(data) {
            const roomId = data.roomId;
            const room = rooms.find(r => r.id == roomId);

            if (room) {
                if(room.players.length >= 2) {
                    // 인원 초과 시 에러 메시지 전송
                    getRequesterPlayer().send(JSON.stringify({ action: 'enterRoomError', message: '인원 초가로 인해 입장이 불가능합니다.' }));
                    return;
                }
                // 해당 방에 플레이어를 추가하고 입장 메시지를 전송
                room.players.push(getRequesterPlayer());

                var enteredRoomMessage = JSON.stringify({ action: 'enteredRoom', room: room, playerNumber: room.players.length });
                var updateRoomPlayerListMessage = JSON.stringify({ action: 'updateRoomPlayerList', room: room });

                // 클라이언트에게 "enteredRoom" 메시지 전송
                getRequesterPlayer().send(enteredRoomMessage);
                console.log(`플레이어가 방 ${roomId}에 입장하였습니다.`);

                // 방 플레이어 리스트 목록을 클라이언트에 전송
                broadcastRoomPlayersMessage(data.roomId, updateRoomPlayerListMessage);
            } else {
                // 해당 방이 없을 경우 에러 메시지 전송
                getRequesterPlayer().send(JSON.stringify({ action: 'enterRoomError', message: '해당 방이 존재하지 않습니다.' }));
            }
        }

        function moveOmok(data) {
            var roomId = data.roomId;
            var row = data.row;
            var col = data.col;
            var currentPlayerNumber = data.currentPlayerNumber;
            var currentPlayerStoneColor = data.currentPlayerStoneColor;

            var moveOmokMessage = JSON.stringify({ action: 'moveOmok', row: row, col: col, stoneColor: currentPlayerStoneColor});

            broadcastRoomPlayersMessage(roomId, moveOmokMessage);
        }

        function turnOver(data) {
            var roomId = data.roomId;
            var currentPlayerNumber = data.currentPlayerNumber;
            var currentPlayerStoneColor = data.currentPlayerStoneColor;

            var nextTurnPlayerNumber;
            if(currentPlayerNumber == 1) {
                nextTurnPlayerNumber = "2";
            } else if(currentPlayerNumber == 2) {
                nextTurnPlayerNumber = "1";
            }

            var nextTurnPlayerStoneColor;
            if(currentPlayerStoneColor == "black") {
                nextTurnPlayerStoneColor = "white";
            } else if(currentPlayerStoneColor == "white") {
                nextTurnPlayerStoneColor = "black";
            }

            var nextTurnPlayerMessage = JSON.stringify({ action: 'turnOver', currentPlayerNumber: nextTurnPlayerNumber, currentPlayerStoneColor: nextTurnPlayerStoneColor });

            broadcastRoomPlayersMessage(roomId, nextTurnPlayerMessage);
        }

        function leaveGame(room) {
            if (room) {
                var targetPlayerIndex = room.players.indexOf(ws);
                room.players.splice(targetPlayerIndex, 1);

                var leaveGameMessage = JSON.stringify({ action: 'leaveGame', room: room })
                var updateRoomPlayerListMessage = JSON.stringify({ action: 'updateRoomPlayerList', room: room })

                // 방에 플레이어가 존재하지 않을경우 방 제거
                if(room.players.length <= 0) {
                    rooms.splice(rooms.findIndex(r => r.id == room.id), 1);

                    console.log(`방 ${room.id} 소멸`);
                } else {
                    // 방 플레이어 리스트 목록을 클라이언트에 전송
                    broadcastRoomPlayersMessage(room.id, updateRoomPlayerListMessage);
                }
                getRequesterPlayer().send(leaveGameMessage);

                console.log(`플레이어가 방 ${room.id}에서 퇴장하였습니다.`);
            } else {
                // 해당 방이 없을 경우 에러 메시지 전송
                getRequesterPlayer().send(JSON.stringify({ action: 'leaveGame' }));
            }
        }

    });


}