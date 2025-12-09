import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from './note.service';
import { Note } from './note.model';

type Tab = 'add' | 'list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'CloudNotes';

  notes: Note[] = [];
  loading = false;
  error: string | null = null;

  // Onglets
  activeTab: Tab = 'list';

  // Recherche
  searchTerm = '';

  // Filtre catégorie
  selectedCategory: string | 'ALL' = 'ALL';

  // Catégories définies par l'utilisateur
  userCategories: string[] = [];
  newUserCategory = '';

  // Palette pour les couleurs de catégories
  private colorPalette = [
    '#FF9F1C',
    '#FF6B6B',
    '#E71D36',
    '#6A4C93',
    '#2EC4B6',
    '#4ECDC4',
    '#1A73E8',
    '#F59E0B',
    '#10B981',
  ];
  private categoryColors: Record<string, string> = {};

  // Formulaire de création
  newTitle = '';
  newContent = '';
  newCategory = '';

  // Note sélectionnée
  selectedNote: Note | null = null;
  editTitle = '';
  editContent = '';
  editCategory = '';

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadUserCategories();
    this.loadNotes();
  }

  /* -------------------------- Catégories & couleurs -------------------------- */

  private loadUserCategories() {
    try {
      const stored = localStorage.getItem('cloudnotes_categories');
      if (stored) {
        this.userCategories = JSON.parse(stored);
      }
    } catch {
      this.userCategories = [];
    }
  }

  private saveUserCategories() {
    localStorage.setItem(
      'cloudnotes_categories',
      JSON.stringify(this.userCategories),
    );
  }

  addUserCategory() {
    const name = this.newUserCategory.trim();
    if (!name) return;
    if (!this.userCategories.includes(name)) {
      this.userCategories.push(name);
      this.saveUserCategories();
    }
    this.newUserCategory = '';
  }

  removeUserCategory(cat: string) {
    this.userCategories = this.userCategories.filter((c) => c !== cat);
    this.saveUserCategories();
    if (this.selectedCategory === cat) {
      this.selectedCategory = 'ALL';
    }
  }

  // Toutes les catégories affichées pour filtres / suggestions
  get categories(): string[] {
    const set = new Set<string>();

    // Catégories provenant des notes
    this.notes.forEach((n) => {
      if (n.category && n.category.trim() !== '') {
        set.add(n.category);
      }
    });

    // Catégories définies par l'utilisateur
    this.userCategories.forEach((c) => set.add(c));

    return Array.from(set).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
  }

  // Assigne une couleur à une catégorie si elle n’en a pas encore
  private ensureCategoryColor(cat: string): string {
    if (!cat) return '#9CA3AF'; // gris par défaut
    if (this.categoryColors[cat]) return this.categoryColors[cat];

    const index = Object.keys(this.categoryColors).length;
    const color =
      this.colorPalette[index % this.colorPalette.length] || '#9CA3AF';
    this.categoryColors[cat] = color;
    return color;
  }

  getCategoryColor(cat?: string | null): string {
    if (!cat) return '#9CA3AF';
    return this.ensureCategoryColor(cat);
  }

  /* ------------------------------- Chargement ------------------------------- */

  loadNotes() {
    this.loading = true;
    this.error = null;

    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        this.loading = false;

        if (!this.selectedNote && this.notes.length > 0) {
          this.selectNote(this.notes[0]);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des notes';
        this.loading = false;
      },
    });
  }

  /* --------------------------------- Onglets -------------------------------- */

  setTab(tab: Tab) {
    this.activeTab = tab;
    if (tab === 'add') {
      this.clearNewForm();
    }
  }

  /* ----------------------------- Filtrage notes ----------------------------- */

  setCategoryFilter(category: string | 'ALL') {
    this.selectedCategory = category;
  }

  get filteredNotes(): Note[] {
    return this.notes.filter((n) => {
      const matchesCategory =
        this.selectedCategory === 'ALL' ||
        (n.category ?? '').toLowerCase() ===
          this.selectedCategory.toLowerCase();

      const term = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }

  /* ------------------------------ Création note ----------------------------- */

  createNote() {
    if (!this.newTitle.trim() || !this.newContent.trim()) return;

    const cat = this.newCategory.trim() || null;

    this.loading = true;
    this.error = null;

    this.noteService
      .createNote(this.newTitle.trim(), this.newContent.trim(), cat ?? undefined)
      .subscribe({
        next: (note) => {
          this.notes = [note, ...this.notes];
          this.clearNewForm();
          this.loading = false;
          this.activeTab = 'list';
          this.selectNote(note);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erreur lors de la création de la note';
          this.loading = false;
        },
      });
  }

  clearNewForm() {
    this.newTitle = '';
    this.newContent = '';
    this.newCategory = '';
  }

  /* --------------------------- Sélection / édition -------------------------- */

  selectNote(note: Note) {
    this.selectedNote = note;
    this.editTitle = note.title;
    this.editContent = note.content;
    this.editCategory = note.category ?? '';
  }

  saveSelectedNote() {
    if (!this.selectedNote) return;
    if (!this.editTitle.trim() || !this.editContent.trim()) return;

    const cat = this.editCategory.trim() || null;

    this.loading = true;
    this.error = null;

    this.noteService
      .updateNote(
        this.selectedNote.id,
        this.editTitle.trim(),
        this.editContent.trim(),
        cat ?? undefined,
      )
      .subscribe({
        next: (updated) => {
          this.notes = this.notes.map((n) =>
            n.id === updated.id ? updated : n,
          );
          this.selectedNote = updated;
          this.editTitle = updated.title;
          this.editContent = updated.content;
          this.editCategory = updated.category ?? '';
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erreur lors de la mise à jour de la note';
          this.loading = false;
        },
      });
  }

  /* --------------------------------- Delete --------------------------------- */

  deleteSelectedNote() {
    if (!this.selectedNote) return;
    const id = this.selectedNote.id;

    if (!confirm('Supprimer cette note ?')) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.noteService.deleteNote(id).subscribe({
      next: () => {
        this.notes = this.notes.filter((n) => n.id !== id);
        if (this.notes.length > 0) {
          this.selectNote(this.notes[0]);
        } else {
          this.selectedNote = null;
          this.editTitle = '';
          this.editContent = '';
          this.editCategory = '';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors de la suppression de la note';
        this.loading = false;
      },
    });
  }

  deleteFromList(note: Note, event: MouseEvent) {
    event.stopPropagation();
    this.selectedNote = note;
    this.deleteSelectedNote();
  }

  isSelected(note: Note): boolean {
    return this.selectedNote?.id === note.id;
  }


  /* --------------------------------- Export PDF --------------------------------- */

  exportSelectedNoteAsPdf() {
    if (!this.selectedNote) return;
    const url = `http://localhost:3000/notes/${this.selectedNote.id}/export/pdf`;
    window.open(url, '_blank');
  }
  
}