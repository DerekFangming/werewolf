import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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

  key = atob('Q2xpZW50LUlEIDQzMzQzNWRkNjBmNWQ3OQ==')

  modalRef: NgbModalRef
  @ViewChild('settingModal', { static: true}) settingModal: TemplateRef<any>
  @Output() onSave = new EventEmitter<any>()

  constructor(public modalService: NgbModal, private cookieService: CookieService, private http: HttpClient) {
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
    this.modalRef = this.modalService.open(this.settingModal, { centered: true })
  }

  onFilesSelected(event) {
    var reader = new FileReader()
    let that = this
    reader.onload = function(e) {
      that.avatar = e.target.result.toString()
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  saveSetting() {
    if (this.avatar.startsWith('data')) {
      let parts = this.avatar.split(',');
      let data = parts[1];
      this.http.post('https://api.imgur.com/3/image', {image: data}, {headers: {'authorization': this.key}}).subscribe(json => {
        this.avatar = json['data']['link']
        this.saveAndEmit()
      }, () => {
        this.avatar = 'https://img.tapimg.net/market/lcs/3b8c6fe20ae9f356b271257df2888b3a_360.png?imageMogr2/auto-orient/strip'
        this.saveAndEmit()
      })
    } else {
      this.saveAndEmit()
    }
  }

  saveAndEmit() {
    this.cookieService.set(GameStateService.playerNameCookieName, this.name, 0, '/')
    this.cookieService.set(GameStateService.playerAvatarCookieName, this.avatar, 0, '/')

    this.modalRef.close()
    this.onSave.emit({name: this.name, avatar: this.avatar})
  }

}
