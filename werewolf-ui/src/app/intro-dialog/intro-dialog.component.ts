import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.css']
})
export class IntroDialogComponent implements OnInit {

  @ViewChild('inrtoModal', { static: true}) inrtoModal: TemplateRef<any>

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  showDialog() {
    this.modalService.open(this.inrtoModal, { centered: true })
  }

}
