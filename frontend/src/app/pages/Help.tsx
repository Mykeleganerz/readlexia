import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { ContactSupportModal } from '../components/ContactSupportModal';
import {
  helpContentService,
  HelpContent,
} from '../../services/help-content.service';
import { errorLogger } from '../../utils/errorLogger';
import {
  ChevronRight,
  HelpCircle,
  Video,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { getEmbeddableYouTubeUrl } from '../../utils/youtubeHelper';

export function Help() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [isLoadingHelp, setIsLoadingHelp] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchHelpContent = async () => {
      try {
        setIsLoadingHelp(true);
        const content = await helpContentService.getAll();
        // Sort by category and order
        const sorted = content.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.order - b.order;
        });
        setHelpContent(sorted);
      } catch (error) {
        errorLogger.error('Failed to fetch help content', { error });
        // Continue with empty state instead of showing error
      } finally {
        setIsLoadingHelp(false);
      }
    };

    if (user) {
      fetchHelpContent();
    }
  }, [user]);

  if (!user) return null;

  // Extract unique categories from content
  const categories = [
    'All',
    ...new Set(helpContent.map((item) => item.category)),
  ];

  // Filter content based on selected category
  const filteredContent =
    selectedCategory === 'All'
      ? helpContent
      : helpContent.filter((item) => item.category === selectedCategory);

  // Group filtered content by category
  const groupedContent = filteredContent.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, HelpContent[]>,
  );

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedContent).sort();

  const quickTips = [
    {
      title: 'Take Regular Breaks',
      description: 'Rest your eyes every 20-30 minutes to reduce fatigue',
    },
    {
      title: 'Experiment with Settings',
      description:
        'Try different fonts and color schemes to find what works best',
    },
    {
      title: 'Use the Reading Ruler',
      description: 'Follow along with your cursor to maintain focus',
    },
    {
      title: 'Adjust Line Spacing',
      description:
        'Increased spacing can significantly improve reading comfort',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Browse tutorials, tips, and resources to help you get the most out
            of Readlexia
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-8 flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Help Content from Database */}
        {isLoadingHelp ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading help content...</p>
          </div>
        ) : sortedCategories.length > 0 ? (
          <div className="mb-12 space-y-8">
            {sortedCategories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {groupedContent[category].map((item) => {
                    const embedUrl = item.videoUrl
                      ? getEmbeddableYouTubeUrl(item.videoUrl)
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                      >
                        {/* Video Embed */}
                        {embedUrl && (
                          <div className="w-full bg-black">
                            <iframe
                              width="100%"
                              height="240"
                              src={embedUrl}
                              title={item.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start gap-2 mb-3">
                            {embedUrl && (
                              <Video
                                size={18}
                                className="text-purple-600 flex-shrink-0"
                              />
                            )}
                            <h3 className="text-lg font-bold text-gray-800">
                              {item.title}
                            </h3>
                          </div>

                          <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>

                          {/* Category Badge */}
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-blue-600" size={32} />
            <p className="text-blue-900 font-semibold">
              No help content available
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Check back soon for tutorials and resources
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-6">
            Quick Tips for Better Reading
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <ChevronRight size={24} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">{tip.title}</h4>
                  <p className="text-blue-100">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            Need More Help?
          </h3>
          <p className="text-blue-800 mb-4">
            If you have additional questions or need personalized support,
            please don't hesitate to reach out.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Optional: Refresh help content or other actions after successful submission
        }}
      />
    </div>
  );
}
