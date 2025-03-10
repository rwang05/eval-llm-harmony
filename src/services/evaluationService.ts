
import { toast } from "@/components/ui/use-toast";

export type EvaluationResult = {
  question: string;
  answer: string;
  groundTruth?: string;
  retrievedContext?: string[];
  scores: {
    relevance?: number;
    factualAccuracy?: number;
    coherence?: number;
    fluency?: number;
    recall?: number;
    precision?: number;
    f1Score?: number;
  };
  feedback?: string;
};

export type EvaluationParams = {
  question: string;
  answer: string;
  groundTruth?: string;
  retrievedContext?: string[];
};

// Mock data generator for demonstration purposes
const generateMockScore = () => Number((0.7 + Math.random() * 0.3).toFixed(2));

/**
 * Evaluates a QA pair using simple heuristics
 */
export const evaluateQA = async (params: EvaluationParams): Promise<EvaluationResult> => {
  try {
    console.log("Evaluating QA pair:", params);
    
    // In a real implementation, this would call a more sophisticated evaluation logic
    // This is just a mock implementation
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock scores based on some simple heuristics
    const relevanceScore = generateMockScore();
    const factualScore = generateMockScore();
    const coherenceScore = generateMockScore();
    const fluencyScore = generateMockScore();
    
    // For RAG-specific metrics
    const recallScore = params.retrievedContext ? generateMockScore() : undefined;
    const precisionScore = params.retrievedContext ? generateMockScore() : undefined;
    const f1Score = recallScore && precisionScore 
      ? Number(((2 * recallScore * precisionScore) / (recallScore + precisionScore)).toFixed(2))
      : undefined;
    
    // Simple feedback generator
    const generateFeedback = () => {
      const feedbacks = [
        "The answer addresses the main points of the question.",
        "Some details in the answer could be improved for better accuracy.",
        "The answer is comprehensive and well-structured.",
        "Consider adding more specific information from the retrieved context."
      ];
      return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    };

    return {
      ...params,
      scores: {
        relevance: relevanceScore,
        factualAccuracy: factualScore,
        coherence: coherenceScore,
        fluency: fluencyScore,
        recall: recallScore,
        precision: precisionScore,
        f1Score: f1Score
      },
      feedback: generateFeedback()
    };
  } catch (error) {
    console.error("Evaluation error:", error);
    toast({
      title: "Evaluation Failed",
      description: "There was an error during the evaluation process.",
      variant: "destructive"
    });
    
    // Return partial result with error indication
    return {
      ...params,
      scores: {},
      feedback: "Evaluation failed due to an internal error."
    };
  }
};

/**
 * Batch evaluates multiple QA pairs
 */
export const batchEvaluate = async (paramsArray: EvaluationParams[]): Promise<EvaluationResult[]> => {
  try {
    const results = await Promise.all(paramsArray.map(params => evaluateQA(params)));
    return results;
  } catch (error) {
    console.error("Batch evaluation error:", error);
    toast({
      title: "Batch Evaluation Failed",
      description: "There was an error during the batch evaluation process.",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Calculate aggregate scores across multiple evaluation results
 */
export const calculateAggregateScores = (results: EvaluationResult[]) => {
  if (!results.length) return {};
  
  const aggregates: Record<string, number> = {};
  const scoreTypes = ['relevance', 'factualAccuracy', 'coherence', 'fluency', 'recall', 'precision', 'f1Score'];
  
  scoreTypes.forEach(type => {
    const validScores = results
      .map(r => r.scores[type as keyof typeof r.scores])
      .filter(score => score !== undefined) as number[];
    
    if (validScores.length > 0) {
      const sum = validScores.reduce((acc, score) => acc + score, 0);
      aggregates[type] = Number((sum / validScores.length).toFixed(2));
    }
  });
  
  return aggregates;
};
