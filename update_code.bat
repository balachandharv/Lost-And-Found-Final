@echo off
echo Updating repository...
git add .
set /p commit_msg="Enter commit message: "
if "%commit_msg%"=="" set commit_msg="Update code"
git commit -m "%commit_msg%"
git push origin main
echo Update complete!
pause
