/*
  Warnings:

  - A unique constraint covering the columns `[developerId,title]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `developerId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `game` ADD COLUMN `developerId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX `Game_developerId_title_key` ON `Game`(`developerId`, `title`);

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_developerId_fkey` FOREIGN KEY (`developerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
