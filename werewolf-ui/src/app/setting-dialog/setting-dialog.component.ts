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
  loading = false

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
    this.loading = false
    this.modalRef = this.modalService.open(this.settingModal, { centered: true })
  }

  onFilesSelected(event) {
    var reader = new FileReader()
    let that = this
    reader.onload = function(e) {
      let origImg = new Image()
      origImg.src = e.target.result.toString()
      origImg.onload = function() {
        let size = Math.min(origImg.height, origImg.width)
        let cropX = origImg.width == size ? 0 : (origImg.width - size) / 2
        let cropY = origImg.height == size ? 0 : (origImg.height - size) / 2

        var canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        let c2d = canvas.getContext('2d')
        c2d.drawImage(origImg, cropX, cropY, size, size, 0, 0, size, size)
        let newimgUri = canvas.toDataURL("image/png").toString()
        that.avatar = newimgUri
      }
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  async saveSetting() {
    if (this.avatar.startsWith('data')) {
      let parts = this.avatar.split(',')
      let data = parts[1]

      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': this.key,
        })
      }

      this.loading = true
      this.http.post<any>('https://api.imgur.com/3/image', {image: data}, httpOptions).subscribe(res => {
        this.loading = false
        this.avatar = res.data.link
        this.saveAndEmit()
      }, error => {
        this.loading = false
        console.log(error)
        this.avatar = ''
        this.saveAndEmit()
      })
    } else {
      this.saveAndEmit()
    }
  }

  saveAndEmit() {
    this.cookieService.set(GameStateService.playerNameCookieName, this.name, 3650, '/')
    this.cookieService.set(GameStateService.playerAvatarCookieName, this.avatar, 3650, '/')

    this.modalRef.close()
    this.onSave.emit({name: this.name, avatar: this.avatar})
  }

}
