# 🎓 Timetable Command Center

<div align="center">

**Modern Timetable Management System for Veer Patta Public School**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](package.json)
[![Maintenance](https://img.shields.io/badge/Maintained-yes-brightgreen.svg)](https://github.com/veerpatta/culturalprograminvite2025)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

A comprehensive, intelligent timetable management system designed specifically for school administrators and teachers. Features real-time teacher availability tracking, smart substitution planning, and multiple view modes for different scheduling needs.

### Key Highlights

- **Intelligent Substitution Planning**: Automatically suggests the best substitute teachers based on workload and availability
- **Real-Time Insights**: Live dashboard showing current period, free teachers, and daily statistics
- **Multiple View Modes**: Dashboard, Day, Class, Teacher, and Substitution views
- **Export & Share**: Print-friendly layouts and WhatsApp-ready screenshot sharing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Quick navigation with Alt+1 through Alt+5

---

## ✨ Features

### 🎯 Core Functionality

#### 1. **Dashboard View**
- Current date and time with auto-refresh
- Real-time statistics (active classes, total teachers, current substitutions)
- Live free teacher finder for any period
- Today's schedule overview
- Quick action buttons

#### 2. **Day View**
- Complete schedule for any day of the week
- Visual indicators for current period
- All classes shown side-by-side
- Substitution status highlighting
- Export and print capabilities

#### 3. **Class View**
- Detailed weekly schedule for individual classes
- Filter by class (Classes 1-12, including streams)
- Subject and teacher information
- Period-by-period breakdown

#### 4. **Teacher View**
- Individual teacher schedules
- Workload statistics (periods per day/week)
- Cross-class teaching visibility
- Availability tracking

#### 5. **Substitution Management**
- Mark teachers as absent
- Auto-generate intelligent substitution plans
- Consider teacher workload and availability
- Track and modify substitutions
- Clear all substitutions feature

### 🚀 Advanced Features

- **Smart Caching**: Performance optimizations for large datasets
- **Free Teacher Finder**: Real-time availability checking for any day/period
- **Workload Balancing**: Substitution algorithm considers current teacher load
- **Screenshot Sharing**: Export timetables as images for WhatsApp or download
- **Print Optimization**: Special print stylesheets for paper-friendly output
- **Keyboard Navigation**: Alt+1-5 shortcuts for quick view switching
- **Mobile Responsive**: Touch-friendly interface on all screen sizes

---

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 16+ (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/veerpatta/culturalprograminvite2025.git
   cd culturalprograminvite2025
   ```

2. **Open in browser** (Simple method)
   ```bash
   # Just open index.html in your browser
   open index.html  # macOS
   xdg-open index.html  # Linux
   start index.html  # Windows
   ```

3. **Use a local server** (Recommended for development)
   ```bash
   # Option 1: Using Node.js http-server
   npx http-server -p 8080 -o

   # Option 2: Using Python
   python -m http.server 8080

   # Option 3: Using PHP
   php -S localhost:8080
   ```

4. **Access the application**
   ```
   http://localhost:8080
   ```

### Development Setup

```bash
# Install development dependencies (optional)
npm install

# Run development server with live reload
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

---

## 📖 Documentation

### Architecture

The application follows a modern modular architecture:

```
culturalprograminvite2025/
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # All styles (extracted from inline)
├── js/
│   ├── app.js          # Main entry point & initialization
│   ├── constants.js     # Configuration & constants
│   ├── data.js         # Data parsing & management
│   ├── state.js        # State management
│   ├── utils.js        # Utility functions
│   └── views.js        # View rendering functions
├── data/
│   └── timetable_raw.txt  # Raw timetable data
├── package.json        # Project metadata
├── README.md           # This file
├── ARCHITECTURE.md     # Detailed architecture docs
└── REFACTORING_SUMMARY.md  # Refactoring details
```

### Module Overview

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| **app.js** | Application entry point | `initializeApp()`, `switchView()`, event handlers |
| **constants.js** | Configuration | Period times, special teachers, settings |
| **data.js** | Data management | `parseTimetableData()`, data loading |
| **state.js** | State management | Substitution management, cache handling |
| **utils.js** | Utilities | `showToast()`, `getCurrentPeriod()`, formatters |
| **views.js** | UI rendering | `renderDashboard()`, `renderDayView()`, etc. |

### Key Concepts

#### **Timetable Data Structure**

The timetable data is organized as:
- **Days**: Monday through Saturday
- **Periods**: 8 periods per day (8:30 AM - 2:10 PM)
- **Classes**: 16 classes (Class 1-10, Class 11/12 Science/Commerce/Arts)
- **Break**: Between Period 4 and Period 5 (11:10-11:30 AM)

#### **State Management**

The application maintains centralized state:
```javascript
{
  currentView: 'Dashboard',  // Active view
  substitutions: {},         // Day -> Period -> Substitution mapping
  allData: {},              // Parsed timetable data
  cache: Map(),             // Performance cache
  performanceMetrics: {}    // Performance tracking
}
```

#### **Substitution Algorithm**

When generating substitution plans:
1. Identifies teachers available during the period
2. Excludes absent teachers
3. Excludes teachers with scheduled classes
4. Excludes special teachers (Gyan, Phy) who can't substitute
5. Ranks remaining teachers by current workload
6. Assigns substitutes starting with least-loaded teachers

---

## 🎨 User Guide

### Navigation

**Via Menu:**
- Click any navigation button (Dashboard, Day, Class, Teacher, Substitution)

**Via Keyboard:**
- `Alt+1`: Dashboard
- `Alt+2`: Day View
- `Alt+3`: Class View
- `Alt+4`: Teacher View
- `Alt+5`: Substitution View

### Using the Free Teacher Finder

1. Go to **Dashboard** view
2. In the "Free Teacher Finder" card:
   - Select a day from the dropdown
   - Select a period from the dropdown
3. View instantly available teachers for that slot
4. See count of free teachers

### Managing Substitutions

1. Navigate to **Substitution** view
2. Select the day
3. Check boxes next to absent teachers
4. Click **Generate Substitution Plan**
5. Review suggested substitutes
6. Modify if needed by clicking **Modify** button
7. Clear all with **Clear All Substitutions**

### Exporting & Printing

**Print:**
1. Navigate to desired view (Day/Class/Teacher)
2. Click the **Print** button
3. Use browser print dialog
4. Optimized layouts will automatically apply

**Share Screenshot:**
1. Click **Screenshot** button
2. Choose **Share to WhatsApp** or **Download**
3. Image captured and ready to share

---

## 🔧 Customization

### Updating Timetable Data

The timetable data is currently embedded in `js/data.js`. To update:

1. Open `js/data.js`
2. Locate the `rawData` constant
3. Update the CSV-formatted data following this pattern:
   ```
   DayName
   Class,Period 1<br>Time,Period 2<br>Time,...
   ClassName,Subject (Teacher),Subject (Teacher),...
   ```

**Future Enhancement:** Move to external JSON file for easier updates.

### Modifying Styles

All styles are in `css/styles.css`. Key CSS variables:

```css
:root {
  --primary-600: #2563eb;   /* Main brand color */
  --gray-50: #f9fafb;       /* Light background */
  --shadow-lg: ...;         /* Shadow effects */
  --radius: 0.5rem;         /* Border radius */
}
```

### Configuring Constants

Edit `js/constants.js` to modify:
- Period times
- Special teachers list
- School hours
- Cache duration
- Other configuration values

---

## 🛠️ Technical Details

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide Icons
- **Export**: html2canvas library
- **Module System**: ES6 Modules

### Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- Intelligent caching for expensive computations
- Debounced user inputs
- Lazy evaluation where possible
- Performance metrics tracking
- Optimized DOM manipulation

### Security

- ✅ XSS prevention via `textContent` usage
- ✅ Input validation on all user inputs
- ✅ Sanitized data handling
- ✅ No eval() or unsafe practices
- ⚠️ **Note**: No authentication system (add for production)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the bug is already reported in [Issues](https://github.com/veerpatta/culturalprograminvite2025/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a new issue with the `enhancement` label
2. Describe the feature and its benefits
3. Provide mockups or examples if possible

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use ES6+ JavaScript features
- Follow existing code formatting
- Add JSDoc comments for functions
- Keep functions small and focused
- Write self-documenting code

---

## 🗺️ Roadmap

### Version 2.1 (Next)
- [ ] External JSON data file support
- [ ] Data validation and error handling improvements
- [ ] Unit tests (Jest/Vitest)
- [ ] Accessibility improvements (WCAG AA compliance)

### Version 2.2
- [ ] TypeScript migration
- [ ] Backend API for data management
- [ ] Real-time updates (WebSockets)
- [ ] User authentication and authorization

### Version 3.0
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Mobile app (React Native/Flutter)
- [ ] Admin panel for timetable editing
- [ ] Database integration (PostgreSQL/MongoDB)

---

## 📊 Project Stats

- **Lines of Code**: ~2,500 (JavaScript) + ~900 (CSS) + ~900 (HTML)
- **Modules**: 6 JavaScript modules
- **Classes Supported**: 16 classes (1-12 with streams)
- **Teachers Tracked**: 25+ teachers
- **Periods Per Day**: 8 periods
- **Days Covered**: 6 days (Monday-Saturday)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Veer Patta Public School** - For the opportunity to create this system
- **Lucide Icons** - Beautiful icon set
- **html2canvas** - Screenshot functionality
- All teachers and staff who provided feedback

---

## 📞 Support

For support and questions:

- 📧 Email: support@veerpattaschool.edu (replace with actual email)
- 🐛 Issues: [GitHub Issues](https://github.com/veerpatta/culturalprograminvite2025/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/veerpatta/culturalprograminvite2025/discussions)

---

## 📚 Additional Resources

- [Refactoring Summary](REFACTORING_SUMMARY.md) - Details of v2.0 refactoring
- [Architecture Documentation](ARCHITECTURE.md) - System architecture deep dive
- [Change Log](CHANGELOG.md) - Version history (to be created)

---

<div align="center">

**Made with ❤️ for education**

[⭐ Star this repo](https://github.com/veerpatta/culturalprograminvite2025) if you find it helpful!

</div>
