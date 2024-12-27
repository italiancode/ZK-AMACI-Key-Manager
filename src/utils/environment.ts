export const isExtension = (): boolean => {
  return !!(window.chrome && chrome.runtime && chrome.runtime.id);
};

export const getEnvironmentType = (): 'extension' | 'web' => {
  return isExtension() ? 'extension' : 'web';
}; 