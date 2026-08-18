#!/bin/sh
set -e

echo "🔄 Generando cliente Prisma..."
npx prisma generate

echo "🔄 Ejecutando migración inicial..."
npx prisma migrate dev --name init

echo "🌱 Cargando datos de prueba..."
npx prisma db seed

echo "✅ Setup completado. La API está lista."
