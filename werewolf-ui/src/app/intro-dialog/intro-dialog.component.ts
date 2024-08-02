import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterOutlet } from '@angular/router'

declare var $: any

@Component({
  selector: 'app-intro-dialog',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './intro-dialog.component.html',
  styleUrl: './intro-dialog.component.css'
})
export class IntroDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  showDialog() {
    $("#inrtoModal").modal('show')
  }

}
