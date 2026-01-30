import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Dropdown } from './dropdown/dropdown';
import { Icon } from './icon/icon';

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Dropdown, Icon],
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  task = '';
  search = '';
  isModalOpen = false;

  filter: 'ALL' | 'Completed' | 'Incompleted' = 'ALL';
  taskList: Todo[] = [];

  isDark = false;
  isEditMode = false;
  editingTaskId: number | null = null;

  private API_URL = 'http://127.0.0.1:8000/todos';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') this.enableDark();
    }
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  // API
  loadTodos(): void {
    this.http.get<Todo[]>(this.API_URL).subscribe({
      next: (data) => {
        console.log('API Response:', data);

        if (Array.isArray(data)) {
          this.taskList = data;
        } else if (data && typeof data === 'object' && 'data' in data) {

          this.taskList = (data as any).data;
        } else if (data && typeof data === 'object' && 'todos' in data) {

          this.taskList = (data as any).todos;
        } else {
          console.warn('Unexpected API response structure:', data);
          this.taskList = [];
        }

        console.log('Processed taskList:', this.taskList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading todos:', err);
        this.taskList = [];
        this.cdr.detectChanges();
      },
    });
  }

  addTask(): void {
    if (!this.task.trim()) return;

    const newTask: Partial<Todo> = {
      id: Date.now(),
      task: this.task.trim(),
      completed: false,
    };

    console.log(newTask, 'new task')

    this.http.post<Todo>(this.API_URL, newTask).subscribe({
      next: (response) => {
        console.log('Task added:', response);
        this.loadTodos(); // Reload to get fresh data
        this.closeModal()
      },
      error: (err) => {
        console.error('Error adding task:', err);
        alert('Failed to add task. Please try again.');
      },
    });
  }

  updateTask(): void {
    if (!this.task.trim() || this.editingTaskId === null) return;

    const existing = this.taskList.find(t => t.id === this.editingTaskId);
    if (!existing) return;

    const updatedTask: Todo = {
      ...existing,
      task: this.task.trim(),
    };

    this.http
      .put(`${this.API_URL}/${this.editingTaskId}`, updatedTask)
      .subscribe({
        next: (response) => {
          console.log('Task updated:', response);
          this.loadTodos();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('Failed to update task. Please try again.');
        },
      });
  }

  toggleCompleted(item: Todo): void {
    const updated: Todo = { ...item, completed: !item.completed };

    this.http
      .put(`${this.API_URL}/${item.id}`, updated)
      .subscribe({
        next: (response) => {
          console.log('Task toggled:', response);

          const index = this.taskList.findIndex(t => t.id === item.id);
          if (index !== -1) {
            this.taskList[index] = { ...this.taskList[index], completed: !this.taskList[index].completed };
            this.cdr.detectChanges();
          }

          this.loadTodos();
        },
        error: (err) => {
          console.error('Error toggling task:', err);
          alert('Failed to update task status.');
        },
      });
  }

  deleteTask(id: number): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => {
        console.log('Task deleted:', id);

        this.taskList = this.taskList.filter(t => t.id !== id);
        this.cdr.detectChanges();

        this.loadTodos();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        alert('Failed to delete task. Please try again.');
      },
    });
  }

  //ui part
  toggleTheme(): void {
    this.isDark ? this.disableDark() : this.enableDark();
  }

  enableDark(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
    this.isDark = true;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', 'dark');
    }
  }

  disableDark(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
    this.isDark = false;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', 'light');
    }
  }

  openModal(): void {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.task = '';
    this.editingTaskId = null;
  }

  openEditModal(item: Todo): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.editingTaskId = item.id;
    this.task = item.task;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.task = '';
    this.isEditMode = false;
    this.editingTaskId = null;
  }

  setFilter(value: 'ALL' | 'Completed' | 'Incompleted'): void {
    this.filter = value;
    console.log('Filter set to:', value, 'Filtered tasks:', this.filteredTasks);
  }


  get filteredTasks(): Todo[] {
    if (!this.taskList || !Array.isArray(this.taskList)) {
      return [];
    }

    return this.taskList
      .filter(t => {
        if (this.filter === 'Completed') return t.completed;
        if (this.filter === 'Incompleted') return !t.completed;
        return true;
      })
      .filter(t =>
        t.task && t.task.toLowerCase().includes(this.search.toLowerCase())
      );
  }


  get taskCount(): number {
    return this.taskList?.length || 0;
  }

  get filteredTaskCount(): number {
    return this.filteredTasks?.length || 0;
  }

  trackByFn(index: number, item: Todo): number {
    return item.id;
  }
}