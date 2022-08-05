import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { LobbyComponent } from './lobby/lobby.component'
import { AppRoutingModule } from './app-routing.module'
import { CookieService } from 'ngx-cookie-service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { IntroDialogComponent } from './intro-dialog/intro-dialog.component';
import { SettingDialogComponent } from './setting-dialog/setting-dialog.component'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    ConfirmDialogComponent,
    IntroDialogComponent,
    SettingDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
