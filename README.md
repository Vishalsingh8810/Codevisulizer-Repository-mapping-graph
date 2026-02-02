
---

## 🚀 Enhanced Tech Stack Detection & Dependency Graph Customization

This update significantly improves how the project **detects technologies** and **visualizes repository structure**, with special focus on **AI/ML projects**, modern frameworks, and advanced graph customization.

---

### 🔍 Technology Stack Detection

The detection system has been completely upgraded to support a broader and more modern set of technologies across AI, backend, frontend, and mobile development.

#### 🧠 AI & Data Science Support

The system now detects popular AI/ML and data science libraries, including:

* PyTorch
* TensorFlow
* Scikit-learn
* Pandas
* NumPy
* OpenCV
* HuggingFace Transformers
* Other common ML/DL tools

Detection works through files such as:

* `requirements.txt`
* `pyproject.toml`
* `package.json`

When AI/ML libraries are found, a dedicated **AI & Data Science** section appears in the Tech Stack panel.

---

#### 🌐 Expanded Language Support

Newly supported languages include:

* Rust
* Go
* PHP
* Ruby
* Dart (Flutter)
* Swift
* Java / Kotlin (Spring Boot)

This ensures accurate detection for backend-heavy, mobile, and non-JavaScript repositories.

---

#### ⚙️ Frameworks & Tooling

Expanded detection for modern frameworks and tools:

**Frontend**

* Remix
* Astro
* SvelteKit

**Backend / Infrastructure**

* NestJS
* Fastify
* Supabase
* Prisma

---

#### 🎨 UI Enhancements

* Tech stacks are grouped into clear categories
* AI/ML technologies are highlighted with a **Brain icon**
* Categories render dynamically based on repository content

---

## 📊 Dependency Graph Customization

A new **Graph Settings** panel enables powerful, real-time customization of the dependency graph.

---

### 🧩 Layout Options

* **Tree Layout**
  Traditional hierarchical structure for clear parent–child relationships

* **Radial Layout**
  Circular, concentric layout based on file depth
  Helps visualize structural balance and module grouping

---

### 🎨 Color Themes

* **File Type**
  Distinct colors for TS, JS, CSS, JSON, and folders

* **Depth Level**
  Blue gradient indicating how deep a file is in the directory structure

* **Standard**
  Clean, uniform slate theme for a minimalist view

---

## ✅ Verification & Reliability

All enhancements were manually verified for correctness and stability:

* `techDetector.ts` validated against real-world repositories
* `TechStack.tsx` confirmed to correctly render AI/ML categories
* `DependencyGraph.tsx` verified for:

  * Dynamic layout switching
  * Theme updates without reload
  * Accurate radial positioning using trigonometry
  * Correct depth-based color interpolation

---

## 🧭 How to Use

### View Detected Tech Stack

1. Open any repository
2. If supported technologies are present (e.g. ML libs in `requirements.txt` or frameworks in `package.json`)
3. The Tech Stack panel updates automatically

---

### Customize the Dependency Graph

1. Open the **Dependency Graph** view
2. Use the floating **Graph Settings** panel (top-left)
3. Select:

   * Layout: **Tree** or **Radial**
   * Theme: **File Type**, **Depth Level**, or **Standard**
4. Changes apply instantly






