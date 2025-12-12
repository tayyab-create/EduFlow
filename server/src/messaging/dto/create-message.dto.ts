import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUUID,
    IsArray,
    MaxLength,
    ArrayMinSize,
} from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';

/**
 * DTO for creating a conversation.
 */
export class CreateConversationDto {
    @IsEnum(ConversationType)
    @IsOptional()
    type?: ConversationType;

    @IsString()
    @MaxLength(200)
    @IsOptional()
    subject?: string;

    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(1)
    participantIds: string[];
}

/**
 * DTO for sending a message.
 */
export class CreateMessageDto {
    @IsUUID()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    @IsOptional()
    attachments?: Array<{
        url: string;
        name: string;
        type: string;
        size: number;
    }>;
}

/**
 * DTO for starting a new direct conversation with a message.
 */
export class StartConversationDto {
    @IsUUID()
    @IsNotEmpty()
    recipientId: string;

    @IsString()
    @MaxLength(200)
    @IsOptional()
    subject?: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
