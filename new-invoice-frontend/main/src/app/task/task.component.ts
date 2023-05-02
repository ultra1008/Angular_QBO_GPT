import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  UntypedFormGroup,
  UntypedFormControl,
  UntypedFormBuilder,
} from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Task } from './task.model';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent {
  mode = new UntypedFormControl('side');
  taskForm: UntypedFormGroup;
  showFiller = false;
  isNewEvent = false;
  dialogTitle?: string;
  userImg?: string;
  tasks: Task[] = [];

  breadscrums = [
    {
      title: 'Task',
      items: [],
      active: 'Task',
    },
  ];

  constructor(private fb: UntypedFormBuilder, private http: HttpClient) {
    const blank = {} as Task;
    this.taskForm = this.createFormGroup(blank);

    this.fetch((data: Task[]) => {
      this.tasks = data;
    });
  }

  fetch(cb: (i: Task[]) => void) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/task.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
  }
  toggle(task: { done: boolean }, nav: MatSidenav) {
    nav.close();
    task.done = !task.done;
  }
  addNewTask(nav: MatSidenav) {
    this.resetFormField();
    this.isNewEvent = true;
    this.dialogTitle = 'New Task';
    this.userImg = 'assets/images/user/user1.jpg';
    nav.open();
  }
  taskClick(task: Task, nav: MatSidenav): void {
    this.isNewEvent = false;
    this.dialogTitle = 'Edit Task';
    this.userImg = task.img;
    nav.open();
    this.taskForm = this.createFormGroup(task);
  }
  closeSlider(nav: MatSidenav) {
    nav.close();
  }
  createFormGroup(data: Task) {
    return this.fb.group({
      id: [data ? data.id : this.getRandomID()],
      img: [data ? data.img : 'assets/images/user/user1.jpg'],
      name: [data ? data.name : null],
      title: [data ? data.title : null],
      done: [data ? data.done : null],
      priority: [data ? data.priority : null],
      due_date: [data ? data.due_date : null],
      note: [data ? data.note : null],
    });
  }
  saveTask() {
    this.tasks.unshift(this.taskForm.value);
    this.resetFormField();
  }
  editTask() {
    const targetIdx = this.tasks
      .map((item) => item.id)
      .indexOf(this.taskForm.value.id);
    this.tasks[targetIdx] = this.taskForm.value;
  }
  deleteTask(nav: MatSidenav) {
    const targetIdx = this.tasks
      .map((item) => item.id)
      .indexOf(this.taskForm.value.id);
    this.tasks.splice(targetIdx, 1);
    nav.close();
  }
  resetFormField() {
    this.taskForm.controls['name'].reset();
    this.taskForm.controls['title'].reset();
    this.taskForm.controls['done'].reset();
    this.taskForm.controls['priority'].reset();
    this.taskForm.controls['due_date'].reset();
    this.taskForm.controls['note'].reset();
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
