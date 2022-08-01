import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.css']
})
export class SettingDialogComponent implements OnInit {

  avatar = ''
  name = ''

  @ViewChild('settingModal', { static: true}) settingModal: TemplateRef<any>

  constructor(public modalService: NgbModal, private cookieService: CookieService) {
    this.avatar = this.cookieService.get(GameStateService.playerAvatarCookieName)
    this.name = this.cookieService.get(GameStateService.playerNameCookieName)

    if (this.avatar == '') {
      this.avatar = 'https://img.tapimg.net/market/lcs/3b8c6fe20ae9f356b271257df2888b3a_360.png?imageMogr2/auto-orient/strip'
    }
    if (this.name == '') {
      this.name = '玩家'
    }
  }

  ngOnInit(): void {
  }

  showDialog() {
    this.modalService.open(this.settingModal, { centered: true })
  }

  onFilesSelected(event) {
    console.log(event.target.files[0])
    console.log(window.URL.createObjectURL(event.target.files[0]))

    var reader = new FileReader()
    let that = this
    reader.onload = function(e) {
      that.avatar = e.target.result.toString()
    }
    reader.readAsDataURL(event.target.files[0]);
  }

}
