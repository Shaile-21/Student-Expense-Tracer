@echo off
setlocal
echo ====================================================
echo  Pushing Student Expense Tracker to GitHub
echo ====================================================
echo.

:: Switch drive and directory to project root
cd /d "F:\student-expense-tracker"

:: Add Git to PATH if not already in PATH
set "PATH=F:\tools\git\cmd;%PATH%"

echo Current Directory: %CD%
echo Git Version:
git --version
echo.

echo Checking repository status...
git status
echo.

echo Pushing main branch to GitHub...
git push -u origin main

echo.
echo ====================================================
echo  Done! If you see any errors above, check credentials.
echo ====================================================
pause
