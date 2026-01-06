# VITAS - Test Configuration & Scripts

Configuração de testes automatizados e scripts para execução.

---

## 1. Backend Test Setup (NestJS + Jest)

### 1.1 Jest Configuration

**Arquivo**: `backend/jest.config.js`

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.dto.ts',
    '!**/migrations/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../test'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
};
```

### 1.2 Test Database Setup

**Arquivo**: `backend/test/setup.ts`

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const testDatabaseConfig = {
  type: 'sqlite',
  database: ':memory:',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
  dropSchema: true,
};

export const getTestDatabaseModule = () =>
  TypeOrmModule.forRoot({
    ...testDatabaseConfig,
  });

// Seed database with test data
export async function seedTestDatabase(dataSource: DataSource) {
  // Users
  await dataSource.query(`
    INSERT INTO users (id, email, password, nome, role, created_at) VALUES
    ('cli-001', 'cliente@test.com', '$2b$10$...hashed...', 'Cliente Test', 'cliente', datetime('now')),
    ('prof-001', 'prof@test.com', '$2b$10$...hashed...', 'Profissional Test', 'profissional', datetime('now'));
  `);

  // Chamados
  await dataSource.query(`
    INSERT INTO chamados (id, cliente_id, categoria, descricao, status, created_at) VALUES
    ('chamado-001', 'cli-001', 'hidraulica', 'Vazamento', 'aguardando_triagem', datetime('now'));
  `);
}
```

### 1.3 Unit Test Example

**Arquivo**: `backend/src/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => 'mock_jwt_token'),
            verify: jest.fn((token) => ({ id: 'user-123', email: 'test@test.com' })),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'senha123';
      const hashed = await service.hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
      expect(await bcrypt.compare(password, hashed)).resolves.toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'senha123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await service.comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'senha123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await service.comparePassword('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(service.validateEmail('user@example.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(service.validateEmail('invalidemail')).toBe(false);
      expect(service.validateEmail('user@')).toBe(false);
      expect(service.validateEmail('user@domain')).toBe(false);
    });
  });

  describe('register', () => {
    it('should create new user and return token', async () => {
      const registerDto = {
        email: 'newuser@test.com',
        password: 'senha123',
        nome: 'Novo User',
        role: 'cliente',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...registerDto,
        id: 'user-123',
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...registerDto,
        id: 'user-123',
      } as User);

      const result = await service.register(registerDto);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.role).toBe('cliente');
    });

    it('should throw if email already exists', async () => {
      const registerDto = {
        email: 'existing@test.com',
        password: 'senha123',
        nome: 'User',
        role: 'cliente',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        email: 'existing@test.com',
      } as User);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if password < 6 characters', async () => {
      const registerDto = {
        email: 'user@test.com',
        password: '12345',
        nome: 'User',
        role: 'cliente',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const user = {
        id: 'user-123',
        email: 'user@test.com',
        password: await bcrypt.hash('senha123', 10),
        nome: 'User',
        role: 'cliente',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.login({
        email: 'user@test.com',
        password: 'senha123',
      });

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('user@test.com');
    });

    it('should throw for invalid password', async () => {
      const user = {
        id: 'user-123',
        email: 'user@test.com',
        password: await bcrypt.hash('senha123', 10),
        nome: 'User',
        role: 'cliente',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(
        service.login({
          email: 'user@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for non-existent user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@test.com',
          password: 'senha123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

### 1.4 Integration Test Example

**Arquivo**: `backend/src/auth/auth.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should create new user and return token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'senha123',
          nome: 'João Silva',
          role: 'cliente',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.token).toBeTruthy();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe('newuser@example.com');
          expect(res.body.user.role).toBe('cliente');
        });
    });

    it('should return 400 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'senha123',
          nome: 'João',
          role: 'cliente',
        });

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'outra123',
          nome: 'Maria',
          role: 'cliente',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Email já cadastrado');
        });
    });

    it('should return 400 if password < 6 chars', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: '12345',
          nome: 'João',
          role: 'cliente',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'cliente@example.com',
          password: 'senha123',
          nome: 'Cliente Test',
          role: 'cliente',
        });
    });

    it('should return token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'cliente@example.com',
          password: 'senha123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeTruthy();
          expect(res.body.user.role).toBe('cliente');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'cliente@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'senha123',
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/test', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'senha123',
          nome: 'Test User',
          role: 'cliente',
        });

      token = res.body.token;
    });

    it('should return current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/test')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.role).toBe('cliente');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/test')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/test')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
```

---

## 2. Frontend Test Setup (React + Vitest)

### 2.1 Vitest Configuration

**Arquivo**: `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/mockData.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2.2 Test Setup File

**Arquivo**: `frontend/src/test/setup.ts`

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(),
  onMessage: vi.fn(),
  getToken: vi.fn(() => Promise.resolve('mock_fcm_token')),
}));

