# Budget Manager

Interactive budget planning tool for Contemplative Semester with dynamic relationships between income and expenses.

## Features

- **Dynamic Budget Balancing**: Automatically balances income and expenses
- **Click-to-Edit Numbers**: Click any value to edit it directly
- **Lock Functionality**: Lock values to keep them fixed while adjusting others
- **Dropdown Line Items**: Expand sections to see detailed breakdowns
  - Staff Salaries with Before/During semester breakdown
  - Other Expenses with 7 detailed categories
  - Tuition & Scholarships breakdown
- **Real-time Updates**: Changes update immediately across all budget components
- **Visual Feedback**: Color-coded sections (blue for income, orange for expenses)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## Testing

This project has comprehensive test coverage:

- **219 test cases** across all components
- **95.3% line coverage**
- **95.65% branch coverage**

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with coverage report
npm run test:coverage
```

## Usage

### Adjusting Budget Values

- **Sliders**: Drag sliders to adjust values
- **Click-to-Edit**: Click any dollar amount to type a new value
- **Lock Icons**: Click lock icons to fix specific values while adjusting others

### Dropdown Sections

- Click dropdown arrows to expand:
  - **(Tuition - Scholarships)**: See and adjust tuition and scholarship amounts
  - **Staff Salaries**: View Before Semester and During Semester breakdowns
  - **Other Expenses**: See 7 expense categories (Rent, Food, Legal/Accounting/Insurance, etc.)

### Budget Equation

The app follows this equation:
```
Total Budget = Reserves + (Tuition - Scholarships) + Fundraising = Staff Salaries + Other Expenses
```

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Lucide React (icons)
- Vitest + React Testing Library (testing)
