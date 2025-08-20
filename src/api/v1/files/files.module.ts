import { Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { JwtModule, PrismaModule } from '#services'
import { FilesService } from './files.service'

@Module({
  providers: [FilesService],
  exports: [FilesService],
  imports: [ClsModule, PrismaModule, JwtModule],
})
export class ChatsModule {}
