import mongoose from 'mongoose';

const GenerationSettingsSchema = new mongoose.Schema({
  active: Boolean,
  systemPromptIdea: String,
  userPromptIdea: Object,
  systemPromptArticle: String,
  userPromptArticle: String,
  userId: String,
});

export default mongoose.model('GenerationSettings', GenerationSettingsSchema);
