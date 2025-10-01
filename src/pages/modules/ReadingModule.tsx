import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';

export function ReadingModule() {
  const navigate = useNavigate();
  const { updateProgress } = useAuth();
  
  const [currentPassage, setCurrentPassage] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes

  const passages = [
    {
      id: 1,
      title: "The Future of Renewable Energy",
      text: `Renewable energy has emerged as a critical solution to combat climate change and reduce our dependence on fossil fuels. Solar and wind power technologies have experienced remarkable growth in recent years, with costs dropping significantly and efficiency increasing dramatically.

      The International Energy Agency reports that renewable energy sources are now the cheapest option for power generation in most parts of the world. This economic advantage, combined with environmental benefits, has accelerated the global transition toward clean energy.

      However, challenges remain in the widespread adoption of renewable energy. Energy storage solutions are essential to address the intermittent nature of solar and wind power. Battery technology improvements and grid modernization are crucial for creating a reliable renewable energy infrastructure.

      Countries like Denmark and Costa Rica have demonstrated that high percentages of renewable energy in their national grids are achievable. These success stories provide valuable insights for other nations seeking to transition to sustainable energy systems.`,
      questions: [
        {
          id: 'p1q1',
          question: "According to the passage, what has made renewable energy more attractive recently?",
          options: [
            "Increased government regulations",
            "Decreased costs and improved efficiency",
            "Higher fossil fuel prices",
            "Environmental awareness campaigns"
          ]
        },
        {
          id: 'p1q2',
          question: "What challenge does the passage identify for renewable energy adoption?",
          options: [
            "Lack of suitable locations",
            "Public resistance",
            "Energy storage and grid reliability",
            "Limited technology options"
          ]
        },
        {
          id: 'p1q3',
          question: "Which countries are mentioned as examples of renewable energy success?",
          options: [
            "Germany and Japan",
            "Denmark and Costa Rica",
            "Norway and Sweden",
            "Canada and Australia"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "The Impact of Social Media on Modern Communication",
      text: `Social media platforms have fundamentally transformed how people communicate and share information in the 21st century. These digital platforms have created unprecedented opportunities for global connectivity, allowing individuals to maintain relationships across vast distances and access diverse perspectives on current events.

      The immediacy of social media communication has both positive and negative implications. While it enables rapid dissemination of information and real-time interaction, it also contributes to the spread of misinformation and reduces the quality of thoughtful discourse.

      Research indicates that social media usage can affect mental health, particularly among young people. Studies have found correlations between excessive social media use and increased rates of anxiety, depression, and sleep disorders. However, these platforms also provide valuable support networks and resources for individuals facing various challenges.

      The future of social media will likely involve increased regulation and platform responsibility for content moderation. Companies are investing in artificial intelligence and human moderators to address issues related to hate speech, misinformation, and privacy concerns.`,
      questions: [
        {
          id: 'p2q1',
          question: "What positive aspect of social media is mentioned in the passage?",
          options: [
            "Increased productivity",
            "Global connectivity and relationship maintenance",
            "Better educational outcomes",
            "Improved physical health"
          ]
        },
        {
          id: 'p2q2',
          question: "According to the passage, how does social media affect mental health?",
          options: [
            "It only has positive effects",
            "It has no significant impact",
            "It can cause anxiety and depression but also provides support",
            "It only affects older adults"
          ]
        },
        {
          id: 'p2q3',
          question: "What does the passage suggest about the future of social media?",
          options: [
            "Platforms will disappear",
            "Usage will decrease significantly",
            "There will be more regulation and content moderation",
            "New platforms will replace existing ones"
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextPassage = () => {
    if (currentPassage < passages.length - 1) {
      setCurrentPassage(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const totalQuestions = passages.reduce((total, passage) => total + passage.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    const progress = Math.round((answeredQuestions / totalQuestions) * 100);
    updateProgress('reading', progress);
    navigate('/dashboard');
  };

  const currentPassageData = passages[currentPassage];
  const answeredInCurrentPassage = currentPassageData.questions.filter(
    q => answers[q.id]
  ).length;

  return (
    <Layout title="Reading Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Reading Assessment</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-inter">
                Passage {currentPassage + 1} of {passages.length}
              </span>
              <div className="flex items-center space-x-2 text-primary-700">
                <Clock className="w-5 h-5" />
                <span className="font-inter font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary-700" />
                  <h3 className="text-lg font-poppins font-bold text-gray-900">
                    {currentPassageData.title}
                  </h3>
                </div>
                
                <div className="prose max-w-none">
                  <div className="text-gray-800 font-inter leading-relaxed whitespace-pre-line text-justify">
                    {currentPassageData.text}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-poppins font-bold text-gray-900">Questions</h3>
              
              {currentPassageData.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-inter font-medium text-gray-900 mb-4">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-start space-x-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 mt-0.5"
                        />
                        <span className="font-inter text-gray-700 group-hover:text-gray-900 leading-relaxed">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 font-inter">
              {answeredInCurrentPassage} of {currentPassageData.questions.length} questions answered
            </div>
            
            <button
              onClick={nextPassage}
              className="flex items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
            >
              <span>{currentPassage === passages.length - 1 ? 'Submit & Continue' : 'Next Passage'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}