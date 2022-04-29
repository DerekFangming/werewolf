import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { GameStateService } from '../game-state.service';
import { Guard } from '../model/guard';
import { Hunter } from '../model/hunter';
import { Seer } from '../model/seer';
import { Villager } from '../model/villager';
import { Werewolf } from '../model/werewolf';
import { Witch } from '../model/witch';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  gameIdInput = ''
  error = ''
  ws: WebSocket
  players = []

  @ViewChild('errModal', { static: true}) errModal: TemplateRef<any>
  @ViewChild('confirmModel') confirmModel: ConfirmDialogComponent

  constructor(public gameState: GameStateService, private modalService: NgbModal) { }

  ngOnInit() {
    // const ws = new WebSocket('ws://localhost:8080')
    this.ws = new WebSocket('ws://10.0.1.50:8080')
    let that = this

    this.ws.onopen = function (event) {
      that.ws.send(`{"op": "handshake", "playerId": "${that.gameState.getPlayerId()}", "gameId": "${that.gameState.getGameId()}"}`)
    };

    this.ws.onmessage = function (data) {
      console.log('received: %s', data.data)
      let cmd = JSON.parse(data.data)
      switch (cmd.op) {
        case 'handshake':
          that.gameState.setplayerIdAndGameId(cmd.playerId, cmd.gameId)
          if (cmd.gameId != '') that.ws.send(`{"op": "gameDetails", "gameId": "${cmd.gameId}"}`)
          break
        case 'gameDetails':
          if (cmd.error == null) {
            console.log(cmd)
            that.gameState.setGame(cmd.gameId, cmd.hostId, cmd.turn, cmd.characters, cmd.players)
          } else {
            that.gameState.setState('lobby')
            that.error = cmd.error
            that.modalService.open(that.errModal, { centered: true })
          }
          break
        case 'takeSeat':
          that.gameState.takeSeat(cmd.playerId, cmd.position)
          break
        case 'endTurn':
          that.gameState.endTurn(cmd.turn, cmd.action, cmd.target)
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
    this.gameState.setState('createGame')
    this.players = [new Werewolf({selected: true}), new Werewolf({selected: true}), new Werewolf(), new Werewolf(),
      new Villager({selected: true}), new Villager({selected: true}), new Villager(), new Villager(),
      new Seer({selected: true}), new Witch({selected: true}), new Hunter(), new Guard()]
  }

  confirmCreateGame() {
    let selected = this.players.filter(p => p.selected).map(p => p.type)
    if (selected.length < 6) {
      this.error = '至少需要六人才能创建游戏'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      console.log(JSON.stringify(selected))
      this.ws.send(`{"op": "createGame", "characters": ${JSON.stringify(selected)}}`)
    }
  }

  joinGame(){
    this.gameIdInput = '1111'
    this.gameState.setState('joinGame')
  }

  confirmJoinGame() {
    let gameId = this.gameIdInput.trim()
    if (gameId.length != 4) {
      this.error = '房间号应该为四位数字'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.gameState.setState('loading')
      this.ws.send(`{"op": "joinGame", "gameId": "${gameId}"}`)
    }
  }

  selectSeat(seatInd: number) {
    if (this.gameState.turn == '') {
      console.log(3)
      if (!this.gameState.players[seatInd].selected) {
        this.confirmModel.showDialog('入座', '确定在' + (seatInd+1) + '号入座？', {'op': 'takeSeat', 'position': seatInd+1})
      }
    } else if (this.isMyTurn()) {
      let character = this.gameState.getSelfCharacter()
      console.log(character.actionName)
      console.log(this.gameState.players[seatInd].id)
      this.confirmModel.showDialog(character.actionTitle, character.actionMessage.replace(/\{0\}/, seatInd+1),
        {'op': 'endTurn', 'action': seatInd+1, 'target': 2}, false, '确认，并结束回合')
    }
  }

  startGame() {
    if (this.gameState.players.filter(p => !p.selected).length > 0) {
      this.error = '所有人选择座位之后才可以开始发牌'
      this.modalService.open(this.errModal, { centered: true })
    } else {
      this.ws.send(`{"op": "startGame", "gameId": "${this.gameState.gameId}"}`)
    }
  }

  viewCharacter() {
    this.confirmModel.showDialog('你的身份是', `${this.gameState.getSelfCharacter().name}`, {})
  }

  isMyTurn() {
    if (this.gameState.turn != '') {
      if (this.gameState.turn == this.gameState.getSelfCharacter().type) {
        return true
      }
    }
    return false
  }

  nightStart() {
    this.ws.send(`{"op": "endTurn", "action": "nightStart"}`)
  }

  endTurn() {
    this.ws.send(`{"op": "endTurn", "action": "foo", "target": "bar"}`)
  }

  viewResult() {

  }

  public onConfirm(context: any) {
    switch(context.op) {
      case 'leaveGame':
        this.ws.send(`{"op": "leaveGame"}`)
        break
      case 'takeSeat':
        this.ws.send(`{"op": "takeSeat", "position": ${context.position}}`)
        break
      case 'debug':
        this.confirmModel.showDialog('哈哈哈哈', `你好`, {op: 'debug'}, true, '下一回合')
        break
      default:
    }
  }

  debug() {
    // console.log('Player: ' + this.gameState.playerId)
    // console.log(this.gameState.playerPosition)
    console.log(this.gameState.players)
    // console.log(this.gameState.turn)
    // console.log(this.gameState.getSelfCharacter().type)
    // console.log(this.isMyTurn())
    // this.confirmModel.showDialog('你的身份是', `${this.gameState.getSelfCharacter().name}`, {op: 'debug'}, false, '下一回合')
  }

}
