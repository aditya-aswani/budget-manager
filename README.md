# Budget Tracker

A simple web-based budget tracker that allows you to manage and allocate budget across different categories with smart auto-adjustment features.

## Features

- **Interactive Budget Categories**:
  - Budget Total
  - Staff Costs
  - Fixed Costs
  - Other Variable Costs
  - Scholarships to Participants

- **Smart Sliders**: Adjust budget allocations with intuitive range sliders
- **Lock/Unlock System**: Lock specific categories to prevent them from auto-adjusting
- **Auto-adjustment Logic**: When you change one category, others automatically adjust to maintain budget balance
- **Real-time Summary**: See total allocated budget and remaining funds instantly
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## How to Use

1. **Start the application**:
   ```bash
   python3 -m http.server 8000
   ```

2. **Open in browser**: Navigate to `http://localhost:8000`

3. **Adjust Budget**:
   - Use sliders to change budget allocations
   - Click lock icons (🔓/🔒) to lock/unlock categories
   - Locked categories won't change when other sliders are adjusted
   - Watch the summary update in real-time

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - JavaScript logic for budget calculations and interactions

## Technology

- Pure HTML, CSS, and JavaScript (no dependencies)
- Modern CSS with gradients and animations
- Responsive design with mobile support