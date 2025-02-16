import { Injectable } from '@nestjs/common';
import { CreateOcrDto } from './dto/create-ocr.dto';
import { UpdateOcrDto } from './dto/update-ocr.dto';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';

@Injectable()
export class OcrService {
  create(createOcrDto: CreateOcrDto) {
    return 'This action adds a new ocr';
  }

  findAll() {
    return `This action returns all ocr`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ocr`;
  }

  update(id: number, updateOcrDto: UpdateOcrDto) {
    return `This action updates a #${id} ocr`;
  }

  remove(id: number) {
    return `This action removes a #${id} ocr`;
  }

  async extractTextFromImage(imagePath: string): Promise<{ text: string }> {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        { logger: m => console.log(m) }
      );

      // Clean up the uploaded file
      fs.unlinkSync(imagePath);

      // Process the text to extract ingredients
      const processedText = this.processIngredientsText(text);

      return { text: processedText };
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  private processIngredientsText(text: string): string {
    // Split text into lines
    const lines = text.split('\n');
    
    // Look for ingredients section
    const ingredientsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('ingredients:') || 
      line.toLowerCase().includes('ingredients')
    );

    if (ingredientsIndex === -1) {
      return text; // Return full text if ingredients section not found
    }

    // Extract ingredients section
    const ingredientsText = lines.slice(ingredientsIndex).join('\n');
    return ingredientsText;
  }
}
