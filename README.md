# 🌩️ CloudNotes – Application de prise de notes Cloud (POO Avancée)

CloudNotes est une application moderne de prise de notes développée dans le cadre du cours **Programmation Orientée Objet Avancée**.

Elle repose sur une architecture **propre, modulaire et cloud-native**, utilisant :

- **Frontend** : Angular 17 (standalone components)
- **Backend** : NestJS (clean architecture + use cases)
- **Base de données** : DynamoDB simulé via **LocalStack**
- **Infrastructure** : Docker & Docker Compose
- **Architecture Applicative** : Hexagonale / Clean Architecture
- **Stockage persistant** : Volumes Docker pour conserver les données DynamoDB entre redémarrages

L’application permet :

✔️ Ajouter une note  
✔️ Modifier une note  
✔️ Supprimer une note  
✔️ Lister les notes  
✔️ Catégories personnalisées  
✔️ Recherche intégrée    
✔️ Exporter une note en PDF (génération server-side avec PDFKit)
✔️ UI moderne & responsive  
✔️ Backend organisé en **Domain / Application / Infrastructure** selon les principes POO avancée  

---

# 🏗️ Architecture Globale

```
CloudNotes/
│
├── api/                   # Backend NestJS (Clean Architecture)
│   ├── src/
│   │   ├── domain/        # Entités, Value Objects, Repository Interfaces
│   │   ├── application/   # Use Cases (vrai cœur métier)
│   │   └── infrastructure/# Controllers, DynamoDB repo, config
│   └── Dockerfile
│
├── ui/                    # Frontend Angular
│   ├── src/app/
│   └── Dockerfile
│
├── docker-compose.yml     # Orchestration API + UI + LocalStack
└── README.md
```

---

# 🧠 Fonctionnement de l’application

## 🎯 1. Frontend Angular 17

L’interface utilisateur permet :

- Affichage de toutes les notes ✔️  
- Recherche instantanée ✔️  
- Catégories personnalisables ✔️  
- Création d’une note ✔️  
- Modification d’une note ✔️  
- Suppression d’une note ✔️  
- Édition instantanée ✔️
- Bouton Export PDF pour chaque note ✔️    

Toutes les actions passent par des appels HTTP vers le backend.

---

## 🧠 2. Backend NestJS (Clean Architecture)

Le backend suit une architecture propre séparée en trois couches :

### 🧩 Domain

- Entité `Note`
- Value Object `NoteId`
- Interface `NoteRepository`
- Interface pour l'export PDF `NotePdfExporter`

### 🧩 Application

Chaque action du système est un **use case** :

- `CreateNoteUseCase`
- `UpdateNoteUseCase`
- `ListNotesUseCase`
- `GetNoteUseCase`
- `DeleteNoteUseCase`
- `ExportNotePdfUseCase`

Ces use cases ne dépendent **d’aucune technologie**, seulement du domaine.

### 🧩 Infrastructure

- `NoteController` (API REST)
- `NoteDynamoDbRepository` (implémentation du repository)
- `PdfKitNotePdfExporter` (implémentation PDFKit)    
- Configuration AWS / LocalStack
- Module NestJS

👉 Le contrôleur appelle les use cases  
👉 Les use cases appellent le repository  
👉 Le repository persiste les données dans DynamoDB  

C’est exactement ce qu’on appelle une architecture **Clean/Hexagonale**.

---

# 🗄️ 3. Base de données : DynamoDB via LocalStack

LocalStack simule AWS en local.  
Notre app utilise :

- **DynamoDB** pour stocker les notes  
- Un volume persistant pour conserver les données  

Table utilisée :

```
Table: CloudNotesNotes
Partition key: id (string)
```


---

# 📄 4. Export PDF

CloudNotes supporte l’**export d’une note en PDF** directement depuis l’UI, grâce à :   

- Un use case ExportNotePdfUseCase  
- Un service PDFKit personnalisant le rendu
- Une route REST dédié     

Endpoint API :

```
GET /notes/:id/export/pdf
```

Retourne un fichier PDF Content-Type: application/pdf.

---

