import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dropdown } from './dropdown/dropdown';


@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Dropdown],
  templateUrl: './app.html',
})
export class App {
  task = '';
  search = '';
  isModalOpen = false;
  filter: 'ALL' | 'Completed' | 'Incompleted' = 'ALL';


  taskList: { id: number; task: string; completed: boolean }[] = [];

  //Edit state
  isEditMode = false;
  editingTaskId: number | null = null;

  // Open Add Modal
  openModal() {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.task = '';
  }

  //Close Modal
  closeModal() {
    this.isModalOpen = false;
    this.task = '';
    this.isEditMode = false;
    this.editingTaskId = null;
  }

  //CREATE
  addTask() {
    if (!this.task.trim()) return;

    this.taskList.push({
      id: Date.now(),
      task: this.task,
      completed: false,
    });

    this.closeModal();
  }

  //Open Edit Modal
  openEditModal(item: { id: number; task: string }) {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.editingTaskId = item.id;
    this.task = item.task;
  }

  //UPDATE
  updateTask() {
    if (!this.task.trim() || this.editingTaskId === null) return;

    const task = this.taskList.find(t => t.id === this.editingTaskId);
    if (task) task.task = this.task;

    this.closeModal();
  }

  toggleCompleted(item: any) {
    item.completed = !item.completed;
  }

  deleteTask(id: number) {
    this.taskList = this.taskList.filter(t => t.id !== id);
  }

  setFilter(value: 'ALL' | 'Completed' | 'Incompleted') {
    this.filter = value;
  }
  get hasIncomplete() {
    return this.incompleteTasks.length > 0;
  }

  get hasCompleted() {
    return this.completedTasks.length > 0;
  }

  get hasAnyTask() {
    return this.hasIncomplete || this.hasCompleted;
  }

  get incompleteTasks() {
    return this.taskList.filter(
      t =>
        !t.completed &&
        t.task.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  get completedTasks() {
    return this.taskList.filter(
      t =>
        t.completed &&
        t.task.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}
