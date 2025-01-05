# ScribbleSync

This is a web application for real-time collaborative note-taking
Backend application is built using Nestjs.

Requirements:
1. Nodejs v22.12.0
2. Git 2.39.5
3. MongoDB

Steps to run the application in local:
1. git pull respository
2. cd application-folder
3. Run "npm install"
4. Create a .env file in the project root directory.
5. Update .env with following values:
  51. JWT_SECRET=3f9b8e7d-4c2a-4e5b-9d2f-8a6e7c4b5d1a
  52. JWT_EXPIRES_IN=3600s
  53. DATABASE_URI=mongodb+srv://akshay:akshay@cluster0.lr6d3zg.mongodb.net/notes?retryWrites=true&w=majority
  54. ENABLE_CORS=http://localhost:5173
  55. PORT=3000
6. Run "npm run start:dev"