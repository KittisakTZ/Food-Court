FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

# generate Prisma Client ที่ตรงกับ container runtime
RUN npx prisma generate

# apply migration production-safe
RUN npx prisma migrate deploy

# build TypeScript
RUN npm run build
RUN npm prune --omit=dev  

EXPOSE 8090
ENV NODE_ENV=production
CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]