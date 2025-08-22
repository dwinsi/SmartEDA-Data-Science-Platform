import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, BookOpen, Code, LineChart, MessagesSquare } from 'lucide-react';
import { ModelPerformanceChart, ClusteringVisualization, FeatureImportanceChart } from './MLVisualizations';
import { CodeExampleCard } from './CodeExample';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Initial learning topics
const mlTopics = [
  {
    title: 'Supervised Learning',
    description: 'Learn about algorithms that use labeled data to make predictions.',
    topics: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forests', 'Support Vector Machines']
  },
  {
    title: 'Unsupervised Learning',
    description: 'Discover patterns and structures in unlabeled data.',
    topics: ['Clustering', 'Dimensionality Reduction', 'Principal Component Analysis', 'K-means']
  },
  {
    title: 'Deep Learning',
    description: 'Explore neural networks and their applications.',
    topics: ['Neural Networks', 'Convolutional Neural Networks', 'Recurrent Neural Networks', 'Transformers']
  },
  {
    title: 'Model Evaluation',
    description: 'Learn how to assess and improve model performance.',
    topics: ['Cross-validation', 'Metrics', 'Bias vs Variance', 'Overfitting and Underfitting']
  }
];

const generateResponse = (_query: string): string => {
  // This is a placeholder. In the future, this will be replaced with RAG-based responses
  const defaultResponses = [
    "That's an interesting question about machine learning! While I'm being enhanced with RAG capabilities, let me provide a general overview...",
    "Great question! I'm currently being updated with more detailed knowledge. In the meantime, here's what I can tell you...",
    "I'm learning more every day! For now, I'd recommend checking out our structured learning paths and documentation..."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export function MLLearnSection() {
  const [messages, setMessages] = useState<Message[]>([{
    text: "👋 Hi! I'm your ML learning assistant. Ask me anything about machine learning concepts, algorithms, or best practices!",
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    // Simulate assistant response
    const assistantMessage: Message = {
      text: generateResponse(inputText),
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputText('');
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    const message: Message = {
      text: `Tell me about ${topic}`,
      isUser: true,
      timestamp: new Date()
    };
    const response: Message = {
      text: generateResponse(topic),
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message, response]);
  };

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#fcfcfc] via-[#a1afd3] to-[#4755a2]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-lg">
              Machine{' '}
              <span className="bg-gradient-to-r from-gradient4 to-gradient6 bg-clip-text text-transparent font-extrabold">
                Learning Explorer
              </span>
            </h1>
            <p className="text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed text-gradient6 drop-shadow">
              Discover, learn, and master machine learning concepts interactively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar with topics */}
            <div className="md:col-span-1 space-y-4">
              <Card className="transition-transform duration-200 hover:shadow-2xl border border-gradient4 bg-gradient1/95">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gradient6">
                    <BookOpen className="h-6 w-6" />
                    Learning Paths
                  </CardTitle>
                  <CardDescription className="text-gradient6/80 text-lg">
                    Explore structured learning paths
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mlTopics.map((topic) => (
                    <div 
                      key={topic.title} 
                      className="p-4 rounded-lg bg-gradient2/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient2/20 space-y-3"
                    >
                      <h3 className="text-xl font-semibold text-gradient6">{topic.title}</h3>
                      <p className="text-base text-gradient6/80">{topic.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.topics.map((subtopic) => (
                          <Button
                            key={subtopic}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTopicSelect(subtopic)}
                            className={`transition-all duration-200 hover:bg-gradient6/10 border-gradient4 ${
                              selectedTopic === subtopic 
                                ? 'bg-gradient6/20 text-gradient6 border-gradient6' 
                                : 'text-gradient6/80 hover:text-gradient6 hover:border-gradient6'
                            }`}
                          >
                            {subtopic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main content area */}
            <div className="md:col-span-2">
              <Card className="transition-transform duration-200 hover:shadow-2xl border border-gradient5 bg-gradient1/95">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gradient6">
                    <MessagesSquare className="h-6 w-6" />
                    Interactive Learning Hub
                  </CardTitle>
                  <CardDescription className="text-gradient6/80 text-lg">
                    Explore ML concepts through interactive learning, visualizations, and examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 p-1 bg-gradient1 rounded-lg">
                      <TabsTrigger 
                        value="chat"
                        className="data-[state=active]:bg-gradient6 data-[state=active]:text-white transition-all duration-200"
                      >
                        <MessagesSquare className="h-4 w-4 mr-2" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger 
                        value="visualizations"
                        className="data-[state=active]:bg-gradient6 data-[state=active]:text-white transition-all duration-200"
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Visualizations
                      </TabsTrigger>
                      <TabsTrigger 
                        value="examples"
                        className="data-[state=active]:bg-gradient6 data-[state=active]:text-white transition-all duration-200"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Examples
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="h-[500px] flex flex-col">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gradient1/50 rounded-lg">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg shadow-lg transition-all duration-200 ${
                                message.isUser
                                  ? 'bg-gradient6 text-white hover:shadow-xl'
                                  : 'bg-gradient2/20 text-gradient6 hover:bg-gradient2/30'
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 p-2 bg-gradient1/50 rounded-lg">
                        <Input
                          placeholder="Ask about any ML concept..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="bg-white/80 border-gradient4 focus:border-gradient6 transition-all duration-200"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-gradient6 hover:bg-gradient6/90 text-white transition-all duration-200"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="visualizations" className="h-[500px] overflow-y-auto p-4">
                      <div className="space-y-8">
                        <div className="p-6 rounded-lg bg-gradient2/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient2/20">
                          <h3 className="text-xl font-semibold text-gradient6 mb-4">Linear Regression Analysis</h3>
                          <ModelPerformanceChart
                            title="Model Performance Comparison"
                            data={[
                              { x: 1, actual: 2, predicted: 2.1 },
                              { x: 2, actual: 4, predicted: 3.9 },
                              { x: 3, actual: 6, predicted: 5.8 },
                              { x: 4, actual: 8, predicted: 8.2 },
                              { x: 5, actual: 10, predicted: 9.7 }
                            ]}
                          />
                          <p className="mt-4 text-gradient6/80">Compare actual vs predicted values in this regression model example.</p>
                        </div>
                        
                        <div className="p-6 rounded-lg bg-gradient3/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient3/20">
                          <h3 className="text-xl font-semibold text-gradient6 mb-4">K-means Clustering Insights</h3>
                          <ClusteringVisualization
                            title="Data Point Clustering"
                            data={[
                              { x: 1, y: 1, cluster: 0 },
                              { x: 2, y: 1, cluster: 0 },
                              { x: 1, y: 2, cluster: 0 },
                              { x: 5, y: 5, cluster: 1 },
                              { x: 6, y: 5, cluster: 1 },
                              { x: 5, y: 6, cluster: 1 }
                            ]}
                          />
                          <p className="mt-4 text-gradient6/80">Visualize how K-means clustering separates data points into distinct groups.</p>
                        </div>

                        <div className="p-6 rounded-lg bg-gradient4/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient4/20">
                          <h3 className="text-xl font-semibold text-gradient6 mb-4">Feature Importance Analysis</h3>
                          <FeatureImportanceChart
                            title="Random Forest Feature Rankings"
                            data={[
                              { feature: "Age", importance: 0.3 },
                              { feature: "Income", importance: 0.25 },
                              { feature: "Education", importance: 0.2 },
                              { feature: "Location", importance: 0.15 },
                              { feature: "Gender", importance: 0.1 }
                            ]}
                          />
                          <p className="mt-4 text-gradient6/80">Understand which features have the most impact on model predictions.</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples" className="h-[500px] overflow-y-auto p-4">
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-gradient2/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient2/20">
                          <CodeExampleCard
                            example={{
                              title: "Linear Regression Implementation",
                              description: "A simple example of implementing linear regression with scikit-learn",
                              language: "python",
                              code: `from sklearn.linear_model import LinearRegression
import numpy as np

# Generate sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
X_new = np.array([[6]])
y_pred = model.predict(X_new)
print(f"Prediction for X=6: {y_pred[0]}")`,
                              output: "Prediction for X=6: 12.0"
                            }}
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-gradient3/10 border border-gradient4/20 transition-all duration-200 hover:bg-gradient3/20">
                          <CodeExampleCard
                            example={{
                              title: "K-means Clustering Example",
                              description: "Implementing k-means clustering for data segmentation",
                              language: "python",
                              code: `from sklearn.cluster import KMeans
import numpy as np

# Generate sample data
X = np.array([[1, 2], [1, 4], [1, 0],
              [4, 2], [4, 4], [4, 0]])

# Create and train the model
kmeans = KMeans(n_clusters=2, random_state=42)
kmeans.fit(X)

# Make predictions
X_new = np.array([[0, 0]])
cluster = kmeans.predict(X_new)
print(f"Cluster assignment: {cluster[0]}")`,
                              output: "Cluster assignment: 0"
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MLLearnSection;