import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { Conversation, Message, Announcement } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message, Announcement])],
    controllers: [MessagingController],
    providers: [MessagingService],
    exports: [MessagingService],
})
export class MessagingModule { }
