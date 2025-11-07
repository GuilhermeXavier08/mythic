-- CreateTable
CREATE TABLE `FriendshipRequest` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FriendshipRequest_senderId_receiverId_key`(`senderId`, `receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friendship` (
    `id` VARCHAR(191) NOT NULL,
    `userId1` VARCHAR(191) NOT NULL,
    `userId2` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Friendship_userId1_idx`(`userId1`),
    INDEX `Friendship_userId2_idx`(`userId2`),
    UNIQUE INDEX `Friendship_userId1_userId2_key`(`userId1`, `userId2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendshipRequest` ADD CONSTRAINT `FriendshipRequest_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendshipRequest` ADD CONSTRAINT `FriendshipRequest_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_userId1_fkey` FOREIGN KEY (`userId1`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_userId2_fkey` FOREIGN KEY (`userId2`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
