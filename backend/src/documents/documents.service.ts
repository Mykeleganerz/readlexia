import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) { }

  async create(userId: number, createDocumentDto: CreateDocumentDto): Promise<Document> {
    try {
      this.logger.log(`Creating document for user ${userId}: ${createDocumentDto.title}`);

      const document = this.documentsRepository.create({
        ...createDocumentDto,
        userId,
        category: createDocumentDto.category || 'General',
      });

      const savedDocument = await this.documentsRepository.save(document);
      this.logger.log(`Document created successfully with ID: ${savedDocument.id}`);
      return savedDocument;
    } catch (error) {
      this.logger.error(`Failed to create document for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findAll(userId: number, page = 1, limit = 10): Promise<{ data: Document[]; total: number; page: number; lastPage: number }> {
    try {
      this.logger.log(`Fetching documents for user ${userId} - page: ${page}, limit: ${limit}`);

      const [data, total] = await this.documentsRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      this.logger.log(`Found ${data.length} documents for user ${userId}`);
      return {
        data,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch documents for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async findOne(id: number, userId: number): Promise<Document> {
    try {
      this.logger.log(`Fetching document ${id} for user ${userId}`);

      const document = await this.documentsRepository.findOne({
        where: { id, userId },
      });

      if (!document) {
        this.logger.warn(`Document ${id} not found for user ${userId}`);
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      return document;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch document ${id} for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch document');
    }
  }

  async update(id: number, userId: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    try {
      this.logger.log(`Updating document ${id} for user ${userId}`);

      const document = await this.findOne(id, userId);

      if (document.userId !== userId) {
        this.logger.warn(`Unauthorized update attempt for document ${id} by user ${userId}`);
        throw new ForbiddenException('You do not have permission to update this document');
      }

      Object.assign(document, updateDocumentDto);
      const updatedDocument = await this.documentsRepository.save(document);
      this.logger.log(`Document ${id} updated successfully`);
      return updatedDocument;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error(`Failed to update document ${id} for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    try {
      this.logger.log(`Deleting document ${id} for user ${userId}`);

      const document = await this.findOne(id, userId);

      if (document.userId !== userId) {
        this.logger.warn(`Unauthorized delete attempt for document ${id} by user ${userId}`);
        throw new ForbiddenException('You do not have permission to delete this document');
      }

      await this.documentsRepository.remove(document);
      this.logger.log(`Document ${id} deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error(`Failed to delete document ${id} for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async getDashboardStats(userId: number): Promise<{
    totalWords: number;
    totalDocuments: number;
    mostUsedCategory: string;
    averageDocumentLength: number;
    lastActivityDate: Date | null;
  }> {
    try {
      this.logger.log(`Calculating dashboard stats for user ${userId}`);

      const documents = await this.documentsRepository.find({
        where: { userId },
      });

      if (documents.length === 0) {
        this.logger.log(`No documents found for user ${userId}`);
        return {
          totalWords: 0,
          totalDocuments: 0,
          mostUsedCategory: 'None',
          averageDocumentLength: 0,
          lastActivityDate: null,
        };
      }

      // Calculate total words
      const totalWords = documents.reduce((sum, doc) => {
        const wordCount = doc.content.split(/\s+/).filter(word => word.length > 0).length;
        return sum + wordCount;
      }, 0);

      // Calculate average document length
      const averageDocumentLength = Math.round(totalWords / documents.length);

      // Find most used category
      const categoryCount = documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedCategory = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b,
      ) || 'General';

      // Get last activity date (most recent document update)
      const lastActivityDate = documents.reduce((latest, doc) => {
        return doc.updatedAt > latest ? doc.updatedAt : latest;
      }, documents[0].updatedAt);

      this.logger.log(`Dashboard stats calculated for user ${userId}: ${documents.length} documents, ${totalWords} total words`);

      return {
        totalWords,
        totalDocuments: documents.length,
        mostUsedCategory,
        averageDocumentLength,
        lastActivityDate,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate dashboard stats for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to calculate dashboard statistics');
    }
  }
}
