# FluxScape

FluxScape is a modern, interactive web application built with Next.js that showcases stunning 3D experiences using Spline. The project features a sleek UI with interactive components, smooth transitions, and dynamic themes.

## ✨ Features

- **Interactive 3D Experiences** - Powered by Spline for immersive 3D content
- **Responsive Design** - Optimized for all device sizes
- **Dark/Light Mode** - Seamless theme switching with persistent user preference
- **Modern UI Components** - Custom Magic UI components with animations and special effects
- **Page Transitions** - Smooth transitions between pages
- **Dock Component** - macOS-inspired dock for navigation

## 🚀 Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety for JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [Spline](https://spline.design/) - 3D design tool for the web
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable UI components
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management for Next.js

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fluxscape.git
cd fluxscape
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home page
│   ├── about/           # About page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── HeroSection.tsx  # Hero section with Spline integration
│   ├── FluxDock.tsx     # Custom dock component
│   ├── magic-ui/        # Magic UI components
│   ├── magicui/         # Special effect components
│   ├── providers/       # Context providers
│   └── ui/              # UI components
└── lib/                 # Utility functions
```

## 🎨 Magic UI Components

FluxScape includes several Magic UI components that add visual flair to the application:

- **Ripple Button** - Buttons with ripple effects
- **Shimmer Button** - Buttons with shimmer animations
- **Text Animate** - Animated text components
- **Dock** - Custom floating dock component
- **Scroll Progress** - Visual indication of scroll position
- **Confetti** - Celebration effects

## 🌙 Theming

FluxScape supports both light and dark modes. The theme is automatically detected from your system preferences but can be manually toggled using the theme switcher in the dock.

## 📱 Responsive Design

The application is fully responsive and optimized for all screen sizes, from mobile to desktop.

## 🔧 Build for Production

```bash
npm run build
# or
yarn build
```

After building, you can preview the production build with:

```bash
npm run start
# or
yarn start
```

## 🚢 Deployment

The easiest way to deploy FluxScape is using the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Spline](https://spline.design/) for the 3D design capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
- All the open-source libraries and tools that made this project possible

---

Created with ❤️ by Your Name - May 2025
