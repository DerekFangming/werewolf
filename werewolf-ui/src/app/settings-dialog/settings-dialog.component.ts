import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  modalRef: NgbModalRef
  @ViewChild('settingModal', { static: true}) settingModal: TemplateRef<any>
  @Output() onLeave = new EventEmitter<any>()
  @Output() onRestart = new EventEmitter<any>()

  constructor(public gameState: GameStateService, public modalService: NgbModal) { }

  ngOnInit(): void {
  }

  showDialog() {
    this.modalRef = this.modalService.open(this.settingModal, { centered: true })
  }

  restartGame() {
    this.modalRef.close()
    this.onRestart.emit()
  }

  leaveGame() {
    this.modalRef.close()
    this.onLeave.emit()
  }

}
