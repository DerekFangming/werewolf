import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterOutlet } from '@angular/router'

declare var $: any

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent implements OnInit {

  title = ''
  message = ''
  context = null
  confirmOnly = false
  confirmText = '确定'

  @Output() onConfirm = new EventEmitter<any>()
  
  constructor() { }

  ngOnInit(): void {
  }

  showDialog(title: string, message: string, context: any, confirmOnly = false, confirmText = '确定') {
    this.title = title
    this.message = message
    this.context = context
    this.confirmOnly = confirmOnly
    this.confirmText = confirmText

    $("#confirmModal").modal('show')
  }

  confirm(){
    $("#confirmModal").modal('hide')

    setTimeout(() => {
      this.onConfirm.emit(this.context)
    }, 500)
  }

}
