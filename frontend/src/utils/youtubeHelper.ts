/**
 * YouTube Helper Utilities
 * Converts YouTube URLs to embeddable iframe formats
 */

/**
 * Extracts video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID (plain ID)
 */
export function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    try {
        // If it's already a video ID (11 characters, alphanumeric and -_)
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }

        // Extract from youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (watchMatch && watchMatch[1]) {
            return watchMatch[1];
        }

        // Extract from youtube.com/embed/VIDEO_ID
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch && embedMatch[1]) {
            return embedMatch[1];
        }
    } catch (error) {
        console.error('Error extracting YouTube video ID:', error);
    }

    return null;
}

/**
 * Converts any YouTube URL format to embeddable iframe src
 * Returns null if the URL is invalid
 */
export function getEmbeddableYouTubeUrl(url: string): string | null {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    if (!url) return true; // Empty is valid (optional field)
    return extractYouTubeVideoId(url) !== null;
}
