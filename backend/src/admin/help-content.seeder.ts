import { DataSource } from 'typeorm';
import { HelpContent } from '../admin/help-content.entity';

/**
 * Seed script to populate initial help content tutorials
 * Run this after migrations to populate default content
 * These tutorials are "created by admin" via seeding
 */
export async function seedHelpContent(dataSource: DataSource) {
    const helpContentRepository = dataSource.getRepository(HelpContent);

    // Clear existing help content and re-seed with latest tutorials
    await helpContentRepository.clear();

    const tutorials = [
        {
            title: 'Uploading Documents',
            content: `Learn how to upload and organize your reading materials.

Steps:
1. Navigate to the Documents page from the main menu
2. Click the "Upload Document" button
3. Choose a .txt file or paste text directly
4. Add a title and select a category
5. Click "Add Document" to save

You can organize your documents by category and easily access them from the Documents page. Each document can be customized with your preferred reading settings.`,
            category: 'Tutorial',
            order: 1,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Using the Reading Ruler',
            content: `Master the cursor-following reading ruler feature.

Steps:
1. Open any document in the Reader
2. Move your mouse cursor over the text
3. The reading ruler will follow your cursor automatically
4. Adjust ruler height in Settings for comfort
5. Toggle the ruler on/off in Quick Settings

The reading ruler helps you track your position while reading and keeps your focus on the current line. Many users find this feature essential for maintaining reading flow.`,
            category: 'Tutorial',
            order: 2,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Syllable Splitter',
            content: `Understand how the automatic syllable splitter works.

Steps:
1. The syllable splitter is enabled by default
2. Complex words (7+ letters) are automatically split
3. Syllables are color-coded for easy identification
4. Toggle this feature in the Settings page
5. Works in real-time as you read

The syllable splitter breaks down complex words into manageable chunks, helping improve reading comprehension and speed. Words are split using proper English phonetic rules.`,
            category: 'Tutorial',
            order: 3,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Customizing Settings',
            content: `Personalize your reading experience with comprehensive settings.

Steps:
1. Go to Settings from the navigation menu
2. Choose between OpenDyslexic or Arial font
3. Adjust font size using the slider (12-32px)
4. Set line spacing for comfortable reading
5. Select a color scheme that works for you

Find the perfect combination of settings that makes reading most comfortable for you. Your preferences are saved automatically across sessions.`,
            category: 'Tutorial',
            order: 4,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'What is OpenDyslexic font?',
            content: `OpenDyslexic is a specially designed font that helps prevent letter confusion and improves reading for people with dyslexia. The letters have weighted bottoms to prevent rotation and flipping.

This font has been scientifically designed with features like:
- Unique letterforms that are less likely to be confused
- Weighted bottoms to indicate proper letter orientation
- Increased spacing between letters
- Better visual distinction between similar letters

Many users report improved reading speed and reduced fatigue when using OpenDyslexic.`,
            category: 'FAQ',
            order: 1,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'How does the reading ruler help?',
            content: `The reading ruler highlights the line you're reading, helping you maintain focus and prevent losing your place. It follows your cursor automatically and can be customized in height and color.

Benefits:
- Reduces visual stress by focusing attention on one line
- Prevents losing your place when reading
- Customizable height and color for individual preference
- Can be toggled on/off as needed
- Improves reading speed and comprehension`,
            category: 'FAQ',
            order: 2,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Can I adjust the spacing between letters?',
            content: `Yes! Go to Settings and use the Letter Spacing slider to increase or decrease the space between letters. Research shows that increased letter spacing can improve reading speed for people with dyslexia.

Adjusting letter spacing:
- Open Settings from the main menu
- Find the "Letter Spacing" section
- Use the slider to increase or decrease spacing
- Preview changes in real-time
- Changes are applied immediately to all documents`,
            category: 'FAQ',
            order: 3,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'What file formats are supported?',
            content: `Currently, the platform supports .txt (plain text) files. You can also paste text directly into the upload form. Support for more formats is coming soon.

Supported methods:
- Upload .txt files directly
- Paste text from any source
- Text is stored securely on your account
- No file size limits (practical limits apply)

We're working on supporting PDF, DOCX, and other formats in future updates.`,
            category: 'FAQ',
            order: 4,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Are my documents and settings saved?',
            content: `Yes, all your documents and accessibility settings are saved securely. Your preferences will persist across sessions.

What's saved:
- All uploaded documents
- Reading preferences (font, size, color scheme)
- Custom settings for syllable splitter and reading ruler
- Your account information and reading history

Your data is encrypted and stored securely on our servers.`,
            category: 'FAQ',
            order: 5,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Which color scheme should I use?',
            content: `This depends on personal preference. Different color schemes work best for different people:

- Light theme: Standard high-contrast light background with dark text
- Dark theme: Reduces eye strain in low light conditions
- High Contrast: Maximizes readability with enhanced color distinction
- Beige: Provides a warm, comfortable reading experience

Experiment with different themes to find what works best for you. You can change themes at any time from Settings.`,
            category: 'FAQ',
            order: 6,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Troubleshooting: Document Not Uploading',
            content: `If you're having trouble uploading a document:

Common solutions:
1. Check that the file is in .txt format (or paste text directly)
2. Ensure the file is less than 10MB
3. Try refreshing the page and uploading again
4. Check your browser's console for error messages
5. Clear browser cache and try again

If problems persist, please contact support using the Help form.`,
            category: 'Troubleshooting',
            order: 1,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Troubleshooting: Reading Ruler Not Appearing',
            content: `If the reading ruler is not showing:

Steps to resolve:
1. Open Settings and verify "Reading Ruler" is enabled
2. Refresh the page (Ctrl+R or Cmd+R)
3. Make sure you have a document open in the Reader
4. Try moving your mouse over the document text
5. Check browser console for JavaScript errors

If the issue continues, try clearing your browser cache or using a different browser.`,
            category: 'Troubleshooting',
            order: 2,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Troubleshooting: Settings Not Saving',
            content: `If your settings are not being saved:

Troubleshooting steps:
1. Check that you're logged in to your account
2. Verify browser cookies are enabled
3. Try saving again after a page refresh
4. Clear browser cache and reload
5. Check if localStorage is available in your browser

Note: Some browser privacy settings may prevent settings from saving. Consider adjusting your privacy settings or contacting support.`,
            category: 'Troubleshooting',
            order: 3,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Pro Tip: Combine Features',
            content: `Get the most out of Readlexia by combining multiple accessibility features:

Recommended combinations:
- OpenDyslexic font + Increased line spacing + Reading ruler
- Dark theme + Larger font size + Syllable splitter
- High contrast + Letter spacing + Reading ruler
- Beige theme + OpenDyslexic + Increased word spacing

Every user is different. Experiment with different combinations to find what works best for your reading style.`,
            category: 'Tips',
            order: 1,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Pro Tip: Keyboard Shortcuts',
            content: `Speed up your workflow with keyboard shortcuts:

Common shortcuts:
- Ctrl/Cmd + D: Upload a new document
- Ctrl/Cmd + K: Toggle reading ruler
- Ctrl/Cmd + S: Open Settings
- Ctrl/Cmd + H: Open Help
- Ctrl/Cmd + L: Quick settings menu

Learning shortcuts can significantly improve your reading workflow and save time.`,
            category: 'Tips',
            order: 2,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Getting Started Guide',
            content: `Welcome to Readlexia! Here's how to get started:

Your first steps:
1. Create an account or log in
2. Visit the Documents page
3. Upload your first document (.txt file)
4. Open the document in the Reader
5. Customize your settings in the Settings page
6. Explore the Reading Ruler and Syllable Splitter features
7. Return to Help anytime if you need assistance

Don't hesitate to contact support if you have any questions!`,
            category: 'General',
            order: 1,
            isPublished: true,
            videoUrl: null,
        },
        {
            title: 'Accessibility Features Overview',
            content: `Readlexia is designed with dyslexia-friendly features to make reading easier:

Core features:
- OpenDyslexic font: Specially designed to reduce letter confusion
- Reading Ruler: Cursor-following line focus for better tracking
- Syllable Splitter: Automatic word breakdown for complex words
- Customizable colors: Multiple high-contrast color schemes
- Adjustable text size: From 12px to 32px
- Line spacing control: Find your comfortable spacing
- Letter spacing adjustment: Increase spacing for better readability

All features are optional and can be toggled in Settings.`,
            category: 'General',
            order: 2,
            isPublished: true,
            videoUrl: null,
        },
    ];

    try {
        // Save all tutorials
        await helpContentRepository.save(tutorials);
        console.log(`✓ Seeded ${tutorials.length} help content items`);
    } catch (error) {
        console.error('Error seeding help content:', error);
        throw error;
    }
}
