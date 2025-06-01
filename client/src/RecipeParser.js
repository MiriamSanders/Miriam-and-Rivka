import * as mammoth from 'mammoth';

export const parseRecipeDocument = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const parsedRecipe = {
    name: '', chef: '', description: '', image: '', prepTime: '',
    difficulty: 'Easy', category: '', dishType: '',
    ingredients: [], instructions: '', tags: []
  };

  let currentSection = '';
  let instructionsLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/\*\*/g, '').replace(/\*/g, '');

    if (cleanLine.toLowerCase().includes('recipe name:')) {
      parsedRecipe.name = cleanLine.split(':')[1]?.trim() || '';
    } else if (cleanLine.toLowerCase().includes('chef:')) {
      parsedRecipe.chef = cleanLine.split(':')[1]?.trim().replace(/\[|\]/g, '') || '';
    } else if (cleanLine.toLowerCase().includes('description:')) {
      if (cleanLine.split(':')[1]?.trim()) {
        parsedRecipe.description = cleanLine.split(':')[1].trim();
      } else if (i + 1 < lines.length && lines[i+1] && !lines[i+1].match(/^[a-zA-Z\s]+:/)) {
        parsedRecipe.description = lines[i + 1].trim();
        i++;
      }
    } else if (cleanLine.toLowerCase().includes('image:')) {
      parsedRecipe.image = cleanLine.split(':')[1]?.trim() || '';
    } else if (cleanLine.toLowerCase().includes('prep time:')) {
      parsedRecipe.prepTime = cleanLine.split(':')[1]?.trim() || '';
    } else if (cleanLine.toLowerCase().includes('difficulty:')) {
      parsedRecipe.difficulty = cleanLine.split(':')[1]?.trim() || 'Easy';
    } else if (cleanLine.toLowerCase().includes('category:')) {
      parsedRecipe.category = cleanLine.split(':')[1]?.trim() || '';
    } else if (cleanLine.toLowerCase().includes('dish type:')) {
      parsedRecipe.dishType = cleanLine.split(':')[1]?.trim() || '';
    } else if (cleanLine.toLowerCase().includes('ingredients:')) {
      currentSection = 'ingredients';
    } else if (cleanLine.toLowerCase().includes('instructions:')) {
      currentSection = 'instructions';
      instructionsLines = [];
    } else if (cleanLine.toLowerCase().includes('tags:')) {
      currentSection = 'tags';
    } else if (currentSection === 'ingredients') {
      if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\.\s*/)) {
        parsedRecipe.ingredients.push(cleanLine.replace(/^[-•\d\.]\s*/, ''));
      } else if (cleanLine) {
        parsedRecipe.ingredients.push(cleanLine);
      }
    } else if (currentSection === 'instructions') {
      if (cleanLine && !cleanLine.toLowerCase().match(/^(tags:|ingredients:|recipe name:|chef:|description:|image:|prep time:|difficulty:|category:|dish type:)/)) {
        instructionsLines.push(cleanLine.replace(/^\d+\.\s*/, ''));
      } else if (cleanLine) {
        currentSection = '';
        i--;
      }
    } else if (currentSection === 'tags') {
      if (line.startsWith('-') || line.startsWith('•')) {
        parsedRecipe.tags.push(cleanLine.replace(/^[-•]\s*/, ''));
      } else if (cleanLine && !cleanLine.toLowerCase().match(/^(instructions:|ingredients:|recipe name:|chef:|description:|image:|prep time:|difficulty:|category:|dish type:)/)) {
        parsedRecipe.tags.push(cleanLine);
      } else if (cleanLine) {
        currentSection = '';
        i--;
      }
    }
  }

  if (instructionsLines.length > 0) {
    parsedRecipe.instructions = instructionsLines.join('\n');
  }
  if (parsedRecipe.ingredients.length === 0) parsedRecipe.ingredients = [''];
  if (parsedRecipe.tags.length === 0) parsedRecipe.tags = [''];

  return parsedRecipe;
};

export const readRecipeFile = async (file) => {
  if (!file) throw new Error('No file provided');

  if (file.name.toLowerCase().endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    if (typeof mammoth === 'undefined' || typeof mammoth.extractRawText !== 'function') {
      throw new Error('Mammoth.js is not loaded or extractRawText is not a function!');
    }
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (file.name.toLowerCase().endsWith('.txt')) {
    return await file.text();
  } else {
    throw new Error('Unsupported file type. Please upload a .txt or .docx file.');
  }
};
