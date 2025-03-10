
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { EvaluationResult, evaluateQA, batchEvaluate, calculateAggregateScores } from "@/services/evaluationService";

const sampleQuestion = "How do neural networks learn from data?";
const sampleAnswer = "Neural networks learn from data through a process called backpropagation. This algorithm adjusts the weights of connections between neurons based on the error in the network's output. During training, the network makes predictions, calculates the error against known outputs, and then propagates this error backward through the network to update weights. This iterative process minimizes the error over time, allowing the network to recognize patterns and make accurate predictions on new data.";
const sampleContext = [
  "Neural networks consist of layers of interconnected nodes, and learn by adjusting connection weights.",
  "Backpropagation is the primary algorithm used to train neural networks by calculating gradients.",
  "Training data is fed through the network in batches to optimize the learning process."
];

const Index = () => {
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [question, setQuestion] = useState(sampleQuestion);
  const [answer, setAnswer] = useState(sampleAnswer);
  
  const runSampleEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const result = await evaluateQA({
        question,
        answer,
        retrievedContext: sampleContext
      });
      
      setEvaluationResults([result]);
      toast({
        title: "Evaluation Complete",
        description: "Sample evaluation has been processed successfully."
      });
    } catch (error) {
      console.error("Error running evaluation:", error);
      toast({
        title: "Evaluation Failed",
        description: "There was an error running the evaluation.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const renderScoreCard = (label: string, score?: number) => {
    if (score === undefined) return null;
    
    let colorClass = "text-yellow-500";
    if (score >= 0.8) colorClass = "text-green-500";
    else if (score < 0.6) colorClass = "text-red-500";
    
    return (
      <div className="flex flex-col items-center p-4 border rounded-lg">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">LLM Evaluation Platform</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Evaluate the quality of AI-generated answers with comprehensive metrics and insights.
        </p>
      </div>

      <Tabs defaultValue="evaluate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evaluate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question & Answer Evaluation</CardTitle>
              <CardDescription>
                Enter a question-answer pair to evaluate its quality and accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <Textarea 
                  placeholder="Enter your question here..." 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <Textarea 
                  placeholder="Enter the answer to evaluate..." 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              
              <Button 
                onClick={runSampleEvaluation} 
                disabled={isEvaluating}
                className="w-full"
              >
                {isEvaluating ? "Evaluating..." : "Run Evaluation"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {evaluationResults.length > 0 ? (
            <div className="space-y-6">
              {evaluationResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>Evaluation Results</CardTitle>
                    <CardDescription>
                      Quality assessment for the provided question and answer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Question:</h3>
                      <p className="p-3 bg-gray-50 rounded-md">{result.question}</p>
                      
                      <h3 className="font-medium mb-2 mt-4">Answer:</h3>
                      <p className="p-3 bg-gray-50 rounded-md">{result.answer}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-4">Quality Scores:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {renderScoreCard("Relevance", result.scores.relevance)}
                        {renderScoreCard("Factual Accuracy", result.scores.factualAccuracy)}
                        {renderScoreCard("Coherence", result.scores.coherence)}
                        {renderScoreCard("Fluency", result.scores.fluency)}
                        {result.scores.recall !== undefined && renderScoreCard("Recall", result.scores.recall)}
                        {result.scores.precision !== undefined && renderScoreCard("Precision", result.scores.precision)}
                        {result.scores.f1Score !== undefined && renderScoreCard("F1 Score", result.scores.f1Score)}
                      </div>
                    </div>
                    
                    {result.feedback && (
                      <div>
                        <h3 className="font-medium mb-2">Feedback:</h3>
                        <p className="p-3 bg-blue-50 rounded-md">{result.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 mb-4">No evaluation results yet</p>
                <Button onClick={() => document.querySelector('[value="evaluate"]')?.dispatchEvent(new Event('click'))}>
                  Go to Evaluation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
