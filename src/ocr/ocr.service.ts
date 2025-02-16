import { Injectable } from '@nestjs/common';
import { CreateOcrDto } from './dto/create-ocr.dto';
import { UpdateOcrDto } from './dto/update-ocr.dto';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

@Injectable()
export class OcrService {
  private openai: OpenAIApi;
  private readonly HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

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

  async extractTextFromImage(imagePath: string, useHuggingFace: boolean = false): Promise<{ text: string }> {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        { logger: m => console.log(m) }
      );

      fs.unlinkSync(imagePath);
      const processedText = this.processIngredientsText(text);


      return { text: processedText };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
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

  async analyzeIngredients(ingredients: string, age: number, gender: string, conditions: string): Promise<string> {
    try {
      const prompt = `As a nutrition and health expert, analyze these ingredients: ${ingredients} for a ${age}-year-old ${gender} with conditions: ${conditions}.

Please provide a detailed analysis covering:
1. Nutritional Benefits: Key nutrients and their health impacts
2. Potential Risks: Allergens, sensitivities, and interactions with conditions
3. Preservatives & Additives: Identify any concerning chemicals or preservatives
4. Health Impact: How these ingredients might affect the person's specific conditions
5. Recommendations: Suggestions for alternatives if any ingredients are concerning

Format the response in clear sections.`;

      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a professional nutritionist and food safety expert with extensive knowledge of ingredient analysis, food chemistry, and health impacts."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Unable to analyze ingredients at this time.';
    }
  }

  async analyzeIngredientsHuggingFace(ingredients: string, age: number, gender: string, conditions: string): Promise<string> {
    try {
      const prompt = `As a nutrition and health expert, analyze these ingredients: ${ingredients} for a ${age}-year-old ${gender} with conditions: ${conditions}.

Provide a detailed analysis covering:
1. Nutritional Benefits
2. Potential Risks and Allergens
3. Preservatives & Additives Analysis
4. Health Impact considering their conditions
5. Recommendations

Be specific and thorough in your analysis.`;

      const response = await axios.post(
        this.HF_API_URL,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Hugging Face Response:', response.data);

      const analysis = Array.isArray(response.data) ? response.data[0].generated_text : response.data.generated_text;

      return analysis.trim();
    } catch (error) {
      console.error('Hugging Face API error:', error.response?.data || error.message);
      return 'Unable to analyze ingredients at this time.';
    }
  }
}
