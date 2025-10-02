export async function loadPartial(containerId, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading partial from ${url}:`, error);
  }
}

export function showError(message) {
  alert(`Error: ${message}`);
}

export function showLoading(message = 'Loading...') {
  console.log(message);
}

export function hideLoading() {
  console.log('Loading complete');
}

/**
 * API returns hyperlinks in instructions, this function removes them, looks better
 */
export function removeHyperlinks(htmlString) {
  if (!htmlString) return '';
  
 
  return htmlString.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
}
