import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  title = ''
  message = ''
  context = null

  modalRef: NgbModalRef
  @ViewChild('confirmModal', { static: true}) confirmModal: TemplateRef<any>
  @Output() onConfirm = new EventEmitter<any>()
  
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  showDialog(title: string, message: string, context: any) {
    this.title = title
    this.message = message
    this.context = context

    this.modalRef = this.modalService.open(this.confirmModal, { centered: true })
  }

  confirm(){
    this.modalRef.close()
    this.onConfirm.emit(this.context)
  }

}
