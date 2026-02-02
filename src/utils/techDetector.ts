import type { FileNode, TechStack } from '../types';
import { fetchFileContent } from '../services/github';

export async function detectTechStack(root: FileNode, owner: string, repo: string): Promise<TechStack> {
    const stack: TechStack = {
        frontend: [],
        backend: [],
        languages: [],
        tools: [],
        ai_ml: []
    };

    // Helper to find file in root
    const findFile = (name: string) => {
        return root.children?.find(child => child.name.toLowerCase() === name.toLowerCase());
    };

    // Helper to check content
    const checkFileContent = async (fileNode: FileNode, checks: (content: string) => void) => {
        const content = await fetchFileContent(owner, repo, fileNode.path);
        if (content) {
            checks(content.toLowerCase());
        }
    };

    // --- JavaScript / Node.js Analysis ---
    const packageJsonNode = findFile('package.json');
    if (packageJsonNode) {
        if (!stack.languages.includes('JavaScript')) stack.languages.push('JavaScript');
        stack.tools?.push('Node.js');
        stack.tools?.push('NPM');

        await checkFileContent(packageJsonNode, (content) => {
            try {
                const pkg = JSON.parse(content);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                const depKeys = Object.keys(deps);

                // Frontend
                if (depKeys.includes('react')) stack.frontend?.push('React');
                if (depKeys.includes('next')) stack.frontend?.push('Next.js');
                if (depKeys.includes('vue')) stack.frontend?.push('Vue.js');
                if (depKeys.includes('nuxt')) stack.frontend?.push('Nuxt.js');
                if (depKeys.includes('svelte')) stack.frontend?.push('Svelte');
                if (depKeys.includes('@sveltejs/kit')) stack.frontend?.push('SvelteKit');
                if (depKeys.includes('angular') || depKeys.includes('@angular/core')) stack.frontend?.push('Angular');
                if (depKeys.includes('gatsby')) stack.frontend?.push('Gatsby');
                if (depKeys.includes('astro')) stack.frontend?.push('Astro');
                if (depKeys.includes('remix')) stack.frontend?.push('Remix');

                // State Management
                if (depKeys.includes('redux') || depKeys.includes('@reduxjs/toolkit')) stack.frontend?.push('Redux');
                if (depKeys.includes('zustand')) stack.frontend?.push('Zustand');
                if (depKeys.includes('recoil')) stack.frontend?.push('Recoil');
                if (depKeys.includes('@tanstack/react-query')) stack.frontend?.push('TanStack Query');

                // CSS / UI
                if (depKeys.includes('tailwindcss')) stack.frontend?.push('Tailwind CSS');
                if (depKeys.includes('bootstrap')) stack.frontend?.push('Bootstrap');
                if (depKeys.includes('sass') || depKeys.includes('node-sass')) stack.frontend?.push('Sass');
                if (depKeys.includes('styled-components')) stack.frontend?.push('Styled Components');
                if (depKeys.includes('@emotion/react')) stack.frontend?.push('Emotion');
                if (depKeys.includes('@mui/material')) stack.frontend?.push('MUI');
                if (depKeys.includes('framer-motion')) stack.frontend?.push('Framer Motion');
                if (depKeys.includes('three')) stack.frontend?.push('Three.js');

                // Backend
                if (depKeys.includes('express')) stack.backend?.push('Express.js');
                if (depKeys.includes('nest') || depKeys.includes('@nestjs/core')) stack.backend?.push('NestJS');
                if (depKeys.includes('fastify')) stack.backend?.push('Fastify');
                if (depKeys.includes('socket.io')) stack.backend?.push('Socket.io');
                if (depKeys.includes('graphql')) stack.backend?.push('GraphQL');
                if (depKeys.includes('apollo-server') || depKeys.includes('@apollo/server')) stack.backend?.push('Apollo');
                if (depKeys.includes('trpc')) stack.backend?.push('tRPC');

                // Database
                if (depKeys.includes('mongoose') || depKeys.includes('mongodb')) stack.backend?.push('MongoDB');
                if (depKeys.includes('pg')) stack.backend?.push('PostgreSQL');
                if (depKeys.includes('mysql2')) stack.backend?.push('MySQL');
                if (depKeys.includes('prisma')) stack.backend?.push('Prisma');
                if (depKeys.includes('drizzle-orm')) stack.backend?.push('Drizzle');
                if (depKeys.includes('typeorm')) stack.backend?.push('TypeORM');
                if (depKeys.includes('sequelize')) stack.backend?.push('Sequelize');
                if (depKeys.includes('firebase') || depKeys.includes('firebase-admin')) stack.backend?.push('Firebase');
                if (depKeys.includes('supabase') || depKeys.includes('@supabase/supabase-js')) stack.backend?.push('Supabase');
                if (depKeys.includes('redis') || depKeys.includes('ioredis')) stack.backend?.push('Redis');

                // AI / ML (JS based)
                if (depKeys.includes('@tensorflow/tfjs')) stack.ai_ml?.push('TensorFlow.js');
                if (depKeys.includes('brain.js')) stack.ai_ml?.push('Brain.js');
                if (depKeys.includes('openai')) stack.ai_ml?.push('OpenAI API');
                if (depKeys.includes('langchain')) stack.ai_ml?.push('LangChain');

                // Tools
                if (depKeys.includes('typescript')) {
                    if (!stack.languages.includes('TypeScript')) stack.languages.push('TypeScript');
                }
                if (depKeys.includes('vite')) stack.tools?.push('Vite');
                if (depKeys.includes('webpack')) stack.tools?.push('Webpack');
                if (depKeys.includes('jest')) stack.tools?.push('Jest');
                if (depKeys.includes('vitest')) stack.tools?.push('Vitest');
                if (depKeys.includes('cypress')) stack.tools?.push('Cypress');
                if (depKeys.includes('playwright')) stack.tools?.push('Playwright');
                if (depKeys.includes('storybook')) stack.tools?.push('Storybook');

            } catch (e) {
                console.warn("Failed to parse package.json");
            }
        });
    }

    // --- Python Analysis ---
    if (findFile('requirements.txt') || findFile('Pipfile') || findFile('pyproject.toml') || findFile('poetry.lock')) {
        if (!stack.languages.includes('Python')) stack.languages.push('Python');

        const reqNode = findFile('requirements.txt');
        if (reqNode) {
            await checkFileContent(reqNode, (content) => {
                // Web
                if (content.includes('django')) stack.backend?.push('Django');
                if (content.includes('flask')) stack.backend?.push('Flask');
                if (content.includes('fastapi')) stack.backend?.push('FastAPI');
                if (content.includes('streamlit')) stack.frontend?.push('Streamlit');

                // AI / ML / Data Science
                if (content.includes('torch') || content.includes('pytorch')) stack.ai_ml?.push('PyTorch');
                if (content.includes('tensorflow') || content.includes('keras')) stack.ai_ml?.push('TensorFlow/Keras');
                if (content.includes('scikit-learn') || content.includes('sklearn')) stack.ai_ml?.push('Scikit-learn');
                if (content.includes('pandas')) stack.ai_ml?.push('Pandas');
                if (content.includes('numpy')) stack.ai_ml?.push('NumPy');
                if (content.includes('matplotlib')) stack.ai_ml?.push('Matplotlib');
                if (content.includes('seaborn')) stack.ai_ml?.push('Seaborn');
                if (content.includes('opencv') || content.includes('cv2')) stack.ai_ml?.push('OpenCV');
                if (content.includes('nltk')) stack.ai_ml?.push('NLTK');
                if (content.includes('spacy')) stack.ai_ml?.push('Spacy');
                if (content.includes('transformers') || content.includes('huggingface')) stack.ai_ml?.push('Transformers (HuggingFace)');
                if (content.includes('scipy')) stack.ai_ml?.push('SciPy');
                if (content.includes('jupyter')) stack.tools?.push('Jupyter Notebooks');

                // Database
                if (content.includes('sqlalchemy')) stack.backend?.push('SQLAlchemy');
                if (content.includes('psycopg2')) stack.backend?.push('PostgreSQL');
                if (content.includes('pymongo')) stack.backend?.push('MongoDB');
            });
        }
    }

    // --- Java ---
    if (findFile('pom.xml') || findFile('build.gradle') || findFile('build.gradle.kts')) {
        stack.languages.push('Java');
        if (findFile('gradlew')) stack.tools?.push('Gradle');
        else if (findFile('mvnw')) stack.tools?.push('Maven');

        const buildFile = findFile('pom.xml') || findFile('build.gradle');
        if (buildFile) {
            await checkFileContent(buildFile, (content) => {
                if (content.includes('spring-boot')) stack.backend?.push('Spring Boot');
                if (content.includes('hibernate')) stack.backend?.push('Hibernate');
            });
        }
        // Kotlin check
        if (findFile('build.gradle.kts') || root.children?.some(f => f.name.endsWith('.kt'))) {
            stack.languages.push('Kotlin');
        }
    }

    // --- Other Languages & Frameworks ---

    // Go
    if (findFile('go.mod')) {
        stack.languages.push('Go');
        const goMod = findFile('go.mod');
        if (goMod) {
            await checkFileContent(goMod, (content) => {
                if (content.includes('gin-gonic')) stack.backend?.push('Gin');
                if (content.includes('gofiber')) stack.backend?.push('Fiber');
                if (content.includes('gorilla/mux')) stack.backend?.push('Gorilla Mux');
                if (content.includes('gorm')) stack.backend?.push('GORM');
            });
        }
    }

    // Rust
    if (findFile('Cargo.toml')) {
        stack.languages.push('Rust');
        const cargo = findFile('Cargo.toml');
        if (cargo) {
            await checkFileContent(cargo, (content) => {
                if (content.includes('actix-web')) stack.backend?.push('Actix Web');
                if (content.includes('rocket')) stack.backend?.push('Rocket');
                if (content.includes('tokio')) stack.backend?.push('Tokio');
                if (content.includes('diesel')) stack.backend?.push('Diesel');
                if (content.includes('sqlx')) stack.backend?.push('SQLx');
            });
        }
    }

    // PHP
    if (findFile('composer.json')) {
        stack.languages.push('PHP');
        const composer = findFile('composer.json');
        if (composer) {
            await checkFileContent(composer, (content) => {
                if (content.includes('laravel')) stack.backend?.push('Laravel');
                if (content.includes('symfony')) stack.backend?.push('Symfony');
            });
        }
    }

    // Ruby
    if (findFile('Gemfile')) {
        stack.languages.push('Ruby');
        const gemfile = findFile('Gemfile');
        if (gemfile) {
            await checkFileContent(gemfile, (content) => {
                if (content.includes('rails')) stack.backend?.push('Ruby on Rails');
                if (content.includes('sinatra')) stack.backend?.push('Sinatra');
            });
        }
    }

    // Mobile
    if (findFile('pubspec.yaml')) {
        stack.languages.push('Dart');
        stack.frontend?.push('Flutter');
    }
    if (findFile('Podfile') && (root.children?.some(f => f.name.endsWith('.swift')))) {
        stack.languages.push('Swift');
        stack.frontend?.push('iOS (Swift)');
    }

    // Docker
    if (findFile('Dockerfile') || findFile('docker-compose.yml')) stack.tools?.push('Docker');
    if (findFile('kubernetes') || findFile('k8s') || findFile('helm')) stack.tools?.push('Kubernetes');

    // De-duplicate everything
    stack.frontend = Array.from(new Set(stack.frontend));
    stack.backend = Array.from(new Set(stack.backend));
    stack.languages = Array.from(new Set(stack.languages));
    stack.tools = Array.from(new Set(stack.tools));
    stack.ai_ml = Array.from(new Set(stack.ai_ml));

    return stack;
}
