import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ArrayContains } from 'typeorm';
import {
    Conversation,
    ConversationType,
    Message,
    Announcement,
    AnnouncementPriority,
} from './entities';
import {
    CreateConversationDto,
    CreateMessageDto,
    StartConversationDto,
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
    QueryConversationsDto,
    QueryMessagesDto,
    QueryAnnouncementsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Service for managing conversations, messages, and announcements.
 */
@Injectable()
export class MessagingService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Announcement)
        private readonly announcementRepository: Repository<Announcement>,
    ) { }

    // ==================== CONVERSATION METHODS ====================

    /**
     * Create a new conversation.
     */
    async createConversation(
        dto: CreateConversationDto,
        creatorId: string,
        schoolId: string,
    ): Promise<Conversation> {
        // Ensure creator is in participants
        const participantIds = [...new Set([...dto.participantIds, creatorId])];

        const conversation = this.conversationRepository.create({
            schoolId,
            type: dto.type ?? (participantIds.length === 2 ? ConversationType.DIRECT : ConversationType.GROUP),
            subject: dto.subject ?? null,
            participantIds,
            createdBy: creatorId,
        });

        return this.conversationRepository.save(conversation);
    }

    /**
     * Start a direct conversation with a message.
     */
    async startDirectConversation(
        dto: StartConversationDto,
        senderId: string,
        schoolId: string,
    ): Promise<{ conversation: Conversation; message: Message }> {
        // Check for existing direct conversation
        const existing = await this.findExistingDirectConversation(
            senderId,
            dto.recipientId,
            schoolId,
        );

        let conversation: Conversation;

        if (existing) {
            conversation = existing;
        } else {
            conversation = await this.createConversation(
                {
                    participantIds: [dto.recipientId],
                    subject: dto.subject,
                    type: ConversationType.DIRECT,
                },
                senderId,
                schoolId,
            );
        }

        const message = await this.sendMessage(
            { conversationId: conversation.id, content: dto.content },
            senderId,
        );

        return { conversation, message };
    }

    /**
     * Find existing direct conversation between two users.
     */
    private async findExistingDirectConversation(
        userId1: string,
        userId2: string,
        schoolId: string,
    ): Promise<Conversation | null> {
        // Find conversations where both users are participants
        const conversations = await this.conversationRepository
            .createQueryBuilder('conversation')
            .where('conversation.school_id = :schoolId', { schoolId })
            .andWhere('conversation.type = :type', { type: ConversationType.DIRECT })
            .andWhere('conversation.is_active = true')
            .getMany();

        // Filter to find one with exactly these two participants
        return conversations.find(
            (conv) =>
                conv.participantIds.length === 2 &&
                conv.participantIds.includes(userId1) &&
                conv.participantIds.includes(userId2),
        ) ?? null;
    }

    /**
     * Get conversations for a user.
     */
    async getConversationsForUser(
        userId: string,
        schoolId: string,
        query: QueryConversationsDto,
    ): Promise<PaginatedResponse<Conversation>> {
        // Get all conversations then filter by participant
        // Note: In production, consider using a join table for better performance
        const allConversations = await this.conversationRepository.find({
            where: { schoolId, isActive: true },
            order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
        });

        const userConversations = allConversations.filter((conv) =>
            conv.participantIds.includes(userId),
        );

        const total = userConversations.length;
        const paginated = userConversations.slice(query.skip, query.skip + query.take);

        return createPaginatedResponse(paginated, total, query);
    }

    /**
     * Get a conversation by ID (with permission check).
     */
    async getConversation(id: string, userId: string): Promise<Conversation> {
        const conversation = await this.conversationRepository.findOne({
            where: { id },
        });

        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }

        if (!conversation.participantIds.includes(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return conversation;
    }

    // ==================== MESSAGE METHODS ====================

    /**
     * Send a message to a conversation.
     */
    async sendMessage(dto: CreateMessageDto, senderId: string): Promise<Message> {
        // Verify sender is participant
        const conversation = await this.getConversation(dto.conversationId, senderId);

        const message = this.messageRepository.create({
            conversationId: dto.conversationId,
            senderId,
            content: dto.content,
            attachments: dto.attachments ?? null,
            readBy: [senderId], // Sender has read their own message
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update conversation's last message info
        conversation.lastMessageAt = savedMessage.createdAt;
        conversation.lastMessagePreview = dto.content.substring(0, 200);
        await this.conversationRepository.save(conversation);

        return savedMessage;
    }

    /**
     * Get messages in a conversation.
     */
    async getMessages(
        conversationId: string,
        userId: string,
        query: QueryMessagesDto,
    ): Promise<PaginatedResponse<Message>> {
        // Verify user is participant
        await this.getConversation(conversationId, userId);

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.conversation_id = :conversationId', { conversationId })
            .andWhere('message.is_deleted = false')
            .orderBy('message.created_at', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const messages = await queryBuilder.getMany();
        return createPaginatedResponse(messages, total, query);
    }

    /**
     * Mark messages as read.
     */
    async markMessagesAsRead(
        conversationId: string,
        userId: string,
    ): Promise<{ count: number }> {
        // Verify user is participant
        await this.getConversation(conversationId, userId);

        // Get unread messages and add user to readBy
        const unreadMessages = await this.messageRepository
            .createQueryBuilder('message')
            .where('message.conversation_id = :conversationId', { conversationId })
            .andWhere('message.sender_id != :userId', { userId })
            .andWhere('NOT (message.read_by @> :userIdArray)', { userIdArray: JSON.stringify([userId]) })
            .getMany();

        for (const message of unreadMessages) {
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
            }
        }

        if (unreadMessages.length > 0) {
            await this.messageRepository.save(unreadMessages);
        }

        return { count: unreadMessages.length };
    }

    // ==================== ANNOUNCEMENT METHODS ====================

    /**
     * Create an announcement.
     */
    async createAnnouncement(
        dto: CreateAnnouncementDto,
        creatorId: string,
        schoolId: string,
    ): Promise<Announcement> {
        const announcement = this.announcementRepository.create({
            schoolId,
            title: dto.title,
            content: dto.content,
            priority: dto.priority ?? AnnouncementPriority.NORMAL,
            targetRoles: dto.targetRoles ?? [],
            targetClassIds: dto.targetClassIds ?? [],
            attachments: dto.attachments ?? null,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            isPinned: dto.isPinned ?? false,
            isDraft: dto.isDraft ?? false,
            publishedAt: dto.isDraft ? null : new Date(),
            createdBy: creatorId,
        });

        return this.announcementRepository.save(announcement);
    }

    /**
     * Get announcements for a user based on their role.
     */
    async getAnnouncementsForUser(
        userId: string,
        userRole: string,
        schoolId: string,
        query: QueryAnnouncementsDto,
    ): Promise<PaginatedResponse<Announcement>> {
        const queryBuilder = this.announcementRepository
            .createQueryBuilder('announcement')
            .where('announcement.school_id = :schoolId', { schoolId })
            .andWhere('announcement.is_draft = false')
            .andWhere('(announcement.expires_at IS NULL OR announcement.expires_at > NOW())');

        // Filter by priority
        if (query.priority) {
            queryBuilder.andWhere('announcement.priority = :priority', {
                priority: query.priority,
            });
        }

        // Filter pinned
        if (query.isPinned !== undefined) {
            queryBuilder.andWhere('announcement.is_pinned = :isPinned', {
                isPinned: query.isPinned,
            });
        }

        // Order: pinned first, then by date
        queryBuilder
            .orderBy('announcement.is_pinned', 'DESC')
            .addOrderBy('announcement.published_at', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const announcements = await queryBuilder.getMany();

        // Filter by role targeting (empty targetRoles means all roles)
        const filteredAnnouncements = announcements.filter(
            (a) => a.targetRoles.length === 0 || a.targetRoles.includes(userRole),
        );

        return createPaginatedResponse(filteredAnnouncements, total, query);
    }

    /**
     * Get all announcements for admin (including drafts).
     */
    async getAllAnnouncementsForAdmin(
        schoolId: string,
        query: QueryAnnouncementsDto,
    ): Promise<PaginatedResponse<Announcement>> {
        const queryBuilder = this.announcementRepository
            .createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.creator', 'creator')
            .where('announcement.school_id = :schoolId', { schoolId });

        if (!query.includeDrafts) {
            queryBuilder.andWhere('announcement.is_draft = false');
        }

        if (query.priority) {
            queryBuilder.andWhere('announcement.priority = :priority', {
                priority: query.priority,
            });
        }

        queryBuilder
            .orderBy('announcement.is_pinned', 'DESC')
            .addOrderBy('announcement.created_at', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const announcements = await queryBuilder.getMany();
        return createPaginatedResponse(announcements, total, query);
    }

    /**
     * Update an announcement.
     */
    async updateAnnouncement(
        id: string,
        dto: UpdateAnnouncementDto,
        schoolId: string,
    ): Promise<Announcement> {
        const announcement = await this.announcementRepository.findOne({
            where: { id, schoolId },
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID ${id} not found`);
        }

        // If publishing a draft
        if (dto.isDraft === false && announcement.isDraft) {
            announcement.publishedAt = new Date();
        }

        Object.assign(announcement, {
            ...dto,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : announcement.expiresAt,
        });

        return this.announcementRepository.save(announcement);
    }

    /**
     * Delete an announcement.
     */
    async removeAnnouncement(id: string, schoolId: string): Promise<void> {
        const announcement = await this.announcementRepository.findOne({
            where: { id, schoolId },
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID ${id} not found`);
        }

        await this.announcementRepository.remove(announcement);
    }
}