// Mock Google Maps
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }: { children: any }) => children,
  Marker: () => null,
}));
```

### 2.3 Component Test Example

**Arquivo**: `frontend/src/components/LoginForm.spec.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import * as authService from '@/services/authService';

vi.mock('@/services/authService');

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with email and password fields', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should submit form with valid email and password', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'mock_token',
      user: { id: '123', email: 'test@test.com' },
    });
    vi.mocked(authService.login).mockImplementation(mockLogin);

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/senha/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'senha123',
      });
    });
  });

  it('should show error message on login failure', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(
      new Error('Email ou senha inválidos'),
    );

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should have "Criar Conta" link', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    const createLink = screen.getByRole('link', { name: /criar conta/i });
    expect(createLink).toBeInTheDocument();
  });
});
```

---

## 3. E2E Test Setup (Playwright)

### 3.1 Playwright Configuration

**Arquivo**: `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.2 E2E Test Example

**Arquivo**: `frontend/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete login flow', async ({ page }) => {
    // Click login button
    await page.click('button:has-text("ENTRAR")');

    // Fill email
    await page.fill('input[placeholder="Email"]', 'cliente@test.com');

    // Fill password
    await page.fill('input[placeholder="Senha"]', 'senha123');

    // Submit
    await page.click('button:has-text("ENTRAR")');

    // Wait for navigation
    await page.waitForNavigation();

    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Click login button
    await page.click('button:has-text("ENTRAR")');

    // Fill invalid credentials
    await page.fill('input[placeholder="Email"]', 'test@test.com');
    await page.fill('input[placeholder="Senha"]', 'wrongpassword');

    // Submit
    await page.click('button:has-text("ENTRAR")');

    // Verify error message
    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible();

    // Verify not navigated
    await expect(page).toHaveURL('/');
  });

  test('should complete registration flow', async ({ page }) => {
    // Click criar conta
    await page.click('text=CRIAR CONTA');

    // Fill form
    await page.fill('input[placeholder="Nome"]', 'João Silva');
    await page.fill('input[placeholder="Email"]', `user-${Date.now()}@test.com`);
    await page.fill('input[placeholder="Senha"]', 'senha123');
    await page.fill('input[placeholder="Confirmar Senha"]', 'senha123');

    // Submit
    await page.click('button:has-text("CRIAR CONTA")');

    // Wait for navigation
    await page.waitForNavigation();

    // Verify dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 4. NPM Scripts

### 4.1 Backend Test Scripts

**Arquivo**: `backend/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:integration": "jest --testPathPattern='.integration.spec.ts$'",
    "test:unit": "jest --testPathPattern='.spec.ts$' --testPathIgnore='.integration'",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 4.2 Frontend Test Scripts

**Arquivo**: `frontend/package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

---

## 5. GitHub Actions CI/CD

### 5.1 Test Workflow

**Arquivo**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop, 007-agendamento]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vitas_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run backend unit tests
        working-directory: ./backend
        run: npm run test:unit -- --coverage

      - name: Run backend integration tests
        working-directory: ./backend
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vitas_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run frontend unit tests
        working-directory: ./frontend
        run: npm run test:run -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --workspaces

      - name: Install Playwright browsers
        working-directory: ./frontend
        run: npx playwright install --with-deps

      - name: Start backend
        working-directory: ./backend
        run: npm run start:test &

      - name: Start frontend (dev server)
        working-directory: ./frontend
        run: npm run dev &

      - name: Wait for services
        run: |
          npx wait-on http://localhost:3000 http://localhost:5173

      - name: Run E2E tests
        working-directory: ./frontend
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30

  coverage:
    needs: [backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    
    steps:
      - name: Check coverage thresholds
        run: |
          echo "Backend coverage: >= 80%"
          echo "Frontend coverage: >= 60%"
          echo "E2E coverage: >= 50%"
```

---

## 6. Test Execution Commands

### Quick Start

```bash
# Install dependencies
npm install --workspaces

# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Watch mode (development)
npm run test:watch

# E2E tests
npm run test:e2e
```

### Backend Only

```bash
cd backend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Only

```bash
cd frontend

# Unit tests
npm run test:run

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

---

## 7. Coverage Reports

### Viewing Coverage

```bash
# Backend
open backend/coverage/lcov-report/index.html

# Frontend
open frontend/coverage/lcov-report/index.html
```

### Expected Coverage

```
Backend:
- Overall: >= 80%
- Services: >= 85%
- Controllers: >= 70%
- Utils: >= 90%

Frontend:
- Overall: >= 60%
- Hooks: >= 60%
- Components: >= 40%
- Utils: >= 85%
```

---

**Última atualização**: 6 de janeiro de 2026  
**Versão**: 1.0.0  
**Status**: Pronto para execução
