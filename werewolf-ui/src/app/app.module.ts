import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { GameComponent } from './game/game.component'
import { AppRoutingModule } from './app-routing.module'
import { FormsModule } from '@angular/forms'
import { CookieService } from 'ngx-cookie-service'

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
