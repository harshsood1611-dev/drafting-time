# DraftKeeper - Template Management System

A modern web application for managing and distributing document templates with user authentication, plan management, and payment integration.

## Features

- **User Authentication**: Secure login and registration system
- **Plan Management**: Monthly, Quarterly, and Yearly subscription plans
- **Template Library**: Organized collection of downloadable templates
- **Admin Dashboard**: Complete template management interface
- **Payment Integration**: Razorpay payment gateway integration
- **Download Tracking**: Monitor user downloads and enforce limits
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Storage**: LocalStorage (for demo purposes)
- **Payment**: Razorpay

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd draftkeeper
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your Razorpay key

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Demo Accounts

The application comes with pre-configured demo accounts:

- **Admin**: admin@demo.com / password123
- **User**: user@demo.com / password123

Note: These accounts are automatically created when you first run the application.

## Project Structure

```
src/
├── components/
│   ├── Admin/           # Admin dashboard components
│   ├── Auth/            # Authentication components
│   ├── Dashboard/       # User dashboard
│   ├── Layout/          # Layout components
│   ├── Plans/           # Plan selection components
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   ├── useAuth.ts       # Authentication hook
│   └── useDrafts.ts     # Draft management hook
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx
└── main.tsx
```

## Configuration

### Data Storage

This demo version uses localStorage for data persistence. In a production environment, you would want to replace this with a proper database solution.

### Razorpay Setup

1. Sign up for a Razorpay account
2. Get your API keys from the dashboard
3. Add your Razorpay key to the `.env` file:
   ```
   VITE_RAZORPAY_KEY_ID=your_actual_razorpay_key
   ```

## Features Overview

### User Features
- Browse and download templates
- 3 free downloads per plan
- Upgrade to premium for unlimited downloads
- Plan selection (Monthly/Quarterly/Yearly)
- Secure payment processing

### Admin Features
- Add, edit, and delete templates
- Manage template visibility
- View download statistics
- User management capabilities

## Build and Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

The project is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify and it will automatically build and deploy.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.