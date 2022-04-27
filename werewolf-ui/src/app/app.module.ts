import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { LobbyComponent } from './lobby/lobby.component'
import { AppRoutingModule } from './app-routing.module'
import { FormsModule } from '@angular/forms'
import { CookieService } from 'ngx-cookie-service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    ConfirmDialogComponent
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
