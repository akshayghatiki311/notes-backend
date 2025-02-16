import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Query,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('extract-ingredients')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async extractIngredients(
    @UploadedFile() file: Express.Multer.File,
    @Query('useHuggingFace') useHuggingFace?: string
  ) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return this.ocrService.extractTextFromImage(file.path, useHuggingFace === 'true');
  }

  @Post('analyze-ingredients')
  async analyzeIngredients(
    @Body() body: { 
      ingredients: string;
      age: number;
      gender: string;
      conditions: string;
    },
    @Query('useHuggingFace') useHuggingFace?: string
  ) {
    if (!body.ingredients) {
      throw new BadRequestException('No ingredients provided');
    }
    if (!body.age || !body.gender) {
      throw new BadRequestException('Age and gender are required');
    }

    const analysis = useHuggingFace === 'true'
      ? await this.ocrService.analyzeIngredientsHuggingFace(
          body.ingredients,
          body.age,
          body.gender,
          body.conditions
        )
      : await this.ocrService.analyzeIngredients(
          body.ingredients,
          body.age,
          body.gender,
          body.conditions
        );
    
    return { analysis };
  }
}
