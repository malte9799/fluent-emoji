@echo off
cd build
for /d %%d in (./*) do (
  cd %%d
  npm publish --access public
  cd ..
)