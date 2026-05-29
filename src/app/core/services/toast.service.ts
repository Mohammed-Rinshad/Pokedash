import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

/**
 * Lightweight app-wide toast notifications (no Material dependency).
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);

  public readonly toasts = this._toasts.asReadonly();

  public success(message: string, durationMs = 3500): void {
    this.show(message, 'success', durationMs);
  }

  public error(message: string, durationMs = 4000): void {
    this.show(message, 'error', durationMs);
  }

  public show(message: string, type: ToastType, durationMs: number): void {
    const id = ++this.nextId;
    const toast: ToastMessage = { id, type, message };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  public dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
