import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from './note.model';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly apiUrl = 'http://localhost:3000/notes';

  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  createNote(title: string, content: string, category?: string): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, { title, content, category });
  }

  updateNote(id: string, title: string, content: string, category?: string): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}`, { title, content, category });
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}