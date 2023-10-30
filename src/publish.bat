@echo off
cd build
for /d %%d in (./*) do (
  cd %%d
  @REM npm publish
  cd ..
)