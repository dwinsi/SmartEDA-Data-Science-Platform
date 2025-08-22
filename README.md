# SmartEDA - Data Analytics Platform

A modern, enterprise-grade data science web application for exploratory data analysis and machine learning, featuring a FastAPI backend with asynchronous task processing and a React TypeScript frontend.

## 🚀 Features

### Frontend Features

- 🎨 Clean, professional UI with modern design system
- 📊 Drag-and-drop file upload for CSV/XLSX files
- 📈 EDA summary cards with comprehensive dataset insights
- � Machine learning model selection and training interface
- 📱 Fully responsive and accessible design for all devices
- ⚡ Built with React, TypeScript, and Tailwind CSS
- 🔒 Secure file parsing with ExcelJS and PapaParse
- 🔐 Protected routes for sensitive dashboards (EDA/ML)
- 🛡️ Session management with auto-logout on JWT expiration
- 🧑‍🦽 Improved accessibility (ARIA labels, semantic elements)
- 🧩 Error boundaries for robust error feedback
- 🧪 Demo Data button for instant synthetic dataset exploration

### Backend Features

### Backend Features

- 🚀 High-performance FastAPI REST API
- 📊 Automated EDA with pandas profiling
- 🤖 ML pipeline with scikit-learn integration
- ⚡ Asynchronous task processing with Celery
- 🔄 Real-time progress tracking
- 📝 Comprehensive logging and error handling
- ✅ **PEP8 Compliant** - All code follows Python style guidelines
- 🔐 JWT authentication for secure sessions
- 🛡️ Route protection and session expiration logic

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with shadcn/ui components
- **ExcelJS** and **PapaParse** for secure file processing
- **React Router** for scalable navigation and protected routes

### Backend

- **FastAPI** - Modern Python web framework
- **Celery** - Distributed task processing
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **MongoDB** with Beanie ODM (optional)
- **Pydantic** - Data validation and serialization

## 🔒 Security

This project prioritizes security with modern, actively maintained packages:

- **ExcelJS** instead of SheetJS/xlsx - Actively maintained with better security practices
- **PapaParse** for CSV parsing - Fast, secure, and reliable
- **JWT authentication** for stateless, secure sessions
- **Session expiration** and auto-logout for enhanced security
- **csv-parse** as additional backup for CSV processing

### Why we replaced xlsx

The original `xlsx` package had critical security vulnerabilities:

- **CVE-2023-30533**: Prototype Pollution vulnerability
- **CVE-2023-30534**: Regular Expression Denial of Service (ReDoS)

Our alternatives provide the same functionality without these security risks.

## 📁 Project Structure

```text
SmartEDA Data Science Platform/
├── 📁 Frontend (React + TypeScript)
│   ├── components/          # Reusable UI components
│   ├── src/                # Application source code
│   ├── styles/             # Global CSS styles
│   └── utils/              # Utility functions
│
├── 📁 smarteda-backend/    # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   ├── tasks/          # Celery async tasks
│   │   └── celery_app.py   # Celery configuration
│   └── requirements.txt    # Python dependencies
│
└── 📁 Documentation
    ├── API_REFERENCE.md    # API documentation
    ├── DEPLOYMENT_GUIDE.md # Deployment instructions
    └── USER_GUIDE.md       # User documentation
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the project files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## File Format Support

### Supported Formats

- **CSV files** (.csv) - Parsed with PapaParse
- **Excel files** (.xlsx, .xls) - Parsed with ExcelJS

### File Processing Features

- Automatic data type detection (numeric vs categorical)
- Missing value detection and counting
- Basic statistical calculations
- Correlation analysis
- File validation and error handling

## Project Structure

```text
├── App.tsx                 # Main application component
├── src/
│   └── main.tsx           # React entry point
├── components/            # React components
├── utils/
│   └── fileProcessing.ts  # Secure file parsing utilities
├── styles/
│   └── globals.css       # Global styles and Tailwind CSS
├── public/               # Static assets
└── ...config files
```

## Libraries Used

### Core Dependencies

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### File Processing

- **ExcelJS** - Secure Excel file parsing and manipulation
- **PapaParse** - Fast and reliable CSV parsing
- **csv-parse** - Additional CSV processing support
- **file-saver** - Client-side file saving utilities

### Data Visualization

- **Recharts** - React charting library built on D3
- **Lucide React** - Beautiful, customizable icons

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing with Autoprefixer

## Design System

- **Colors**: White background with light blue (#a8dadc) and light green (#a0d6b4) accents
- **Typography**: Inter font family with 14px base size
- **Components**: Rounded buttons with subtle hover shadows
- **Icons**: Modern, clean iconography from Lucide
- **Layout**: Generous spacing for clean, airy feel

## Security Best Practices

- No use of `eval()` or similar unsafe functions
- Secure file parsing without prototype pollution risks
- Input validation and sanitization
- Type safety with TypeScript
- Regular dependency updates and security audits

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checking
6. Submit a pull request

## License

MIT License - see LICENSE file for details
