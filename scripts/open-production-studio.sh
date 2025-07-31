#!/bin/bash

echo "🚀 Opening Prisma Studio with PRODUCTION database..."
echo ""
echo "This will show you all 12 artists from your production database."
echo ""

# Export the production DATABASE_URL and run Prisma Studio
DATABASE_URL="postgres://e3cef5fc121209ad0bc230a343d1422ea01c241e8f495e47b3c3288e4656cfaf:sk_UwGDNfwGoTpr5rpzpo4ZN@db.prisma.io:5432/?sslmode=require" npx prisma studio