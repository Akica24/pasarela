# Script para subir cambios a GitHub
Write-Host "Agregando archivos al staging..." -ForegroundColor Green
git add .

Write-Host "Creando commit..." -ForegroundColor Green
git commit -m "Fix: Configuración para GitHub Pages - .nojekyll y 404.html"

Write-Host "Subiendo a GitHub..." -ForegroundColor Green
git push origin main

Write-Host "¡Listo! Revisa tu sitio en https://akica24.github.io/pasarela/" -ForegroundColor Cyan
