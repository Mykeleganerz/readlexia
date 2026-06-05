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
  Book,
  HelpCircle as HelpIcon,
  AlertTriangle,
  Lightbulb,
  Info,
} from 'lucide-react';
import { getEmbeddableYouTubeUrl } from '../../utils/youtubeHelper';

// Category color mapping with dyslexic-friendly contrast
const categoryColors: Record<
  string,
  {
    bg: string;
    text: string;
    badge: string;
    icon: any;
    gradient: string;
    headerBg: string;
    borderColor: string;
  }
> = {
  Tutorial: {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    badge: 'bg-blue-300 text-blue-900',
    icon: Book,
    gradient: 'from-blue-500 to-blue-600',
    headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    borderColor: 'border-blue-600',
  },
  FAQ: {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    badge: 'bg-purple-300 text-purple-900',
    icon: HelpIcon,
    gradient: 'from-purple-500 to-purple-600',
    headerBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    borderColor: 'border-purple-600',
  },
  Troubleshooting: {
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    badge: 'bg-orange-300 text-orange-900',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-orange-600',
    headerBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    borderColor: 'border-orange-600',
  },
  Tips: {
    bg: 'bg-green-100',
    text: 'text-green-900',
    badge: 'bg-green-300 text-green-900',
    icon: Lightbulb,
    gradient: 'from-green-500 to-green-600',
    headerBg: 'bg-gradient-to-r from-green-500 to-green-600',
    borderColor: 'border-green-600',
  },
  General: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    badge: 'bg-indigo-300 text-indigo-900',
    icon: Info,
    gradient: 'from-indigo-500 to-indigo-600',
    headerBg: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    borderColor: 'border-indigo-600',
  },
};

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
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'OpenDyslexic, sans-serif', letterSpacing: '0.5px' }}
    >
      <Navigation />

      <div
        className="max-w-6xl mx-auto px-6 py-8"
        style={{ lineHeight: '1.8' }}
      >
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={40} className="text-yellow-300" />
            <h1
              className="text-6xl font-bold"
              style={{
                fontFamily: 'OpenDyslexic, sans-serif',
                letterSpacing: '1px',
              }}
            >
              Help & Support
            </h1>
          </div>
          <p
            className="text-indigo-100 text-lg"
            style={{ letterSpacing: '0.3px', lineHeight: '1.8' }}
          >
            Browse tutorials, tips, and resources to help you get the most out
            of Readlexia
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div
            className="mb-8 flex items-center gap-4 bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-xl border-2 border-indigo-300"
            style={{ letterSpacing: '0.3px' }}
          >
            <Filter size={24} className="text-indigo-700 flex-shrink-0" />
            <label
              className="text-base font-semibold text-indigo-900"
              style={{ fontFamily: 'OpenDyslexic, sans-serif' }}
            >
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-400 rounded-lg text-base bg-amber-50 font-medium hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              style={{
                fontFamily: 'OpenDyslexic, sans-serif',
                letterSpacing: '0.3px',
                lineHeight: '1.6',
              }}
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
          <div className="mb-12 space-y-10">
            {sortedCategories.map((category) => {
              const colors = categoryColors[category] || categoryColors.General;
              const IconComponent = colors.icon;

              return (
                <div key={category}>
                  {/* Category Header with Icon */}
                  <div
                    className={`${colors.headerBg} text-white rounded-lg p-6 mb-6 flex items-center gap-4 shadow-lg`}
                    style={{ letterSpacing: '0.5px' }}
                  >
                    <IconComponent size={32} />
                    <h2
                      className="text-4xl font-bold"
                      style={{
                        fontFamily: 'OpenDyslexic, sans-serif',
                        letterSpacing: '1px',
                      }}
                    >
                      {category}
                    </h2>
                  </div>

                  {/* Content Cards Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {groupedContent[category].map((item) => {
                      const embedUrl = item.videoUrl
                        ? getEmbeddableYouTubeUrl(item.videoUrl)
                        : null;

                      return (
                        <div
                          key={item.id}
                          className={`${colors.bg} border-l-4 ${colors.borderColor} rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl`}
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
                          <div
                            className="p-6"
                            style={{
                              backgroundColor: '#faf8f5',
                              fontFamily: 'OpenDyslexic, sans-serif',
                              letterSpacing: '0.3px',
                              lineHeight: '1.8',
                            }}
                          >
                            <div className="flex items-start gap-2 mb-3">
                              {embedUrl && (
                                <Video
                                  size={18}
                                  className="text-red-600 flex-shrink-0 mt-1"
                                />
                              )}
                              <h3
                                className={`text-xl font-bold ${colors.text}`}
                                style={{
                                  fontFamily: 'OpenDyslexic, sans-serif',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                {item.title}
                              </h3>
                            </div>

                            <p
                              className="text-gray-800 mb-4 whitespace-pre-wrap text-base"
                              style={{
                                lineHeight: '1.9',
                                letterSpacing: '0.3px',
                                fontFamily: 'OpenDyslexic, sans-serif',
                              }}
                            >
                              {item.content.substring(0, 150)}
                              {item.content.length > 150 ? '...' : ''}
                            </p>

                            {/* Category Badge */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-block px-3 py-2 ${colors.badge} text-sm font-bold rounded-full`}
                                style={{
                                  fontFamily: 'OpenDyslexic, sans-serif',
                                  letterSpacing: '0.3px',
                                }}
                              >
                                {item.category}
                              </span>
                              {embedUrl && (
                                <span className="text-red-600 text-xs font-semibold flex items-center gap-1">
                                  <Video size={14} /> Video
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-12 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 rounded-xl p-8 text-center shadow-md">
            <AlertCircle className="mx-auto mb-3 text-blue-700" size={48} />
            <p
              className="text-blue-900 font-bold text-xl"
              style={{
                fontFamily: 'OpenDyslexic, sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              No help content available
            </p>
            <p
              className="text-blue-800 text-base mt-2"
              style={{
                fontFamily: 'OpenDyslexic, sans-serif',
                letterSpacing: '0.3px',
                lineHeight: '1.7',
              }}
            >
              Check back soon for tutorials and resources
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div
          className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-10 mb-12 text-white"
          style={{ letterSpacing: '0.4px' }}
        >
          <h2
            className="text-5xl font-bold mb-8 flex items-center gap-3"
            style={{
              fontFamily: 'OpenDyslexic, sans-serif',
              letterSpacing: '1px',
              lineHeight: '1.3',
            }}
          >
            <Lightbulb size={36} className="text-yellow-300" />
            Quick Tips for Better Reading
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/25 backdrop-blur-sm rounded-lg p-5 hover:bg-white/35 transition border border-white/30"
              >
                <div className="flex items-start gap-3">
                  <ChevronRight
                    size={28}
                    className="flex-shrink-0 mt-0.5 text-yellow-300 flex-shrink-0"
                  />
                  <div>
                    <h4
                      className="font-bold mb-2 text-lg"
                      style={{
                        fontFamily: 'OpenDyslexic, sans-serif',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {tip.title}
                    </h4>
                    <p
                      className="text-blue-50 text-base"
                      style={{
                        fontFamily: 'OpenDyslexic, sans-serif',
                        letterSpacing: '0.3px',
                        lineHeight: '1.7',
                      }}
                    >
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div
          className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-xl p-8 shadow-lg"
          style={{ letterSpacing: '0.3px' }}
        >
          <h3
            className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-3"
            style={{
              fontFamily: 'OpenDyslexic, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            <HelpCircle size={28} className="text-green-700" />
            Need More Help?
          </h3>
          <p
            className="text-green-900 mb-6 text-lg"
            style={{
              fontFamily: 'OpenDyslexic, sans-serif',
              letterSpacing: '0.3px',
              lineHeight: '1.8',
            }}
          >
            If you have additional questions or need personalized support,
            please don't hesitate to reach out.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
            style={{
              fontFamily: 'OpenDyslexic, sans-serif',
              letterSpacing: '0.5px',
            }}
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
