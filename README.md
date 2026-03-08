# BMW M4 Competition Showcase

An immersive 3D web experience showcasing the BMW M4 Competition with scroll-driven camera animations and interactive 3D model.

## Features

- 3D BMW M4 model with realistic lighting and reflections
- Smooth scroll-driven camera animations
- Elegant typewriter text effects
- Responsive design for all devices
- Premium showroom environment with dynamic lighting

## Tech Stack

- React + Vite
- Three.js & React Three Fiber
- Framer Motion for animations
- Custom scroll physics

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

- `/src/components` - React components (BmwModel, TypewriterText, etc.)
- `/public` - 3D models and assets
- `/src/App.jsx` - Main application with scroll logic
- `/src/App.css` - Styling and animations

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
