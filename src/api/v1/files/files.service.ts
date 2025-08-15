import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '#services'
import { ClsService } from 'nestjs-cls'
import { FileType } from '@prisma/client'

export interface FileUploadData {
  messageId?: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  duration?: number
  width?: number
  height?: number
}

@Injectable()
export class FilesService {
  readonly #_prisma: PrismaService
  readonly #_cls: ClsService

  constructor(prisma: PrismaService, cls: ClsService) {
    this.#_prisma = prisma
    this.#_cls = cls
  }

  async uploadFile(fileData: FileUploadData) {
    const user = this.#_cls.get('user')

    // Determine file type based on MIME type
    const fileType = this.#_getFileType(fileData.mimeType)

    // Validate file size (example limits)
    const maxSizes = {
      image: 10 * 1024 * 1024,      // 10MB for images
      video: 100 * 1024 * 1024,     // 100MB for videos
      audio: 50 * 1024 * 1024,      // 50MB for audio
      document: 20 * 1024 * 1024,   // 20MB for documents
      voice: 10 * 1024 * 1024,      // 10MB for voice
      sticker: 1 * 1024 * 1024      // 1MB for stickers
    }

    if (fileData.size > maxSizes[fileType]) {
      throw new BadRequestException(`File too large. Maximum size for ${fileType} is ${maxSizes[fileType] / (1024 * 1024)}MB`)
    }

    // If messageId is provided, verify user has access to the chat
    if (fileData.messageId) {
      const hasAccess = await this.#_prisma.message.findFirst({
        where: {
          id: fileData.messageId,
          chat: {
            participants: {
              some: {
                userId: user.id,
                leftAt: null
              }
            }
          }
        }
      })

      if (!hasAccess) {
        throw new NotFoundException('Message not found or access denied')
      }
    }

    // Create file record
    const file = await this.#_prisma.file.create({
      data: {
        messageId: fileData.messageId,
        uploaderId: user.id,
        fileName: fileData.fileName,
        originalName: fileData.originalName,
        mimeType: fileData.mimeType,
        fileType,
        size: fileData.size,
        url: fileData.url,
        thumbnailUrl: fileData.thumbnailUrl,
        duration: fileData.duration,
        width: fileData.width,
        height: fileData.height
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return file
  }

  async getFile(fileId: string) {
    const user = this.#_cls.get('user')

    const file = await this.#_prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        message: {
          include: {
            chat: {
              include: {
                participants: {
                  where: {
                    userId: user.id,
                    leftAt: null
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    // Check if user has access (either uploader or participant in the chat)
    const hasAccess = file.uploaderId === user.id || 
                     (file.message?.chat.participants && file.message.chat.participants.length > 0)

    if (!hasAccess) {
      throw new NotFoundException('Access denied')
    }

    return file
  }

  async getUserFiles(userId?: string, fileType?: FileType, limit = 50, cursor?: string) {
    const user = this.#_cls.get('user')
    const targetUserId = userId || user.id

    // If requesting another user's files, check if they have shared chats
    if (targetUserId !== user.id) {
      const sharedChats = await this.#_prisma.chatParticipant.findFirst({
        where: {
          userId: targetUserId,
          leftAt: null,
          chat: {
            participants: {
              some: {
                userId: user.id,
                leftAt: null
              }
            }
          }
        }
      })

      if (!sharedChats) {
        throw new NotFoundException('Access denied - no shared chats')
      }
    }

    const files = await this.#_prisma.file.findMany({
      where: {
        uploaderId: targetUserId,
        ...(fileType && { fileType }),
        // Only files from chats the requesting user has access to
        message: {
          chat: {
            participants: {
              some: {
                userId: user.id,
                leftAt: null
              }
            }
          }
        }
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      })
    })

    return files
  }

  async deleteFile(fileId: string) {
    const user = this.#_cls.get('user')

    const file = await this.#_prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    // Only uploader can delete the file
    if (file.uploaderId !== user.id) {
      throw new BadRequestException('Only the uploader can delete this file')
    }

    await this.#_prisma.file.delete({
      where: { id: fileId }
    })

    return { success: true }
  }

  #_getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.image
    } else if (mimeType.startsWith('video/')) {
      return FileType.video
    } else if (mimeType.startsWith('audio/')) {
      // Distinguish between general audio and voice messages
      if (mimeType.includes('ogg') || mimeType.includes('webm')) {
        return FileType.voice
      }
      return FileType.audio
    } else if (mimeType === 'application/json' && mimeType.includes('sticker')) {
      return FileType.sticker
    } else {
      return FileType.document
    }
  }

  async getFileStatistics() {
    const user = this.#_cls.get('user')

    const stats = await this.#_prisma.file.groupBy({
      by: ['fileType'],
      where: {
        uploaderId: user.id
      },
      _count: {
        fileType: true
      },
      _sum: {
        size: true
      }
    })

    return stats.map(stat => ({
      fileType: stat.fileType,
      count: stat._count.fileType,
      totalSize: stat._sum.size || 0
    }))
  }
}