import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DATA_MOCK } from './models/DATA_MOCK';
import { FormGroup } from '@angular/forms';
import { DynamicSectionContainer } from './dynamic/controls/dynamic-section-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DynamicSectionContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  child = DATA_MOCK.fields[0];
  formGroup = new FormGroup({})

  print() {
    console.log(this.formGroup.value);
    console.log(this.formGroup);
  }

}

