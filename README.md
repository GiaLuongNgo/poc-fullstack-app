# POC Full-Stack Application

A complete proof-of-concept full-stack application demonstrating modern web development practices with a comprehensive tech stack including TypeScript, React, Next.js, Express, PostgreSQL, and AWS infrastructure.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.3+
- **Framework**: Express 4.18+
- **Database**: PostgreSQL 16
- **Database Client**: node-postgres (pg)
- **API Documentation**: OpenAPI 3.0, Swagger UI

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.3+
- **UI Library**: React 18.2+
- **Styling**: TailwindCSS 3.4+
- **Build Tool**: Next.js with SWC

### Infrastructure
- **Cloud Provider**: AWS
- **Container Orchestration**: ECS Fargate
- **Load Balancing**: Application Load Balancer (ALB)
- **Container Registry**: Amazon ECR
- **Database**: Amazon RDS (PostgreSQL)
- **Networking**: VPC with public/private subnets
- **IaC**: Pulumi 3.0+
- **Containerization**: Docker

### CI/CD
- **Platform**: GitHub Actions
- **Workflows**: Lint, Type Check, Build, Docker Build, Deploy

## 📁 Project Structure

```
poc-fullstack-app/
├── backend/                    # Backend API service
│   ├── src/
│   │   ├── index.ts           # Express server entry point
│   │   ├── config/
│   │   │   └── database.ts    # Database configuration and connection
│   │   ├── controllers/
│   │   │   └── itemsController.ts  # Business logic for items
│   │   ├── models/
│   │   │   └── item.ts        # TypeScript interfaces
│   │   ├── routes/
│   │   │   └── items.ts       # API route definitions
│   │   └── middleware/
│   │       └── errorHandler.ts # Error handling middleware
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   ├── openapi.yaml           # OpenAPI 3.0 specification
│   ├── init.sql               # Database initialization script
│   └── .env.example           # Environment variables template
│
├── frontend/                   # Frontend Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Home page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/
│   │   │   ├── ItemList.tsx   # Items display component
│   │   │   └── ItemForm.tsx   # Item creation/editing form
│   │   └── lib/
│   │       └── api.ts         # API client functions
│   ├── public/                # Static assets
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # TailwindCSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── .env.example           # Environment variables template
│
├── infrastructure/             # Pulumi IaC
│   ├── index.ts               # Infrastructure definition
│   ├── Pulumi.yaml            # Pulumi project configuration
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
│
├── docker-compose.yml          # Local development setup
├── .gitignore
└── README.md
```

## 🎯 Features

### Items Management System
A complete CRUD (Create, Read, Update, Delete) application for managing items with:

- ✅ Create new items with title, description, and completion status
- ✅ View all items in a responsive card layout
- ✅ Update existing items (title, description, completion status)
- ✅ Delete items with confirmation
- ✅ Toggle completion status with visual feedback
- ✅ Real-time updates and optimistic UI
- ✅ Loading states and error handling
- ✅ Empty state handling
- ✅ Responsive design for mobile and desktop

### API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/items` - Retrieve all items
- `GET /api/items/:id` - Retrieve a specific item by ID
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an existing item
- `DELETE /api/items/:id` - Delete an item

Full API documentation available at `/api-docs` when running the backend.

## 🛠️ Prerequisites

- **Node.js**: 20.x LTS or higher
- **Docker**: 20.10+ and Docker Compose 2.0+
- **AWS Account**: For deployment (optional)
- **Pulumi Account**: For infrastructure deployment (optional)
- **Git**: For version control

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/GiaLuongNgo/poc-fullstack-app.git
cd poc-fullstack-app
```

### 2. Environment Configuration

#### Backend Environment Variables

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Default values (modify as needed):
```env
PORT=3001
DATABASE_URL=postgresql://pocuser:pocpassword@postgres:5432/pocdb
NODE_ENV=development
```

#### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

Default values:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run with Docker Compose

The easiest way to run the entire stack locally:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port `5432`
- Backend API on port `3001`
- Frontend application on port `3000`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/health

### 5. Run Services Individually (Alternative)

If you prefer to run services separately:

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### PostgreSQL (using Docker)

```bash
docker run -d \
  --name poc-postgres \
  -e POSTGRES_USER=pocuser \
  -e POSTGRES_PASSWORD=pocpassword \
  -e POSTGRES_DB=pocdb \
  -p 5432:5432 \
  postgres:16-alpine
