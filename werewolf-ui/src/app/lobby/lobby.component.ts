import { Component, OnInit } from '@angular/core'
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  constructor(private gameStateService: GameStateService) { }

  ngOnInit() {
    // const ws = new WebSocket('ws://localhost:8080')
    const ws = new WebSocket('ws://10.0.1.50:8080')

    let playerId = this.gameStateService.getPlayerId()
    let gameId = this.gameStateService.getGameId()

    if (playerId == '') {

    }

    let that = this

    ws.onopen = function (event) {
      ws.send(`{"op": "handshake", "playerId": "${playerId}", "gameId": "${gameId}"}`);
    };

    ws.onmessage = function (data) {
      let cmd = JSON.parse(data.data)
      console.log('received: %s', JSON.stringify(cmd))
      if (cmd.op == 'handshake') {
        console.log('received: %s', cmd.playerId)
        that.gameStateService.setPlayerId(cmd.playerId)
        
        return
      }
    }

    ws.onclose = function (data) {
      // clearInterval(interval)
      console.log('Server closed');
    }

    // const interval = setInterval(function() {
    //   ws.send('headtbeat')
    // }, 5000)
  }

}
