# Projectify | Advanced Project & Task Registry

Projectify is a professional-grade project management ecosystem built with a **Relational Node Architecture**. It enables high-velocity teams to manage project containers while maintaining a strict hierarchical task system. Built with a **React-Vite** frontend and a **Node.js-SQLite** backend, it ensures high performance through server-side logic and cascading data integrity.

## 🚀 Core Features

- **Registry Node Management**: Fully paginated project registry with support for dynamic filtering.
- **Hierarchical Tasking**: Nested task management system allowing multiple sub-entities per project.
- **Relational Integrity**: Engineered with SQL `ON DELETE CASCADE` constraints to prevent orphaned data.
- **Advanced Sorting**: Smart toggle for "Near" and "Far" deadlines to optimize workflow prioritization.
- **Interactive Analytics**: Data visualization using Recharts to monitor project lifecycle distribution.

## 🛠️ Technical Architecture

### **Frontend**
- **React 18 (Vite)**: For high-speed development and optimized production builds.
- **Tailwind CSS**: Utility-first styling for a sleek, dark-themed professional UI.
- **Lucide Icons**: Consistent, modern iconography for registry actions.
- **Axios Interceptors**: Centralized API communication and error handling.

### **Backend**
- **Node.js & Express**: Scalable RESTful API architecture.
- **SQLite3**: Relational database storage with Foreign Key support.
- **JWT & Bcrypt**: Secure session management and industry-standard password hashing.



---

## 📡 API Specification

### **Project Management**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Fetch paginated, filtered, and sorted project registry. |
| `GET` | `/api/projects/:id` | Retrieve comprehensive metadata for a specific node. |
| `POST` | `/api/projects` | Initialize a new project container. |
| `PUT` | `/api/projects/:id` | Update project status or remaining work parameters. |
| `DELETE` | `/api/projects/:id` | Execute cascading delete (Project + Tasks). |

### **Task Management**
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/:id/tasks` | Create a task within a project context. |
| `GET` | `/api/projects/:id/tasks` | List all tasks associated with a project node. |
| `PUT` | `/api/tasks/:id` | Toggle task status (Pending ↔ Completed). |
| `DELETE` | `/api/tasks/:id` | Remove a specific task node from the registry. |

---

## 📂 System Directory

```text
projectify/
├── .gitignore          # Whitelist for VCS
├── backend/            # API & Database Layer
│   ├── config/         # SQL connection (db.js)
│   ├── controllers/    # Business logic (Project/Task)
│   ├── routes/         # REST endpoint definitions
│   └── projectify.sq3  # Relational storage
└── frontend/           # User Interface Layer
    ├── src/
    │   ├── api/        # Centralized Axios config
    │   ├── components/ # Modals & UI Fragments
    │   └── pages/      # Dashboard & Authentication
```

---

## ⚙️ Installation & Deployment

### **Prerequisites**
- Node.js v16.x or higher
- npm / yarn

### **1. Backend Initialization**
```bash
cd backend
npm install
npm start
```
*The SQLite engine will automatically run migrations and initialize the `projectify.sq3` database on startup.*

### **2. Frontend Initialization**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠 Engineering Optimizations

- **Server-Side Pagination**: Offloads data processing to the SQLite engine, ensuring fluid UI performance regardless of dataset size.
- **Referential Integrity**: Utilizes `PRAGMA foreign_keys = ON` to ensure relational consistency across the Projects/Tasks link.
- **Handshake Safety**: Integrated fail-safes in the API client to handle malformed data and prevent UI runtime errors.
- **Memory Management**: Implements `useMemo` and `useCallback` to prevent expensive re-renders during complex sorting operations.

## 📄 License
Distributed under the **MIT License**. Created with a focus on professional excellence and clean code.

***

### **How to add this to your GitHub repository:**
1. Create a file named `README.md` in your root folder.
2. Paste this content.
3. Commit and push:
   ```bash
   git add README.md
   git commit -m "Docs: Implement professional architecture documentation"
   git push origin main
   ```
