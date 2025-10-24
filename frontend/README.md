# Moov KPI Dashboard - Frontend

A modern Vue.js 3 dashboard for visualizing Moov KPI metrics and analytics.

## Features

- **Interactive Dashboard**: Real-time KPI visualization with charts and metrics
- **Multiple Chart Types**: Line charts, bar charts, pie charts, and heatmaps
- **Responsive Design**: Mobile-friendly interface with Vuetify components
- **Date Range Selection**: Filter data by custom date ranges
- **Export Functionality**: Download reports in various formats
- **Authentication**: Secure login and user management
- **Modern UI**: Built with Vuetify 3 and Tailwind CSS

## Tech Stack

- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Vuetify 3**: Material Design component framework for Vue.js
- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **Pinia**: State management for Vue.js
- **Chart.js**: Simple yet flexible JavaScript charting library
- **Axios**: HTTP client for API requests
- **Vite**: Fast build tool and development server
- **Material Design Icons**: Icon library for consistent UI

## UI Frameworks

### Vuetify 3
- **Rich Components**: Pre-built Material Design components (cards, buttons, dialogs, etc.)
- **Theme System**: Customizable color palette and typography
- **Responsive Grid**: Built-in breakpoint system for mobile-first design
- **Auto-import**: Components are automatically imported for better performance

### Tailwind CSS
- **Utility Classes**: Rapid styling with utility-first approach
- **Custom Design System**: Extended color palette and component classes
- **Responsive Utilities**: Mobile-first responsive design helpers
- **Performance**: Purge unused CSS in production builds

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── charts/          # Chart components (LineChart, BarChart, etc.)
│   └── widgets/         # UI widgets (KpiCard, DatePicker, etc.)
├── layouts/             # Layout components
├── router/              # Vue Router configuration
├── services/            # API services
├── stores/              # Pinia stores
├── utils/               # Utility functions
├── assets/
│   └── styles/          # SCSS variables and Tailwind utilities
└── views/               # Page components
```

## Styling Guide

### Vuetify Components
Use Vuetify components for complex UI elements:
```vue
<v-card>
  <v-card-title>Card Title</v-card-title>
  <v-card-text>Card content</v-card-text>
</v-card>
```

### Tailwind Utilities
Use Tailwind for custom styling and utilities:
```vue
<div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Custom styled content
</div>
```

### Custom Components
Pre-built component classes are available in `main.css`:
```vue
<button class="btn btn-primary">Primary Button</button>
<div class="card">Card content</div>
```

## API Integration

The frontend communicates with the backend API through the `services/api.js` file. Make sure the backend is running and the API base URL is correctly configured in the `.env` file.

## Contributing

1. Follow the existing code style
2. Use Vuetify components for complex UI elements
3. Use Tailwind utilities for custom styling
4. Run linting before committing
5. Test your changes thoroughly
6. Update documentation as needed

## License

This project is proprietary software.