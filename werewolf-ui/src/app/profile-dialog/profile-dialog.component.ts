import { Component, EventEmitter, OnInit, Output} from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { GameStateService } from '../game-state.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterOutlet } from '@angular/router'

declare var $: any

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.css'
})
export class ProfileDialogComponent implements OnInit {

  avatar = ''
  name = ''
  loading = false

  key = atob('Q2xpZW50LUlEIDQzMzQzNWRkNjBmNWQ3OQ==')
  @Output() onSave = new EventEmitter<any>()

  constructor(private cookieService: CookieService, private http: HttpClient) {
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
    $("#profileModal").modal('show')
  }

  onFilesSelected(event: any) {
    var reader = new FileReader()
    let that = this
    reader.onload = function(e) {
      let origImg = new Image()
      origImg.src = e.target!.result!.toString()
      origImg.onload = function() {
        let size = Math.min(origImg.height, origImg.width)
        let cropX = origImg.width == size ? 0 : (origImg.width - size) / 2
        let cropY = origImg.height == size ? 0 : (origImg.height - size) / 2

        var canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        let c2d = canvas.getContext('2d')
        c2d!.drawImage(origImg, cropX, cropY, size, size, 0, 0, size, size)
        let newimgUri = canvas.toDataURL("image/png").toString()
        that.avatar = newimgUri
      }
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  async saveProfile() {
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

    $("#profileModal").modal('hide')
    this.onSave.emit({name: this.name, avatar: this.avatar})
  }

}
