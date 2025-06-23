const articlesService = require('../services/articlesService');
const genericService = require('../services/genericService');

exports.getAllArticles = async (limit, page) => {
  try {
    const offset = page * limit - limit;
    const articles = await articlesService.getAllArticles(limit, offset);
    if (!articles || articles.length === 0) {
      return [];
    }
    return articles;
  } catch (error) {
    throw new Error('something went wrong:', error);
  }
};
exports.getArticleById = async (articleId) => {
  try {
    const article = await articlesService.getArticleById(articleId);
    if (!article || article.length === 0) {
      throw new Error('Article not found');
    }
    return article;
  } catch (error) {
    throw new Error('something went wrong:', error);
  }
};
exports.postArticle= async(data)=>{
   try{
    const articleResult=await genericService.genericPost("articles",data,"articleId");
    return articleResult;
  }
    catch(error){
      throw new Error('internal server error:', error);
    }
};
exports.putArticle= async(articleId,title,content)=>{
   try{ 
    const articleResult=await articlesService.updateArticle(articleId,title,content);
     return articleResult;
  }
    catch(error){
    throw new Error('something went wrong:', error);
    }
};
exports.deleteArticle=async(articleId)=>{
 try {
    const result= await genericService.genericDelete('articles', articleId, 'articleId');
    return result;
  } catch (error) {
    throw new Error('something went wrong:', error);
  }
}