# ▶️ Lancer le projet

## 🔧 0. Prérequis

Installer :

- Docker  
- Docker Compose  
- (Optionnel) Node.js si vous voulez lancer hors Docker  

---

## 🏁 1. Cloner le projet

```bash
git clone <ton-repo>
cd CloudNotes
```

---

## 🧱 2. Lancer toute l’application avec Docker Compose

```bash
docker-compose up --build
```

Services lancés :

- 📦 LocalStack (DynamoDB)  
- 🟦 API NestJS (http://localhost:3000)  
- 💛 UI Angular (http://localhost:4200)  

👉 Accès UI : **http://localhost:4200**

---

## 🗄️ 3. Créer la table DynamoDB (1ère fois uniquement)

```bash
docker exec -it cloudnotes-localstack-1 awslocal dynamodb create-table   --table-name CloudNotesNotes   --attribute-definitions AttributeName=id,AttributeType=S   --key-schema AttributeName=id,KeyType=HASH   --billing-mode PAY_PER_REQUEST   --region eu-west-1
```

Vérifier :

```bash
docker exec -it cloudnotes-localstack-1 awslocal dynamodb list-tables
```

---

## 💾 4. Persistance des données

Dans `docker-compose.yml` :

```yaml
volumes:
  - ./localstack-data:/var/lib/localstack
```

➡️ Les notes sont conservées même après redémarrage de Docker.

---

# 🧪 Tester l’API directement

### Récupérer toutes les notes

```bash
curl http://localhost:3000/notes
```

### Créer une note

```bash
curl -X POST http://localhost:3000/notes   -H "Content-Type: application/json"   -d '{"title":"Test", "content":"First Test", "category":"Perso"}'
```

---

# 💻 Structure du code (backend)

```
api/
 ├── src/
 │   ├── domain/
 │   │   ├── note.entity.ts
 │   │   ├── note-id.value-object.ts
 │   │   └── note.repository.ts
 │   │   └── note-pdf-exporter.ts 
 │   │
 │   ├── application/
 │   │   └── note/use-cases/
 │   │       ├── create-note.usecase.ts
 │   │       ├── list-notes.usecase.ts
 │   │       ├── get-note.usecase.ts
 │   │       ├── update-note.usecase.ts
 │   │       ├── delete-note.usecase.ts
 │   │       └── export-note-pdf.usecase.ts
 │   │   └── note/dto/
 │   │       ├── create-note.dto.ts
 │   │       ├── update-note.dto.ts
 │   │
 │   └── infrastructure/
 │       ├── api/note.controller.ts
 │       ├── persistence/dynamodb/note-dynamodb.repository.ts
 │       ├── pdf/pdfkit-note-pdf-exporter.ts
 │       
 │
 └── Dockerfile
```

### Ce que ça garantit

✔️ Code testable  
✔️ Faible couplage  
✔️ Découplé de DynamoDB  
✔️ Respect des principes SOLID  
✔️ Conforme à la POO avancée  

---

# 🎨 Le Front (UI)

Construit avec :

- Angular 17  
- Standalone components  
- Design inspiré Apple Notes  
- Recherche instantanée  
- Catégories personnalisées  
- Vue liste + vue détail  
- Edition inline  
- Optimisé pour Desktop
- Export PDF intégré    

---

# 🧹 Commandes utiles

### Arrêter les services

```bash
docker-compose down
```

### Rebuild complet

```bash
docker-compose up --build
```

### Logs API

```bash
docker logs cloudnotes-api-1
```

### Logs LocalStack

```bash
docker logs cloudnotes-localstack-1
```

---

# 🎓 Conclusion

CloudNotes est une application complète respectant :

- Les principes POO avancée (Clean Architecture / DDD Light)  
- Une séparation nette Domain / Application / Infrastructure  
- Une communication 100% API REST  
- Une stack full cloud avec LocalStack  
- Une UI soignée & ergonomique  

C’est une base **solide**, **moderne** et **professionnelle**.    


---

# 📚 Auteurs    

- EL Anouar Ayar Allah
- Mikou Elmamoune
