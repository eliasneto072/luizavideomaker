-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "cover_image" TEXT,
    "status" "GalleryStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_files" (
    "id" TEXT NOT NULL,
    "gallery_id" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "thumbnail_key" TEXT,
    "size_bytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "galleries_slug_key" ON "galleries"("slug");

-- CreateIndex
CREATE INDEX "galleries_slug_idx" ON "galleries"("slug");

-- CreateIndex
CREATE INDEX "galleries_status_expires_at_idx" ON "galleries"("status", "expires_at");

-- CreateIndex
CREATE INDEX "gallery_files_gallery_id_idx" ON "gallery_files"("gallery_id");

-- AddForeignKey
ALTER TABLE "gallery_files" ADD CONSTRAINT "gallery_files_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
