-- AlterTable
ALTER TABLE `user` ADD COLUMN `isProfilePublic` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `receivesNewsletter` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showStatsToOthers` BOOLEAN NOT NULL DEFAULT true;
