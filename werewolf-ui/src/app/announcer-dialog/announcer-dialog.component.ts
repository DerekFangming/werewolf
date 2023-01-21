import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-announcer-dialog',
  templateUrl: './announcer-dialog.component.html',
  styleUrls: ['./announcer-dialog.component.css']
})
export class AnnouncerDialogComponent implements OnInit {

  modalRef: NgbModalRef
  @ViewChild('announcerModal', { static: true}) announcerModal: TemplateRef<any>
  announcements = []
  note = ''

  constructor(public gameState: GameStateService, public modalService: NgbModal) { }

  ngOnInit(): void { }

  showDialog() {
    this.announcements = ['<b>天黑请闭眼。</b>']

    if (this.gameState.characters.includes('thief')) {
      this.announcements.push('<small>（仅在第一晚读，确定选人情况来判断游戏结束情况）</small><b>盗贼请睁眼。</b><small>（停顿，盗贼用手势表达选人情况）</small><b>盗贼请闭眼。</b>')
    }

    if (this.gameState.characters.includes('cupid')) {
      this.announcements.push('<small>（仅在第一晚读，让上帝知道丘比特人员分配以及游戏结果判断）</small><b>丘比特请睁眼。</b><small>（停顿）</small><b>丘比特请闭眼。</b>' +
        '<small>（停顿）</small>。<b>情侣请睁眼。</b><small>（停顿）</small>。<b>情侣请闭眼。</b>')
    }

    this.announcements.push('<b>狼人请睁眼，狼人请杀人。</b><small>（停顿）</small><b>狼人请闭眼。</b>')

    if (this.gameState.characters.includes('werewolfQueen')) {
      this.announcements.push('<b>狼美人请睁眼，狼美人请魅惑。</b><small>（停顿）</small><b>狼美人请闭眼。</b>')
    }

    if (this.gameState.characters.includes('hiddenWerewolf')) {
      this.announcements.push('<b>隐狼请睁眼。</b><small>（停顿，用手势告知隐狼全部狼队友号码）</small><b>隐狼请闭眼。</b>')
    }

    if (this.gameState.characters.includes('seer')) {
      this.announcements.push('<b>预言家请睁眼查验。</b><small>（停顿）</small><b>他的身份是</b><small>（手势， 停顿）</small><b>预言家请闭眼。</b>')
    }

    if (this.gameState.characters.includes('witch')) {
      this.announcements.push('<b>女巫请睁眼。昨晚死亡的王家是</b><small>（如果还有解药，手势告知死亡玩家，否则不打手势）</small><b>你有一瓶解药，请问你要救吗？</b><small>（停顿）</small>' +
        '<b>你有一瓶毒药，请问要使用吗？</b><small>（停顿。注意毒药解药不能同夜使用。）</small><b>女巫请闭眼。</b>')
    }

    if (this.gameState.characters.includes('hunter')) {
      this.announcements.push('<b>猎人请睁眼。你今晚的开枪状态是</b><small>（停顿，用手势告知开枪状态。殉情或被毒杀即不能开枪）</small><b>猎人请闭眼。</b>')
    }

    if (this.gameState.characters.includes('guard')) {
      this.announcements.push('<b>守卫请睁眼。守卫请守卫。</b><small>（停顿，守卫不能两晚守同一个人。守卫可以空守。）</small><b>守卫请闭眼。</b>')
    }

    if (this.gameState.characters.includes('fox')) {
      this.announcements.push('<b>狐狸请睁眼。你今晚过后，尾巴还剩</b><small>（用手势。尾巴一共9条，平民死亡减少一条，神死亡减少两条。九尾狐尾巴数为零时即死亡）</small><b>狐狸请闭眼。</b>')
    }

    if (this.gameState.characters.includes('bear')) {
      this.announcements.push('<small>（仅在第一晚读，让上帝知道熊的位置以判断熊咆哮与否。）</small><b>熊请睁眼。</b>（停顿）</small><b>熊请闭眼。</b>')
    }

    this.announcements.push('<b>天亮了。</b>')

    this.modalRef = this.modalService.open(this.announcerModal, { centered: true })
  }

}
