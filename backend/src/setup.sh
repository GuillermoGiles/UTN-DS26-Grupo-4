#!/bin/sh
set -e

echo "🔄 Generando cliente Prisma..."
npx prisma generate

echo "🔄 Aplicando las migraciones del repo..."
# migrate deploy aplica las migraciones commiteadas y nunca crea una nueva.
# Para CAMBIAR el schema se usa: npx prisma migrate dev --name <descripcion>
npx prisma migrate deploy

echo "🌱 Cargando datos de prueba..."
npx prisma db seed

echo "✅ Setup completado. La API está lista."
