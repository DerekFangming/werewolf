import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { GameStateService } from '../game-state.service';
import { Guard } from '../model/guard';
import { Hunter } from '../model/hunter';
import { Seer } from '../model/seer';
import { Villager } from '../model/villager';
import { Werewolf } from '../model/werewolf';
import { Witch } from '../model/witch';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  error = ''
  ws: WebSocket
  players = []

  // modalRef: NgbModalRef;
  // @ViewChild('userModal', { static: true}) userModal: TemplateRef<any>
  // @ViewChild('banUserModal', { static: true}) banUserModal: TemplateRef<any>
  @ViewChild('errModel', { static: true}) errModel: TemplateRef<any>

  constructor(public gameState: GameStateService, private modalService: NgbModal) { }

  ngOnInit() {
    // const ws = new WebSocket('ws://localhost:8080')
    this.ws = new WebSocket('ws://10.0.1.50:8080')
    let that = this

    this.ws.onopen = function (event) {
      that.ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}"}`)
    };

    this.ws.onmessage = function (data) {
      let cmd = JSON.parse(data.data)
      console.log('received: %s', JSON.stringify(cmd))
      switch (cmd.op) {
        case 'handshake':
          that.gameState.setplayerIdAndGameId(cmd.playerId, cmd.gameId)
          if (cmd.gameId != '') that.ws.send(`{"op": "game", "gameId": "${cmd.gameId}"}`)
          break
        case 'game':
          that.gameState.setGame(cmd.gameId, cmd.characters)
          break
        default:
        console.log('unknown command: ' + data)
      }
    }

    this.ws.onclose = function (data) {
      console.log('Server closed')
    }
  }

  createGame() {
    this.gameState.setState('create')
    this.players = [new Werewolf({selected: true}), new Werewolf({selected: true}), new Werewolf(), new Werewolf(),
      new Villager({selected: true}), new Villager({selected: true}), new Villager(), new Villager(),
      new Seer({selected: true}), new Witch({selected: true}), new Hunter(), new Guard()]
  }

  // open(content) {
  //   this.modalService.open(content)
  // }

  confirmCreateGame() {
    let selected = this.players.filter(p => p.selected).map(p => p.type)
    if (selected.length < 6) {
      this.error = '至少需要六人才能创建游戏'
      this.modalService.open(this.errModel, { centered: true })
      return
    }

    this.gameState.setState('loading')
    console.log(JSON.stringify(selected))
    this.ws.send(`{"op": "create", "characters": ${JSON.stringify(selected)}}`)

  }

}
