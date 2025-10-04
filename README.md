# Date Planner

A gamified date planner application that helps you plan, organize, and enjoy perfect dates with your special someone.

## Features

- **Dashboard**: View upcoming dates, date ideas, task overview, and achievements
- **Calendar**: Plan and manage your dates on a calendar view
- **Date Planner**: Browse and filter date ideas, then plan your perfect date
- **Task Management**: Organize tasks related to your date planning
- **Game Center**: Earn achievements and badges for planning successful dates
- **Settings**: Customize your experience with preferences and notifications

## Technologies Used

- React
- React Router
- Styled Components
- date-fns for date manipulation
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/damentame/date_planner.git
   cd date_planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `src/components/`: React components
- `src/data/`: Mock data for development
- `src/styles/`: Global CSS styles
- `public/`: Static assets and HTML template

## Notion Integration

This application integrates with a Notion database to track tasks. To set up the Notion integration:

1. Create a `.env` file in the `agent_integration` directory
2. Add your Notion API credentials:
   ```
   NOTION_API_KEY=your_notion_api_key
   NOTION_DATABASE_ID=your_notion_database_id
   ```

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Description of your changes"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request

## License

This project is licensed under the MIT License.