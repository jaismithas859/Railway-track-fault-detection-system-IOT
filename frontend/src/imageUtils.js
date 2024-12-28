const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const downloadImage = async (imageUrl) => {
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
        try {
            const response = await fetch(imageUrl, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Empty image received');
            }

            return URL.createObjectURL(blob);
        } catch (error) {
            attempts++;
            console.warn(`Attempt ${attempts} failed:`, error.message);
            
            if (attempts === MAX_RETRIES) {
                console.error('Max retries reached:', error);
                throw error;
            }
            
            await sleep(RETRY_DELAY);
        }
    }
};