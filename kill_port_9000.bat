@echo off
echo Killing processes on port 9000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9000') do (
    echo Found process: %%a
    taskkill /F /PID %%a
    echo Process %%a killed
)
echo All processes on port 9000 have been terminated.
echo.
echo Starting the application...
npm run dev