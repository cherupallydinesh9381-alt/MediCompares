# MediCompares

MediCompares is a **medical product comparison web application** built with React and Vite. It helps users explore medical products, compare prices, vendors, and product details through a responsive web interface.

## Features

* Medical product listing
* Product price comparison
* Vendor information
* Product details
* Product comparison
* Dynamic service sections
* Responsive design for mobile, tablet, laptop, and desktop
* Multiple medical service categories
* Image and asset handling
* Lazy-loaded sections for improved performance
* Vite production build
* Vercel deployment support

## Tech Stack

* **React**
* **Vite**
* **JavaScript / JSX**
* **React Router**
* **React Slick**
* **Bootstrap / CSS**
* **Font Awesome / Icon libraries**
* **REST API integration**

## Project Structure

```text
MediCompares/
│
├── public/
│   ├── assets/
│   └── ...
│
├── src/
│   ├── components/
│   │   └── ui/
│   ├── feature-module/
│   │   └── frontend/
│   ├── utils/
│   └── ...
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── .gitignore
```

## Installation

Clone the repository:

```bash
git clone https://github.com/cherupallydinesh9381-alt/MediCompares.git
```

Go to the project directory:

```bash
cd MediCompares
```

Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Production Build

Create the production build:

```bash
npm run build
```

The production files are generated in:

```text
dist/
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The project is configured for **Vercel deployment** using Vite.

### Vercel Settings

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: /
```

`node_modules/` and `dist/` should not be committed to GitHub.

## Git Workflow

```bash
git add .
git commit -m "Update MediCompares"
git push origin main
```

## Project Purpose

MediCompares provides a centralized platform for users to discover medical products and services and make informed decisions by comparing available products, prices, and vendors.

## License

This project is intended for the MediCompares application and its associated development purposes.
