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

  constructor(public gameState: GameStateService, public modalService: NgbModal) { }

  ngOnInit(): void {
  }

  showDialog() {
    this.modalRef = this.modalService.open(this.announcerModal, { centered: true })
  }

}
