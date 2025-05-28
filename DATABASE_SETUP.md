# Database Setup Guide

## 🗄️ Supabase Integration

This app now includes full database integration with Supabase for storing and managing code analysis results.

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Database Schema

Run the SQL schema from `database/schema.sql` in your Supabase SQL editor to create all necessary tables.

### 3. Features Implemented

#### ✅ **Project Management**
- Create projects with name and description
- List all projects in dropdown
- Delete projects (with confirmation)
- Track project statistics (files, LOC, functions, components)

#### ✅ **File Analysis & Storage**
- Incremental file processing (only new/changed files)
- Content hashing for change detection
- Full AST analysis with Babel
- Categorization and importance scoring
- Metadata extraction (functions, imports, exports, etc.)

#### ✅ **Performance Optimizations**
- Only processes changed files on re-upload
- Efficient database queries with proper indexing
- Batch operations for file processing
- Compressed file content storage

### 4. How It Works

1. **Project Creation**: User enters project name and uploads files
2. **File Analysis**: Each file is analyzed with Babel AST parser
3. **Change Detection**: Content hashing determines if files need reprocessing
4. **Database Storage**: Files and analysis results stored in normalized tables
5. **Project Loading**: Previously analyzed projects load instantly from database

### 5. Database Tables

- `projects` - Project metadata and statistics
- `files` - File metadata and analysis results
- `file_contents` - Actual file content (separate for performance)
- `dependencies` - File dependency relationships
- `design_tokens` - Extracted design system tokens
- `explanations` - AI-generated code explanations

### 6. API Functions

#### Project Service (`src/lib/database/projects.ts`)
- `createProject()` - Create new project
- `getProjects()` - List all projects
- `getProject(id)` - Get specific project
- `updateProjectStats()` - Update project statistics
- `deleteProject(id)` - Delete project and all files

#### File Service (`src/lib/database/files.ts`)
- `analyzeAndSaveFiles()` - Process and store files
- `hasFileChanged()` - Check if file needs reprocessing
- `analyzeFileContent()` - Extract file metadata
- `getProjectFiles()` - Get all files for project
- `getFileContent()` - Get file content

### 7. Usage

1. Go to "Link Codebase" tab
2. Enter project name
3. Upload files or connect GitHub (coming soon)
4. Files are automatically analyzed and stored
5. Switch between projects using the dropdown
6. All analysis results persist between sessions

### 8. Benefits

- **Fast Loading**: Previously analyzed projects load instantly
- **Incremental Updates**: Only changed files are reprocessed
- **Data Persistence**: Analysis results saved permanently
- **Multi-Project**: Manage multiple codebases
- **Scalable**: Handles large codebases efficiently 