import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'
import { CookieService } from 'ngx-cookie-service'
import { GameStateService } from '../game-state.service'

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
      this.avatar = 'https://i.imgur.com/Q6Y7L9u.png'
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

  async saveSetting() {
    if (this.avatar.startsWith('data')) {
      let parts = this.avatar.split(',');
      let data = parts[1];
      console.log(this.key)

      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': this.key,
        })
      }

      this.http.post<any>('https://api.imgur.com/3/image', {image: data}, httpOptions).subscribe(res => {
        this.avatar = res.data.link
        this.saveAndEmit()
      }, error => {
        console.log(error)
        this.avatar = ''
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
