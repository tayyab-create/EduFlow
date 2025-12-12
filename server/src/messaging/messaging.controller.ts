import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
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
import { Conversation, Message, Announcement } from './entities';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole, User } from '../database/entities/user.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';

/**
 * Controller for messaging and announcements.
 */
@Controller('api/v1/messaging')
@UseGuards(RolesGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) { }

    // ==================== CONVERSATION ENDPOINTS ====================

    /**
     * Create a new conversation.
     */
    @Post('conversations')
    async createConversation(
        @Body() dto: CreateConversationDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Conversation }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const conversation = await this.messagingService.createConversation(
            dto,
            user.id,
            schoolId,
        );
        return { success: true, data: conversation };
    }

    /**
     * Start a direct conversation with a message.
     */
    @Post('conversations/start')
    async startConversation(
        @Body() dto: StartConversationDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: { conversation: Conversation; message: Message } }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const result = await this.messagingService.startDirectConversation(
            dto,
            user.id,
            schoolId,
        );
        return { success: true, data: result };
    }

    /**
     * Get current user's conversations.
     */
    @Get('conversations')
    async getMyConversations(
        @Query() query: QueryConversationsDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Conversation> }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const result = await this.messagingService.getConversationsForUser(
            user.id,
            schoolId,
            query,
        );
        return { success: true, data: result };
    }

    /**
     * Get a conversation by ID.
     */
    @Get('conversations/:id')
    async getConversation(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Conversation }> {
        const conversation = await this.messagingService.getConversation(id, user.id);
        return { success: true, data: conversation };
    }

    // ==================== MESSAGE ENDPOINTS ====================

    /**
     * Send a message to a conversation.
     */
    @Post('messages')
    async sendMessage(
        @Body() dto: CreateMessageDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Message }> {
        const message = await this.messagingService.sendMessage(dto, user.id);
        return { success: true, data: message };
    }

    /**
     * Get messages in a conversation.
     */
    @Get('conversations/:id/messages')
    async getMessages(
        @Param('id', ParseUUIDPipe) conversationId: string,
        @Query() query: QueryMessagesDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Message> }> {
        const result = await this.messagingService.getMessages(
            conversationId,
            user.id,
            query,
        );
        return { success: true, data: result };
    }

    /**
     * Mark all messages in a conversation as read.
     */
    @Patch('conversations/:id/read')
    async markAsRead(
        @Param('id', ParseUUIDPipe) conversationId: string,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: { count: number } }> {
        const result = await this.messagingService.markMessagesAsRead(
            conversationId,
            user.id,
        );
        return { success: true, data: result };
    }

    // ==================== ANNOUNCEMENT ENDPOINTS ====================

    /**
     * Create an announcement.
     * Access: Admin, Principal
     */
    @Post('announcements')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async createAnnouncement(
        @Body() dto: CreateAnnouncementDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Announcement }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const announcement = await this.messagingService.createAnnouncement(
            dto,
            user.id,
            schoolId,
        );
        return { success: true, data: announcement };
    }

    /**
     * Get announcements for current user.
     */
    @Get('announcements')
    async getAnnouncements(
        @Query() query: QueryAnnouncementsDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Announcement> }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const result = await this.messagingService.getAnnouncementsForUser(
            user.id,
            user.role,
            schoolId,
            query,
        );
        return { success: true, data: result };
    }

    /**
     * Get all announcements (admin view).
     * Access: Admin, Principal
     */
    @Get('announcements/admin')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async getAdminAnnouncements(
        @Query() query: QueryAnnouncementsDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Announcement> }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const result = await this.messagingService.getAllAnnouncementsForAdmin(
            schoolId,
            query,
        );
        return { success: true, data: result };
    }

    /**
     * Update an announcement.
     * Access: Admin, Principal
     */
    @Patch('announcements/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async updateAnnouncement(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAnnouncementDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Announcement }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const announcement = await this.messagingService.updateAnnouncement(
            id,
            dto,
            schoolId,
        );
        return { success: true, data: announcement };
    }

    /**
     * Delete an announcement.
     * Access: Admin
     */
    @Delete('announcements/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async removeAnnouncement(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        await this.messagingService.removeAnnouncement(id, schoolId);
    }
}
