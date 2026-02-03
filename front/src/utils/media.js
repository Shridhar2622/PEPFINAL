/**
 * Resolves a media path to a full backend URL or returns it as is if it's already an absolute URL.
 * @param {string} path - The media path stored in the database.
 * @param {string} type - Optional type ('avatar', 'header', 'document') for specific fallbacks.
 * @returns {string} - The full URL to the media.
 */
export const getMediaUrl = (path, name = 'User') => {
    if (!path || path === 'default.jpg') {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }

    if (path.startsWith('http')) {
        return path;
    }

    // Strip /api/v1 if exists to get base server URL
    const baseUrl = import.meta.env.VITE_API_URL?.split('/api')[0] || 'http://localhost:5000';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${baseUrl}/${cleanPath}`;
};

/**
 * Checks if a file path points to a PDF.
 * @param {string} path 
 * @returns {boolean}
 */
export const isPdf = (path) => {
    return path?.toLowerCase().endsWith('.pdf');
};