```

## 📊 Database Schema

### Items Table

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The database includes an automatic trigger to update the `updated_at` timestamp on every update.

## 🏗️ Building for Production

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

### Docker Images

Build individual Docker images:

```bash
# Backend
docker build -t poc-backend ./backend

# Frontend
docker build -t poc-frontend ./frontend
```

## ☁️ AWS Deployment

### Prerequisites

1. AWS account with appropriate permissions
2. AWS CLI configured with credentials
3. Pulumi CLI installed
4. Pulumi account and access token

### Setup

1. **Install Pulumi CLI**:
   ```bash
   curl -fsSL https://get.pulumi.com | sh
   ```

2. **Login to Pulumi**:
   ```bash
   pulumi login
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

4. **Install infrastructure dependencies**:
   ```bash
   cd infrastructure
   npm install
   ```

5. **Initialize Pulumi stack**:
   ```bash
   pulumi stack init prod
   ```

6. **Set configuration**:
   ```bash
   pulumi config set aws:region us-east-1
   pulumi config set poc-fullstack-app:dbUsername pocuser
   pulumi config set poc-fullstack-app:dbPassword <your-secure-password> --secret
   ```

### Deploy Infrastructure

```bash
cd infrastructure
pulumi up
```

This will create:
- VPC with public and private subnets across 2 availability zones
- Internet Gateway and NAT Gateway
- Security Groups for ALB, ECS, and RDS
- ECS Cluster with Fargate
- Application Load Balancer
- RDS PostgreSQL instance
- ECR repositories
- CloudWatch log groups
- ECS Task Definitions and Services

### Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/poc-backend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/poc-backend:latest

# Build and push frontend
cd frontend
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/poc-frontend:latest .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/poc-frontend:latest
```

### Update ECS Services

```bash
aws ecs update-service --cluster poc-cluster --service backend-service --force-new-deployment
aws ecs update-service --cluster poc-cluster --service frontend-service --force-new-deployment
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:

### On Pull Request or Push
1. **Lint and Type Check**
   - ESLint for both backend and frontend
   - TypeScript type checking

2. **Build**
   - Build backend and frontend applications
   - Run tests (if available)

### On Push to Main Branch (Additional Steps)
3. **Docker Build**
   - Build Docker images for backend and frontend
   - Tag with commit SHA and latest
   - Push to Amazon ECR

4. **Deploy**
   - Deploy infrastructure using Pulumi
   - Update ECS services with new images

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `PULUMI_ACCESS_TOKEN` - Pulumi access token

## 🧪 Testing

### Lint Code

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Type Check

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check
```

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 5432 are already in use:

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or modify ports in docker-compose.yml
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:

```bash
docker-compose ps
docker-compose logs postgres
```

### Docker Build Failures

Clear Docker cache and rebuild:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Module Not Found Errors

Reinstall dependencies:

```bash
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### CORS Errors

Ensure `NEXT_PUBLIC_API_URL` in frontend matches your backend URL.

### ECS Service Not Starting

Check CloudWatch logs:

```bash
aws logs tail /ecs/poc-backend --follow
aws logs tail /ecs/poc-frontend --follow
```

## 📝 Code Quality

- **TypeScript Strict Mode**: Enabled for type safety
- **ESLint**: Configured for code quality
- **No `any` types**: Enforced in ESLint configuration
- **Prettier**: Recommended for code formatting

## 🔐 Security Considerations

- Database credentials stored as secrets
- Docker containers run as non-root users
- Security groups with minimal required access
- HTTPS support ready (ALB listener can be updated)
- Input validation on all API endpoints
- SQL injection protection via parameterized queries

## 📄 License

This is a proof-of-concept application for demonstration purposes.

## 👥 Contributing

This is a POC project. For production use, consider:
- Adding comprehensive test coverage
- Implementing authentication and authorization
- Adding input validation libraries (e.g., Zod, Joi)
- Setting up monitoring and alerting
- Implementing rate limiting
- Adding API versioning
- Setting up SSL/TLS certificates
- Implementing database migrations
- Adding caching layer (Redis)
- Implementing CI/CD testing stages

## 📞 Support

For issues and questions, please open a GitHub issue in this repository.