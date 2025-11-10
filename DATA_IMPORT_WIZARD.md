# Data Import Wizard - 3-Step Interface

## Overview
The ImportDataPage now features a **boomer-friendly 3-step wizard** for importing data into Weaviate with automatic embedding via local LLMs.

## Architecture

```
User Interface (Frontend)
  ↓
Step 1: File Upload → Data Parsing
  ↓
Step 2: Configure & Preview → Collection Name, Model Selection
  ↓
Step 3: Review & Import → Embedding + Weaviate Storage
  ↓
Backend (/api/import/start)
  ↓
IngestionManager (embeddings)
  ↓
EmbeddingRouter (auto-detect file type)
  ↓
Smart Chunkers (TXT/CSV/PDF handlers)
  ↓
@xenova/transformers (local embedding)
  ↓
Weaviate Client
  ↓
Weaviate Vector Database
```

## Step 1: Upload Files

### What happens:
1. User clicks the drag-and-drop zone or selects a file
2. Supported formats:
   - **TXT**: Automatically split into paragraphs
   - **CSV**: Parsed with headers, converted to records
   - **JSON**: Parsed directly as array of objects

### UI Elements:
- Large drag-and-drop zone with emoji icon (📁)
- File size display after upload
- Record count confirmation
- Auto-advance to Step 2

### Code:
```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  // File parsing logic here
  // Auto-advances to Step 2
};
```

---

## Step 2: Configure & Preview

### What happens:
1. User reviews parsed records
2. Customizes collection name
3. Selects embedding model
4. Sees preview of first 3 records

### Configuration Options:

**Collection Name**
- Auto-populated from filename (extension removed)
- Editable text input
- Used as Weaviate collection name

**Embedding Model**
- `sentence-transformers/all-mpnet-base-v2` (default, best for text)
- `sentence-transformers/all-minilm-l6-v2` (faster, smaller)
- `Xenova/gte-small` (best for CSV/structured data)

**Data Preview**
- Shows first 3 records as JSON
- Displays count of remaining records
- Scrollable for long content

### UI Elements:
- Form inputs with Elysia styling
- Dropdown for model selection
- Preview scrollable box
- Back/Review buttons

---

## Step 3: Review & Import

### What happens:
1. User reviews import summary
2. Clicks "Import Now" button
3. Frontend shows progress bar (0-100%)
4. Backend processes files and returns success/failure

### Import Summary Shows:
- Collection name
- Total records count
- Selected embedding model

### Progress Tracking:
- Real-time progress bar (blue-to-purple gradient)
- Percentage display (0-100%)
- Success/error messages
- Auto-reset after 2 seconds on success

### UI Elements:
- Summary box with all settings
- Animated progress bar
- Error display (if any)
- Success confirmation
- Back button to edit, "Import Now" button to proceed

---

## File Type Handling

### TXT Files
```typescript
// Split by double newlines (paragraphs)
records = content
  .split("\n\n")
  .filter((p) => p.trim())
  .map((p, idx) => ({ id: idx + 1, content: p.trim() }));
```

### CSV Files
```typescript
// Parse with headers
const lines = content.split("\n");
const headers = lines[0].split(",");
records = lines.slice(1).map((line) => {
  const values = line.split(",");
  return headers.reduce((obj, header, idx) => {
    obj[header.trim()] = values[idx]?.trim();
    return obj;
  }, {});
});
```

### JSON Files
```typescript
// Direct parse
records = JSON.parse(content);
```

---

## Backend Integration

### API Endpoint: `POST /api/import/start`

**Request Payload:**
```json
{
  "tenant_id": "user-tenant-id",
  "collection_name": "my_data",
  "data_records": [
    { "id": 1, "content": "..." },
    { "id": 2, "content": "..." }
  ],
  "embedder_config": {
    "provider": "local",
    "model": "sentence-transformers/all-mpnet-base-v2",
    "vectorField": "content"
  }
}
```

**Response:**
```json
{
  "success": true,
  "import_id": "import-uuid",
  "summary": {
    "collection_name": "my_data",
    "records_imported": 100,
    "records_failed": 0,
    "total_chunks": 120,
    "duration_ms": 5432,
    "embedder": {
      "provider": "local",
      "model": "sentence-transformers/all-mpnet-base-v2"
    }
  }
}
```

---

## Embedding Pipeline

1. **File Upload** → Frontend parses file
2. **Blob Creation** → Convert to File object
3. **IngestionManager** → Processes via EmbeddingRouter
4. **Handler Selection** → Auto-detect file type
5. **Chunking** → Smart chunking per document type
6. **Embedding** → @xenova/transformers (local LLM)
7. **Vector Generation** → 384-dim embeddings
8. **RBAC Metadata** → Tenant + User filtering
9. **Weaviate Storage** → Batch insert with vectors
10. **Audit Trail** → Log all operations

---

## Error Handling

### Frontend Errors:
```typescript
try {
  // Import logic
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : "Import failed";
  setImportError(errorMsg);
  showErrorToast("Import Error", errorMsg);
}
```

### Backend Errors:
- Missing `tenant_id` → 400 Bad Request
- Missing `collection_name` → 400 Bad Request
- No data records → 400 Bad Request
- User not found → 404 Not Found
- Tenant config not found → 404 Not Found
- Weaviate connection failed → 500 Server Error
- Embedding failed → 500 Server Error

---

## UX Features

### Progress Indication:
- Step indicator at top (Step X of 3)
- Progress bar below title
- Visual feedback on button states

### Validation:
- "Next" button disabled until file uploaded
- "Review" button always enabled on Step 2
- "Import Now" button disabled during import

### User-Friendly Messaging:
- Clear step descriptions
- File size display
- Record count confirmation
- Success/error toasts
- Import duration tracking

### Auto-Navigation:
- Step 1 → Step 2 after file parsed
- Step 3 → Back to Step 1 after 2s success

---

## Best Practices Implemented

✅ **Boomer-Friendly**: Simple 3-step wizard, large buttons, clear instructions  
✅ **Local-First**: All processing on client/local backend (no external APIs)  
✅ **Type-Safe**: Full TypeScript typing throughout  
✅ **Error Resilient**: Comprehensive error handling + user feedback  
✅ **Accessible**: Clear labels, large touch targets, readable fonts  
✅ **Performant**: Client-side parsing, optimized batch processing  
✅ **Scalable**: Handles CSV, TXT, JSON, PDF (via backend)  
✅ **RBAC-Ready**: Metadata includes tenant + user for filtering  
✅ **Audit Trail**: Complete logging of all operations  

---

## Future Enhancements

- [ ] Drag-and-drop support (currently click-to-upload)
- [ ] Multi-file batch upload
- [ ] PDF support with OCR
- [ ] Column mapping for CSV
- [ ] Custom chunking parameters
- [ ] Model comparison/preview
- [ ] Import scheduling
- [ ] Duplicate detection
- [ ] Data quality scoring
- [ ] Webhook notifications

---

## Testing Checklist

- [ ] Upload TXT file → Records parsed into paragraphs
- [ ] Upload CSV file → Records parsed with headers
- [ ] Upload JSON file → Records parsed directly
- [ ] Collection name customization → Reflects in Weaviate
- [ ] Model selection → Affects embedding dimension
- [ ] Data preview → Shows first 3 records
- [ ] Progress tracking → Bar reaches 100%
- [ ] Error handling → Toast shows on failure
- [ ] Success message → Shows record count
- [ ] Auto-reset → Form clears after success


