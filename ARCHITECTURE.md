# Timetable Command Center - Architecture

## Project Structure

```
culturalprograminvite2025/
├── index.html (943 lines) - Main HTML file
├── index.html.backup (2461 lines) - Original backup
├── REFACTORING_SUMMARY.md - Detailed refactoring documentation
├── ARCHITECTURE.md - This file
│
├── js/ - Modular JavaScript files
│   ├── app.js (388 lines) - Main application entry point
│   ├── constants.js (81 lines) - Configuration constants
│   ├── data.js (318 lines) - Data parsing and management
│   ├── state.js (275 lines) - Application state management
│   ├── utils.js (259 lines) - Utility functions
│   └── views.js (810 lines) - View rendering functions
│
├── css/ - Stylesheets (if separate)
└── data/ - Data files (if separate)
```

## Module Architecture

```
┌─────────────────────────────────────────────────────┐
│                   index.html                        │
│  (HTML Structure, CSS Styles, Module Import)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
          ┌────────────────┐
          │    app.js      │  ← Main Entry Point
          │  (init, event  │
          │   handlers)    │
          └────────┬───────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ↓            ↓            ↓
┌──────────┐ ┌──────────┐ ┌──────────┐
│ views.js │ │ state.js │ │ data.js  │
│(render   │ │(app state│ │(parsing) │
│functions)│ │& cache)  │ │          │
└────┬─────┘ └──────────┘ └──────────┘
     │
     ↓
┌──────────┐ ┌──────────────┐
│ utils.js │ │ constants.js │
│(helpers) │ │(config)      │
└──────────┘ └──────────────┘
```

## Data Flow

```
1. Initialization:
   index.html loads → app.js imports all modules → 
   parseTimetableData() processes rawData → 
   setAllData() stores in state → renderDashboard()

2. View Switching:
   User clicks nav → switchView() called → 
   Update UI state → Render new view → 
   Initialize view-specific features

3. Substitution Management:
   Select teachers → handleGeneratePlan() → 
   findFreeTeachers() → Update state → 
   Render updated view

4. Printing/Sharing:
   User action → preparePrintContent() → 
   renderFullTimetableForPrint() → 
   Print or html2canvas → Share/Download
```

## Key Design Patterns

### 1. Module Pattern
Each file is an ES6 module with explicit imports/exports

### 2. Separation of Concerns
- **constants.js**: Configuration
- **utils.js**: Pure utility functions
- **data.js**: Data management
- **state.js**: State management
- **views.js**: UI rendering
- **app.js**: Orchestration

### 3. Single Responsibility
Each function has one clear purpose with proper documentation

### 4. Dependency Injection
Views receive data from state rather than accessing globals

### 5. Event-Driven Architecture
User interactions trigger events → handlers update state → views re-render

## Security Measures

1. **XSS Prevention**
   - Use `textContent` instead of `innerHTML` where possible
   - Input validation on all user inputs
   - Sanitization functions for HTML content

2. **Input Validation**
   - Type checking on all function parameters
   - Range validation for periods and days
   - Safe default values

3. **Error Handling**
   - Try-catch blocks around critical operations
   - Graceful degradation on errors
   - User-friendly error messages

## Performance Optimizations

1. **Caching**
   - Expensive computations cached in state
   - Cache invalidation on data changes

2. **Debouncing**
   - User input events debounced to reduce processing

3. **Lazy Rendering**
   - Views only render when active
   - Component-level rendering where possible

4. **Auto-refresh Control**
   - Dashboard auto-refresh only when view is active
   - Cleanup on view switch

## API Surface

### Public Functions (window.appHandlers)
```javascript
- switchView(view)
- renderDayView(day)
- renderClassView(className)
- renderTeacherView(teacher)
- handleGeneratePlan(day, teachers)
- handleResetPlan(day)
- handleSubDayChange(day)
- handleAbsentTeacherChange(checkbox)
- handlePrint()
- handleShareScreenshot()
```

### Global Utilities
```javascript
- scrollToTop()
```

## Browser Requirements

- ES6 Modules support
- Modern JavaScript (ES2015+)
- HTML5 Canvas (for screenshots)
- Web Share API (optional, fallback to download)

## Testing Strategy

### Unit Tests (Recommended)
- Test utility functions in isolation
- Test data parsing with various inputs
- Test state management operations

### Integration Tests
- Test view rendering with mock data
- Test event handlers
- Test navigation flow

### E2E Tests
- Test complete user workflows
- Test substitution plan generation
- Test print/share functionality

## Development Workflow

1. **Adding New Features**
   - Determine which module(s) to modify
   - Add constants if needed
   - Add utility functions if needed
   - Update data parsing if needed
   - Add/modify state management
   - Create/update view rendering
   - Add event handlers in app.js

2. **Debugging**
   - Check browser console for errors
   - Use state.cache to inspect cached values
   - Use exportState() to dump current state
   - Check performance metrics

3. **Optimization**
   - Profile with browser DevTools
   - Check render times in performance metrics
   - Optimize expensive operations
   - Add caching where appropriate

## Future Enhancements

### Phase 1: Type Safety
- Convert to TypeScript
- Add interface definitions
- Compile-time type checking

### Phase 2: Testing
- Add Jest or Vitest
- Write unit tests for all modules
- Integration tests for views
- E2E tests with Playwright

### Phase 3: Build Process
- Add Vite or Webpack
- Minification and bundling
- Code splitting
- Tree shaking

### Phase 4: Advanced Features
- Real-time updates (WebSocket)
- API integration
- User authentication
- Data persistence (IndexedDB)
- Progressive Web App capabilities
- Offline support

## Maintenance Guidelines

1. **Code Style**
   - Follow existing patterns
   - Add JSDoc to all functions
   - Use descriptive variable names
   - Keep functions small and focused

2. **Documentation**
   - Update comments when changing code
   - Update ARCHITECTURE.md for major changes
   - Document breaking changes

3. **Version Control**
   - Commit logical changes
   - Write descriptive commit messages
   - Use feature branches

4. **Dependency Management**
   - Keep external libraries up to date
   - Document all CDN dependencies
   - Consider vendoring critical dependencies
