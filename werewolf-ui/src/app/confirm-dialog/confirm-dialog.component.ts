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
  confirmOnly = false
  confirmText = '确定'

  modalRef: NgbModalRef
  @ViewChild('confirmModal', { static: true}) confirmModal: TemplateRef<any>
  @Output() onConfirm = new EventEmitter<any>()
  
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  showDialog(title: string, message: string, context: any, confirmOnly = false, confirmText = '确定') {
    this.title = title
    this.message = message
    this.context = context
    this.confirmOnly = confirmOnly
    this.confirmText = confirmText

    if (confirmOnly) {
      this.modalRef = this.modalService.open(this.confirmModal, { centered: true, backdrop: 'static', keyboard: false })
    } else {
      this.modalRef = this.modalService.open(this.confirmModal, { centered: true })
    }
  }

  confirm(){
    this.modalRef.close()
    this.onConfirm.emit(this.context)
  }

}
